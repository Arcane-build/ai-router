
import { Shield } from "lucide-react";

export const Hero = () => {
  return (
    <section className="min-h-screen relative bg-black overflow-hidden flex flex-col text-white font-sans">
      {/* Background GIF */}
      <img 
        src="/bg1.gif" 
        alt="Background Animation" 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[760px] pointer-events-none z-0 opacity-60 mix-blend-screen"
      />

      <div className="container mx-auto px-6 md:px-12 relative z-10 flex-grow flex flex-col justify-between pt-28 pb-12 md:pt-32 md:pb-24">
        
        {/* Top Left Content */}
        <div className="flex flex-col items-start gap-6 md:gap-8 max-w-4xl">
          <div className="flex items-center gap-3 px-4 py-2 border border-white/20 rounded-lg bg-black/50 backdrop-blur-sm">
            <span className="text-gray-400 font-roboto-mono text-xs">Powered by</span>
            <div className="flex items-center gap-1.5 text-blue-400 border border-blue-400 px-2 py-1 rounded-sm">
              <Shield className="w-3 h-3 fill-current" />
              <span className="font-roboto-mono text-xs font-bold tracking-wider">x402</span>
            </div>
          </div>
          
          <h1 className="font-tobias text-5xl md:text-5xl lg:text-6xl leading-[0.9] text-white font-light">
            One Interface: Everything<br />
            AI in One Place.
          </h1>
        </div>

        {/* Bottom Content Area */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mt-12 md:mt-20 w-full">
          {/* Bottom Left: Tagline (Desktop) */}
          <div className="font-roboto-mono text-sm text-gray-400 max-w-xs hidden md:block pb-2">
            One Payment Rail for <span className="text-white font-bold">Agents</span>
          </div>

          {/* Bottom Right: Text + Buttons */}
          <div className="flex flex-col items-end gap-8 md:gap-10 text-right w-full md:w-auto">
            <h2 className="font-tobias text-3xl md:text-5xl lg:text-5xl leading-[1.1] text-white font-light">
              Zero Subscriptions.<br />
              Pay per Task and output<br className="md:hidden" /> — Not per Month.
            </h2>
            
            {/* Mobile Tagline (Visible only on mobile) */}
            <div className="font-roboto-mono text-xs text-gray-400 self-start md:hidden">
              One Payment Rail for <span className="text-white font-bold">Agents</span>
            </div>

            <div className="flex flex-row items-center gap-3 md:gap-4 mt-2 w-full md:w-auto">
              <button 
                className="flex-1 md:flex-none bg-white text-black font-roboto-mono text-[10px] sm:text-xs font-bold tracking-widest px-4 sm:px-8 py-4 rounded-full hover:bg-white/90 transition-colors uppercase whitespace-nowrap"
                onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get Started
              </button>
              <button 
                className="flex-1 md:flex-none bg-white/10 text-white border border-white/10 font-roboto-mono text-[10px] sm:text-xs font-bold tracking-widest px-4 sm:px-8 py-4 rounded-full hover:bg-white/20 transition-colors uppercase whitespace-nowrap"
              >
                Read Whitepaper
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
