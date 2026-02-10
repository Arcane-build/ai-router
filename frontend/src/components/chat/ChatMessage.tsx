import { Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  images?: string[]; // User-uploaded images (base64 data URLs)
  generatedImages?: string[]; // Generated images (URLs)
  model?: string;
  elapsedTime?: number;
  reasoning?: string;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

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
          {!isUser && (message.model || message.elapsedTime) && (
            <div className="flex items-center gap-3 text-[9px] md:text-[10px] text-white/20 mt-1 md:mt-2 px-4 md:px-5">
              {message.model && <span className="uppercase tracking-widest">{message.model}</span>}
              {message.elapsedTime && <span>• {message.elapsedTime.toFixed(1)}S</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

