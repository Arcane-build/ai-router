import { Plus, Mic, SlidersHorizontal, ArrowUp } from 'lucide-react';
import { useRef } from 'react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
}

export const PromptInput = ({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder = "Ask anything. I'll automatically choose the best AI for the job." 
}: PromptInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(e);
    }
  };

  return (
    <div className="w-full relative group rounded-xl sm:rounded-2xl p-[1px] transition-all duration-700 ease-in-out bg-[linear-gradient(90deg,#3b82f6_0%,#3b82f6_45%,rgba(255,255,255,0.05)_55%,rgba(255,255,255,0.05)_100%)] bg-[length:250%_100%] bg-[100%_0%] focus-within:bg-[0%_0%]">
      <form 
        className="relative w-full h-full bg-[#1c1c1c] rounded-xl sm:rounded-2xl p-3 sm:p-4"
        onSubmit={handleSubmit}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            console.log(e.target.files);
          }}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none text-white placeholder:text-gray-500/50 focus:outline-none text-base sm:text-lg px-1 sm:px-2 py-2 mb-2 italic font-light pr-10 sm:pr-12"
        />

        <button
          type="submit"
          disabled={!value.trim()}
          className={`absolute top-3 sm:top-4 right-3 sm:right-4 h-8 w-8 sm:h-9 sm:w-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
            value.trim() 
              ? 'bg-[#2C2C2C] text-white shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:bg-blue-500/20' 
              : 'bg-[#222] text-gray-600 cursor-not-allowed'
          }`}
        >
          <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        
        <div className="h-px bg-white/5 w-full mb-2 sm:mb-3" />

        <div className="flex items-center px-1">
          <div className="flex items-center gap-3 sm:gap-4 text-gray-400">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="hover:text-white transition-colors"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button type="button" className="hover:text-white transition-colors">
              <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button type="button" className="hover:text-white transition-colors">
              <SlidersHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
