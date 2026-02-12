import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image?: string;
  imageModel?: string;
}

interface ChatMessagesProps {
  messages: Message[];
}

export const ChatMessages = ({ messages }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="w-full max-w-3xl lg:max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-4 items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {message.role === 'assistant' && (
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center flex-shrink-0 mt-1">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          )}
          
          <div
            className={`max-w-[80%] px-4 py-3 ${
              message.role === 'user'
                ? 'text-white text-right'
                : 'text-gray-100'
            }`}
          >
            {!message.image && (
              <p className="font-satoshi font-normal text-base leading-[100%] tracking-[0px] whitespace-pre-wrap">{message.content}</p>
            )}
            
            {message.image && (
              <div className={message.role === 'user' ? 'flex flex-col items-end' : ''}>
                <img 
                  src={message.image} 
                  alt="Generated content"
                  className="w-[300px] h-[200px] object-cover rounded-[10px]"
                  style={{ opacity: 1 }}
                />
                {message.imageModel && (
                  <ModelTooltip modelName={message.imageModel} />
                )}
              </div>
            )}
          </div>

          {message.role === 'user' && (
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center flex-shrink-0 mt-1">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User`}
                alt="User Avatar"
                className="h-full w-full rounded-full"
              />
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};


interface ModelTooltipProps {
  modelName: string;
}

const ModelTooltip = ({ modelName }: ModelTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  
  useEffect(() => {
    if (isOpen && tooltipRef.current) {
      setTimeout(() => {
        tooltipRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [isOpen]);

  const getModelExplanation = (model: string): string => {
    const explanations: Record<string, string> = {
      'DALL-E': 'DALL-E was chosen for its exceptional ability to generate high-quality, creative images from text descriptions. It excels at understanding complex prompts and producing photorealistic results with accurate details and artistic coherence.',
      'Stable Diffusion': 'Stable Diffusion was selected for its fast generation speed and ability to create detailed, artistic images. It offers great control over style and composition while maintaining high quality output.',
      'Midjourney': 'Midjourney was chosen for its artistic style and ability to create visually stunning, creative imagery. It excels at producing aesthetically pleasing results with unique artistic interpretations.',
    };

    return explanations[model] || `${model} was automatically selected based on your prompt requirements for optimal image generation quality and style.`;
  };

  return (
    <div className="relative inline-block mt-2" ref={tooltipRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-gray-500 hover:text-gray-400 flex items-center gap-1 font-satoshi transition-colors cursor-pointer group"
      >
        <span className="inline-block w-3 h-3">✨</span>
        <span className="border-b border-dashed border-gray-600 group-hover:border-gray-500">
          Generated using {modelName}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 md:w-96 lg:w-[28rem] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div 
            className="border border-white/10 rounded-lg p-3 sm:p-4 shadow-xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1A1A1A 0%, #1e2a3a 50%, #1A1A1A 100%)',
            }}
          >
            <div 
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent 70%)',
              }}
            />

            <div className="flex items-start justify-between mb-2 sm:mb-3 relative z-10">
              <h4 className="text-xs sm:text-sm font-semibold text-white font-satoshi">
                Why {modelName}?
              </h4>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-white transition-colors -mt-0.5"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-[11px] sm:text-xs md:text-sm text-gray-300 leading-relaxed font-satoshi relative z-10">
              {getModelExplanation(modelName)}
            </p>

            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/5 relative z-10">
              <span className="text-[10px] sm:text-xs text-gray-500 font-satoshi">
                Auto-selected for optimal results
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

