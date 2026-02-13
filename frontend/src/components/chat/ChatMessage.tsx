import { Sparkles, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useEffect, useRef } from 'react';
import type { ToolCategory } from '@/services/api';

interface VideoData {
  video: {
    url: string;
    content_type?: string;
    file_name?: string;
    width?: number;
    height?: number;
    fps?: number;
    duration?: number;
    num_frames?: number;
  };
  video_id?: string;
  thumbnail?: {
    url: string;
    content_type?: string;
    file_name?: string;
    width?: number;
    height?: number;
  };
  spritesheet?: {
    url: string;
    content_type?: string;
    file_name?: string;
    width?: number;
    height?: number;
  };
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  images?: string[]; // User-uploaded images (base64 data URLs)
  generatedImages?: string[]; // Generated images (URLs)
  video?: VideoData; // Generated video data
  model?: string;
  category?: string; // Store category for filtering regenerate models
  elapsedTime?: number;
  reasoning?: string;
  originalPrompt?: string; // Store original prompt for regeneration
  originalImages?: string[]; // Store original images for regeneration
}

interface ChatMessageProps {
  message: Message;
  onRegenerate?: (category: string, model: string) => void;
  tools?: ToolCategory[];
}

export const ChatMessage = ({ message, onRegenerate, tools = [] }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const [showModelSelector, setShowModelSelector] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        selectorRef.current && 
        !selectorRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setShowModelSelector(false);
      }
    };

    if (showModelSelector) {
      // Use a small delay to ensure click events on buttons fire first
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showModelSelector]);

  const handleRegenerate = (category: string, model: string) => {
    console.log('handleRegenerate called:', { category, model, hasOnRegenerate: !!onRegenerate });
    if (onRegenerate) {
      // Close dropdown first to give visual feedback
      setShowModelSelector(false);
      // Then call regenerate (use setTimeout to ensure state update happens first)
      setTimeout(() => {
        onRegenerate(category, model);
      }, 0);
    } else {
      console.warn('onRegenerate is not defined');
    }
  };

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group w-full max-w-full`}>
      <div className={`flex gap-3 md:gap-4 w-full max-w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden border border-white/10">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Tejas" alt="User" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0 flex-1 max-w-full overflow-hidden`}>
          <div className={`rounded-2xl px-4 md:px-5 py-2.5 md:py-3 text-sm leading-relaxed bg-transparent text-gray-200 w-full max-w-full overflow-hidden ${isUser ? 'text-right' : 'text-left'}`}>
            {/* User-uploaded images */}
            {message.images && message.images.length > 0 && (
              <div className={`flex flex-wrap gap-2 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {message.images.map((img, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl max-w-full">
                    <img src={img} alt="Uploaded" className="max-w-full md:max-w-md max-h-[300px] md:max-h-[400px] object-contain" />
                  </div>
                ))}
              </div>
            )}
            {/* Generated images (from AI) */}
            {message.generatedImages && message.generatedImages.length > 0 && (
              <div className={`flex flex-wrap gap-3 md:gap-4 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {message.generatedImages.map((imgUrl, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden border border-white/20 shadow-2xl group/img">
                    <img 
                      src={imgUrl} 
                      alt={`Generated ${i + 1}`} 
                      className="max-w-full md:max-w-lg max-h-[400px] md:max-h-[500px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(imgUrl, '_blank')}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                      <a 
                        href={imgUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white hover:bg-black/70"
                      >
                        Open
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Generated video (from AI) */}
            {message.video && message.video.video?.url ? (
              <div className={`flex flex-wrap gap-3 md:gap-4 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className="relative rounded-xl overflow-hidden border border-white/20 shadow-2xl group/video max-w-full bg-black/20" style={{ minHeight: '200px' }}>
                  <video 
                    src={message.video.video.url}
                    controls
                    playsInline
                    poster={message.video.thumbnail?.url}
                    className="max-w-full md:max-w-2xl max-h-[500px] md:max-h-[600px] w-full h-auto object-contain cursor-pointer"
                    preload="metadata"
                    style={{ display: 'block', width: '100%', maxWidth: '800px' }}
                    onError={(e) => {
                      console.error('Video load error:', e);
                      const target = e.target as HTMLVideoElement;
                      console.error('Video error details:', target.error);
                    }}
                  >
                    <source src={message.video.video.url} type={message.video.video.content_type || "video/mp4"} />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute top-2 right-2 opacity-0 group-hover/video:opacity-100 transition-opacity z-10">
                    <a 
                      href={message.video.video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white hover:bg-black/70"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Open
                    </a>
                  </div>
                </div>
              </div>
            ) : message.video ? (
              <div className="text-red-400 text-xs mb-2">
                Video data present but URL missing. Debug: {JSON.stringify(message.video).substring(0, 100)}
              </div>
            ) : null}
            {/* Only show text content if there's no video */}
            {!(message.video && message.video.video?.url) && (
              <div className="prose prose-invert prose-sm max-w-full break-words overflow-wrap-anywhere word-break-break-word overflow-hidden">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-3 last:mb-0 break-words overflow-wrap-anywhere">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 break-words overflow-wrap-anywhere">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 break-words overflow-wrap-anywhere">{children}</ol>,
                    li: ({ children }) => <li className="break-words overflow-wrap-anywhere">{children}</li>,
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-2 mt-4 first:mt-0 break-words overflow-wrap-anywhere">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-4 first:mt-0 break-words overflow-wrap-anywhere">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-bold mb-2 mt-3 first:mt-0 break-words overflow-wrap-anywhere">{children}</h3>,
                    code: ({ children, className }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono break-all overflow-wrap-anywhere">{children}</code>
                      ) : (
                        <code className={className}>{children}</code>
                      );
                    },
                    pre: ({ children }) => (
                      <pre className="bg-white/5 border border-white/10 rounded-lg p-3 overflow-x-auto mb-3 break-all max-w-full">
                        {children}
                      </pre>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-white/20 pl-4 italic my-3 break-words overflow-wrap-anywhere">{children}</blockquote>
                    ),
                    a: ({ href, children }) => (
                      <a href={href} className="text-blue-400 hover:text-blue-300 underline break-all overflow-wrap-anywhere" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    strong: ({ children }) => <strong className="font-bold break-words overflow-wrap-anywhere">{children}</strong>,
                    em: ({ children }) => <em className="italic break-words overflow-wrap-anywhere">{children}</em>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
          
          {!isUser && message.reasoning && (
            <div className="mt-3 px-4 md:px-5 w-full max-w-full">
              <div className="text-xs md:text-sm text-gray-100 bg-blue-500/20 border border-blue-400/40 rounded-lg px-4 py-3 shadow-lg max-w-full">
                <div className="flex items-start gap-2 max-w-full">
                  <span className="font-bold text-blue-300 flex-shrink-0">Why this model:</span>
                  <span className="text-gray-50 flex-1 break-words overflow-wrap-anywhere">{message.reasoning}</span>
                </div>
              </div>
            </div>
          )}
          {!isUser && (
            <div className="flex items-center justify-between mt-1 md:mt-2 px-4 md:px-5">
              <div className="flex items-center gap-3 text-[9px] md:text-[10px] text-white/20">
                {message.model && <span className="uppercase tracking-widest">{message.model}</span>}
                {message.elapsedTime && <span>• {message.elapsedTime.toFixed(1)}S</span>}
              </div>
              {onRegenerate && (
                <>
                  <div className="relative" ref={selectorRef}>
                    <button
                      onClick={() => setShowModelSelector(!showModelSelector)}
                      className="flex items-center gap-1.5 px-2 py-1 text-[10px] md:text-xs text-gray-400 hover:text-white transition-colors rounded-md hover:bg-white/5"
                      title="Regenerate with different model"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                  {showModelSelector && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-[9998]" 
                        onMouseDown={(e) => {
                          // Only close if clicking directly on backdrop, not if event bubbled from dropdown
                          if (e.target === e.currentTarget) {
                            setShowModelSelector(false);
                          }
                        }}
                      />
                      {/* Dropdown */}
                      <div 
                        ref={dropdownRef}
                        className="fixed bg-black border border-white/20 rounded-lg p-3 shadow-2xl z-[9999] min-w-[300px] max-h-[400px] overflow-y-auto"
                        style={{
                          top: selectorRef.current ? `${selectorRef.current.getBoundingClientRect().top - 10}px` : '50%',
                          right: selectorRef.current ? `${window.innerWidth - selectorRef.current.getBoundingClientRect().right}px` : '20px',
                          transform: selectorRef.current && selectorRef.current.getBoundingClientRect().top < 200 ? 'translateY(0)' : 'translateY(-100%)',
                          maxWidth: 'calc(100vw - 40px)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                      <div className="text-xs font-semibold text-white mb-2">Select a model:</div>
                      <div className="space-y-1">
                        {(() => {
                          // Filter tools to only show models from the same category as the message
                          const messageCategory = message.category;
                          const filteredTools = messageCategory 
                            ? tools.filter(tool => tool.category === messageCategory)
                            : tools;
                          
                          if (filteredTools.length === 0) {
                            return (
                              <div className="text-xs text-gray-400 px-2 py-2">
                                No models available for this task
                              </div>
                            );
                          }
                          
                          return filteredTools.map((tool) => (
                            <div key={tool.category} className="mb-3">
                              {!messageCategory && (
                                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 px-1">
                                  {tool.category}
                                </div>
                              )}
                              {tool.models.map((model) => (
                                <button
                                  key={model.name}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Button clicked:', { category: tool.category, model: model.name });
                                    handleRegenerate(tool.category, model.name);
                                  }}
                                  className="w-full text-left px-2 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                                >
                                  {model.name}
                                </button>
                              ))}
                            </div>
                          ));
                        })()}
                      </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowModelSelector(false);
                          }}
                          className="mt-2 w-full px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

