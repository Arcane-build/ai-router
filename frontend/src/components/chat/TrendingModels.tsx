import { ChevronRight } from 'lucide-react';

interface Model {
  name: string;
  description: string;
  icon?: string;
}

interface TrendingModelsProps {
  models: Model[];
}

export const TrendingModels = ({ models }: TrendingModelsProps) => {
  return (
    <div className="space-y-3 md:space-y-4 animate-in slide-in-from-bottom-4 duration-700">
      <h3 className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-gray-500 font-medium px-1">Trending Models</h3>
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
        {models.map((model, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-56 md:w-64 p-4 md:p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              {model.icon ? (
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-white/5 flex items-center justify-center text-[10px] md:text-xs border border-white/10 group-hover:border-white/20 transition-colors">
                  {model.icon}
                </div>
              ) : null}
              <h4 className="text-xs md:text-sm font-semibold text-gray-200">{model.name}</h4>
            </div>
            <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed line-clamp-2">{model.description}</p>
          </div>
        ))}
        <button className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center self-center hover:bg-white/10 transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

