import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AIModel } from '@/data/models';

interface ModelCarouselProps {
  models: AIModel[];
}

export const ModelCarousel = ({ models }: ModelCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const getCardsPerView = () => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width < 640) return 1; 
    if (width < 768) return 2; 
    if (width < 1024) return 3; 
    return 4; 
  };
  
  const [cardsPerView, setCardsPerView] = useState(getCardsPerView());
  const maxIndex = Math.max(0, models.length - cardsPerView);

  useEffect(() => {
    const handleResize = () => setCardsPerView(getCardsPerView());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <div className="w-full mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider font-satoshi">
          TRENDING MODELS
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`h-6 w-6 rounded flex items-center justify-center transition-colors ${
              currentIndex === 0
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            aria-label="Previous models"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className={`h-6 w-6 rounded flex items-center justify-center transition-colors ${
              currentIndex >= maxIndex
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            aria-label="Next models"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex gap-2 sm:gap-3 transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (typeof window !== 'undefined' && window.innerWidth < 640 ? 100 : 190 + 12)}px)`,
          }}
        >
          {models.map((model, index) => (
            <div
              key={model.id}
              className="flex-shrink-0 w-[calc(100vw-6rem)] sm:w-[190px] max-w-[300px] sm:max-w-none h-[84px] rounded-lg p-3 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg relative overflow-hidden group"
              style={{
                background: 'linear-gradient(180deg, #121212 0%, #161515 100%)',
                animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
              }}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))',
                  backgroundSize: '200% 200%',
                  animation: 'gradientFlow 4s ease infinite',
                }}
              />
              
              <style>{`
                @keyframes gradientFlow {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
              `}</style>
              
              <div className="relative z-10">
                <div className="flex items-start gap-2 mb-2">
                  <div className="h-4 w-4 rounded bg-white/10 flex-shrink-0" />
                  <h4 className="text-sm font-medium text-white leading-tight font-satoshi">
                    {model.name}
                  </h4>
                </div>
                <p className="text-xs text-gray-400 leading-tight line-clamp-2 font-satoshi">
                  {model.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
