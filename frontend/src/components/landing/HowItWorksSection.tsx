
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export const HowItWorksSection = () => {
  const steps = [
    "Selects the right tool",
    "Estimates cost in advance",
    "Executes the workflow",
    "Settles micro-payments via X402",
    "Delivers the output"
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen relative bg-black overflow-hidden flex flex-col justify-center py-24 border-b border-white/10 text-white font-sans">
      {/* Background Image */}
      <img 
        src="/bg4.png" 
        alt="Process Background" 
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />

      <div className="container mx-auto px-6 md:px-12 relative z-10 flex flex-col gap-40">
        
        {/* Top Section */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center min-h-[500px]">
          {/* Left Side */}
          <div className="flex flex-col justify-between h-full py-10">
            <div className="space-y-10">
              <div className="inline-flex items-center px-3 py-1 border border-white/10 rounded bg-white/5 backdrop-blur-sm">
                 <span className="font-roboto-mono text-[10px] text-gray-500 tracking-widest uppercase">x402 as the Economic Layer</span>
              </div>
              
              <div className="space-y-6">
                <h2 className="font-tobias text-5xl md:text-7xl">Comes NOVI</h2>
                <p className="font-roboto-mono text-gray-400 text-sm md:text-base">Describe the task. NOVI does the rest.</p>
              </div>
            </div>

            <ul className="space-y-3 font-roboto-mono text-sm text-gray-500 pt-10 lg:pt-0">
              <li>No subscriptions.</li>
              <li>No tool hopping.</li>
              <li>No billing friction.</li>
            </ul>
          </div>

          {/* Right Side (Card Stack Animation) */}
          <div className="relative h-[320px] md:h-[400px] lg:h-[400px] w-full flex items-center justify-center">
             {steps.map((step, index) => {
                // Calculate position relative to active index
                const offset = (index - activeIndex + steps.length) % steps.length;
                
                let translateY = 120; 
                let scale = 0.8;
                let opacity = 0;
                let zIndex = 0;

                if (offset === 0) {
                    // Active card (Top)
                    translateY = 0;
                    scale = 1;
                    opacity = 1;
                    zIndex = 10;
                } else if (offset === 1) {
                    // Second card
                    translateY = 40;
                    scale = 0.95;
                    opacity = 0.6;
                    zIndex = 5;
                } else if (offset === 2) {
                    // Third card
                    translateY = 80;
                    scale = 0.9;
                    opacity = 0.3;
                    zIndex = 1;
                } else if (offset === steps.length - 1) {
                    translateY = -120;
                    scale = 1.0;
                    opacity = 0;
                    zIndex = 20;
                }

                return (
                  <div 
                    key={index}
                    className="absolute w-full max-w-md bg-[#0A0A0A] border border-white/10 p-8 rounded-2xl shadow-2xl transition-all duration-700 ease-in-out flex items-center justify-center h-48 will-change-transform"
                    style={{
                        transform: `translateY(${translateY}px) scale(${scale})`,
                        opacity: opacity,
                        zIndex: zIndex,
                    }}
                  >
                     <span className="font-roboto-mono text-xl text-white/90 text-center">{step}</span>
                  </div>
                );
             })}
          </div>
        </div>

        {/* Middle Section (Example) */}
        <div className="space-y-8 w-full">
            <div>
                 <div className="inline-block px-3 py-1 border border-blue-500/30 text-blue-400 font-roboto-mono text-xs rounded uppercase tracking-widest">
                   Example
                 </div>
            </div>
            <div className="font-roboto-mono text-sm md:text-base grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
                <div className="space-y-4">
                    <span className="text-gray-500 block text-xs uppercase tracking-widest">Input:</span>
                    <p className="text-white/90 whitespace-nowrap">"Turn this script into a narrated video."</p>
                </div>
                
                <div className="space-y-4 md:pl-16">
                    <span className="text-gray-500 block text-xs uppercase tracking-widest">Execution:</span>
                    <div className="flex items-center gap-3 text-white/90 whitespace-nowrap">
                        <span>Claude</span>
                        <ArrowRight className="w-3 h-3 text-gray-600" />
                        <span>ElevenLabs</span>
                        <ArrowRight className="w-3 h-3 text-gray-600" />
                        <span>Runway</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <span className="text-gray-500 block text-xs uppercase tracking-widest">Result:</span>
                    <p className="text-white/90 whitespace-nowrap">One output. One price. One payment.</p>
                </div>
            </div>
        </div>

        {/* Bottom Section (Economic Layer) */}
        <div className="space-y-25">
            <div className="text-center space-y-6">
                <h3 className="font-tobias text-4xl md:text-5xl">x402: THE ECONOMIC LAYER</h3>
                <p className="font-roboto-mono text-gray-500 text-sm">Every AI action becomes economically viable.</p>
            </div>

            {/* Replaced Cards with Table Image */}
            <div className="flex justify-center w-full mt-10">
                {/* Mobile Image */}
                <img 
                    src="/fram4MobiTable.png" 
                    alt="Economic Layer Features Mobile" 
                    className="block md:hidden w-[calc(100%+3rem)] max-w-none -mx-6 h-auto object-contain"
                />
                
                {/* Desktop/Tablet Image */}
                <img 
                    src="/fram4-table.png" 
                    alt="Economic Layer Features" 
                    className="hidden md:block w-full h-auto object-contain lg:max-w-none lg:w-[1255px]"
                />
            </div>
        </div>

      </div>
    </section>
  );
};


