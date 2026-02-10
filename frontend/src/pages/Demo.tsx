import { useState, useRef, useEffect } from 'react';
import { fetchTools, processWithGemini } from '@/services/api';
import type { ToolCategory, ModelInfo } from '@/services/api';
import { toast } from '@/components/ui/sonner';
import { 
  Menu,
  Loader2,
} from 'lucide-react';

// Modular Components
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { TrendingModels } from '@/components/chat/TrendingModels';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  images?: string[]; // User-uploaded images (base64 data URLs)
  generatedImages?: string[]; // Generated images (URLs)
  model?: string;
  elapsedTime?: number;
  reasoning?: string;
}

const Demo = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tools, setTools] = useState<ToolCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [hasManualSelection, setHasManualSelection] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await fetchTools();
        if (!mounted) return;
        setTools(all);

        // Don't set defaults - let backend auto-select
        // User can manually select if they want
      } catch (e: any) {
        console.warn('Failed to fetch tools for demo model selector:', e?.message || e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);

    const newPreviews: string[] = [];
    newImages.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newPreviews.push(result);
        if (newPreviews.length === newImages.length) {
          setImagePreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim() && images.length === 0) {
      toast.error('Please enter a prompt or upload an image!');
      return;
    }

    const currentPrompt = prompt;
    const currentPreviews = [...imagePreviews];
    
    const userMessage: Message = {
      role: 'user',
      content: currentPrompt,
      images: currentPreviews.length > 0 ? currentPreviews : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setImages([]);
    setImagePreviews([]);
    setLoading(true);

    try {
      const imageDataUrls: string[] = [];
      for (const file of images) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        imageDataUrls.push(base64);
      }

      const request: any = {
        prompt: currentPrompt,
        images: imageDataUrls.length > 0 ? imageDataUrls : undefined,
      };

      // Only send category/model if user explicitly selected one
      // Otherwise, backend will auto-select the best model based on prompt analysis
      if (!request.images && hasManualSelection && selectedCategory && selectedModel) {
        request.category = selectedCategory;
        request.model = selectedModel;
      }

      const response = await processWithGemini(request);

      // Log to verify reasoning is in response
      if (!response.reasoning) {
        console.warn('No reasoning in response:', response);
      }

      let cleanText = response.text || '';
      
      // Additional client-side parsing, diff models have diff output formats
      if (cleanText.includes('"data":') && cleanText.includes('"output":')) {
        try {
          const parsed = JSON.parse(cleanText);
          if (parsed?.data?.output) {
            cleanText = parsed.data.output;
          }
        } catch {
          // ;-;
        }
      }

      // Extract generated images from response data
      let generatedImages: string[] = [];
      if (response.data) {
        try {
          // Check if data has images array (fal.ai image generation format)
          if (response.data.images && Array.isArray(response.data.images)) {
            generatedImages = response.data.images
              .map((img: any) => img.url || img)
              .filter((url: string) => url && typeof url === 'string');
          }
          // Check if data itself is an array of images
          else if (Array.isArray(response.data) && response.data.length > 0 && response.data[0]?.url) {
            generatedImages = response.data
              .map((img: any) => img.url || img)
              .filter((url: string) => url && typeof url === 'string');
          }
          // Check if data has a single image URL
          else if (response.data.url && typeof response.data.url === 'string') {
            generatedImages = [response.data.url];
          }
        } catch (e) {
          console.warn('Failed to extract images from response:', e);
        }
      }

      // If backend returned structured data (e.g. fal-ai images/videos/tts), show a readable summary
      if (!cleanText && response.data && generatedImages.length === 0) {
        try {
          cleanText = JSON.stringify(response.data, null, 2);
        } catch {
          cleanText = String(response.data);
        }
      }

      // If we have generated images, show a simple message
      if (generatedImages.length > 0 && !cleanText) {
        cleanText = `Generated ${generatedImages.length} image${generatedImages.length > 1 ? 's' : ''}`;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: cleanText || '(no output)',
        generatedImages: generatedImages.length > 0 ? generatedImages : undefined,
        model: response.selectedModel || response.model || selectedModel,
        elapsedTime: response.elapsedTime,
        reasoning: response.reasoning || undefined
      };

      // Debug: Log reasoning
      console.log('Response reasoning:', response.reasoning);
      console.log('Message reasoning:', assistantMessage.reasoning);
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Request error:', err);
      toast.error('Processing failed', {
        description: err.message || 'Failed to process request',
      });
    } finally {
      setLoading(false);
    }
  };

  const trendingModels = [
    {
      name: 'Claude v2.1',
      description: 'This a low latency version of Claude v2.1.',
      icon: '',
    },
    {
      name: 'Gpt-3.5 Turbo',
      description: "GPT-3.5 Turbo is OpenAI's fastest model.",
      icon: '',
    },
    {
      name: 'Llava 13B',
      description: 'Llava is a large multimodal model that combines a vision...',
      icon: '',
    },
    {
      name: 'Zephyr',
      description: 'Zephyr is a series of language models that are trained to act.',
      icon: '',
    },
  ];

  const modelsForSelectedCategory: ModelInfo[] =
    tools.find(t => t.category === selectedCategory)?.models || [];

  return (
    <div className="min-h-screen bg-black text-white flex">
      <ChatSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:ml-64 min-h-screen relative overflow-hidden">
        {/* Top Bar */}
        <header className="px-4 md:px-8 py-4 flex items-center justify-between bg-black/50 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <img src="/credits.png" alt="Credits" className="w-3.5 h-3.5 object-contain" />
              <span className="text-[10px] md:text-xs font-medium">5000</span>
            </div>
            
            <div className="flex items-center gap-2 p-1 pr-2 md:pr-3 rounded-full bg-white/5 border border-white/10">
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full overflow-hidden border border-white/20">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Tejas" alt="User" className="w-full h-full object-cover" />
              </div>
              <Menu className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 md:py-12 scrollbar-hide pb-64 md:pb-80">
          <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 w-full">
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
                <h2 className="text-3xl md:text-5xl font-tobias font-light mb-12 md:mb-24 tracking-tight">Welcome to Novi.AI</h2>
              </div>
            )}

            {messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))}

            {loading && (
              <div className="flex gap-4 items-start animate-in fade-in duration-500">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                </div>
                <div className="flex gap-1.5 mt-4">
                  <div className="w-1 h-1 bg-white/20 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1 h-1 bg-white/20 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1 h-1 bg-white/20 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed Bottom Area */}
        <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 md:p-8 bg-gradient-to-t from-black via-black to-transparent z-20 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
            
            {/* Trending Models Section */}
            {messages.length === 0 && (
              <TrendingModels models={trendingModels} />
            )}

            {/* Task + Model Selector */}
            {tools.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide no-scrollbar">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedModel('');
                      setHasManualSelection(false);
                    }}
                    className={`px-3 py-1.5 rounded-full text-[11px] border transition-colors whitespace-nowrap ${
                      !hasManualSelection
                        ? 'bg-white/10 border-white/20 text-white'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    Auto-select
                  </button>
                  {tools.map((t) => (
                    <button
                      key={t.category}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(t.category);
                        setSelectedModel(t.models?.[0]?.name || '');
                        setHasManualSelection(true);
                      }}
                      className={`px-3 py-1.5 rounded-full text-[11px] border transition-colors whitespace-nowrap ${
                        selectedCategory === t.category && hasManualSelection
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {t.category}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 overflow-x-auto scrollbar-hide no-scrollbar">
                  {hasManualSelection && modelsForSelectedCategory.map((m) => (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => {
                        setSelectedModel(m.name);
                        setHasManualSelection(true);
                      }}
                      className={`px-3 py-1.5 rounded-full text-[11px] border transition-colors whitespace-nowrap ${
                        selectedModel === m.name
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                      title={m.pros?.[0] || m.description}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Box */}
            <ChatInput 
              prompt={prompt}
              setPrompt={setPrompt}
              handleSubmit={handleSubmit}
              loading={loading}
              handleImageChange={handleImageChange}
              imagePreviews={imagePreviews}
              removeImage={removeImage}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Demo;
