import { Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  model?: string;
  elapsedTime?: number;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group w-full`}>
      <div className={`flex gap-3 md:gap-4 max-w-[95%] md:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
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
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0`}>
          <div className={`rounded-2xl px-4 md:px-5 py-2.5 md:py-3 text-sm leading-relaxed bg-transparent text-gray-200 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.images && message.images.length > 0 && (
              <div className={`flex flex-wrap gap-2 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {message.images.map((img, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl max-w-full">
                    <img src={img} alt="Uploaded" className="max-w-full md:max-w-md max-h-[300px] md:max-h-[400px] object-contain" />
                  </div>
                ))}
              </div>
            )}
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          
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

