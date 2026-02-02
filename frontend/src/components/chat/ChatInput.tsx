import { Plus, Mic, Equal, ArrowUp, Loader2, X } from 'lucide-react';

interface ChatInputProps {
  prompt: string;
  setPrompt: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreviews: string[];
  removeImage: (index: number) => void;
}

export const ChatInput = ({
  prompt,
  setPrompt,
  handleSubmit,
  loading,
  handleImageChange,
  imagePreviews,
  removeImage
}: ChatInputProps) => {
  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="relative bg-[#111111] border border-white/10 rounded-2xl transition-all duration-300 focus-within:border-white/20 focus-within:bg-[#161616] shadow-2xl">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Ask anything..."
          className="w-full bg-transparent px-4 md:px-6 py-4 md:py-5 pr-14 md:pr-16 text-gray-200 placeholder:text-gray-600 focus:outline-none resize-none min-h-[60px] md:min-h-[80px] max-h-[200px] md:max-h-[300px] text-sm leading-relaxed"
          disabled={loading}
          rows={1}
        />
        
        <div className="absolute right-3 md:right-4 bottom-3 md:bottom-4 flex items-center gap-2 md:gap-3">
          <button
            type="submit"
            disabled={loading || (!prompt.trim() && imagePreviews.length === 0)}
            className="w-9 h-9 md:w-10 md:h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed group/btn"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4 text-gray-400 group-hover/btn:text-white transition-colors" />
            )}
          </button>
        </div>

        {/* Bottom Toolbar */}
        <div className="flex items-center gap-4 md:gap-5 px-4 md:px-6 py-2.5 md:py-3 border-t border-white/5">
          <label className="cursor-pointer group/tool">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={loading}
              className="hidden"
            />
            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500 group-hover/tool:text-gray-300 transition-colors" />
          </label>
          <button type="button" className="group/tool">
            <Mic className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500 group-hover/tool:text-gray-300 transition-colors" />
          </button>
          <button type="button" className="group/tool">
            <Equal className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500 group-hover/tool:text-gray-300 transition-colors" />
          </button>
        </div>
      </div>

      {/* Image Previews */}
      {imagePreviews.length > 0 && (
        <div className="flex flex-wrap gap-2 md:gap-3 mt-3 md:mt-4 px-1 md:px-2">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative group/img animate-in zoom-in-95 duration-200">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl border border-white/10 shadow-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={loading}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 md:w-6 md:h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover/img:opacity-100 transition-all shadow-xl hover:scale-110"
              >
                <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </form>
  );
};

