


import { useState, useEffect } from "react";

export const ProblemSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    "Use any AI tool instantly",
    "Pay only for what you use",
    "Think in tasks, not products"
  ];

  return (
    <section id="problem" className="relative bg-black overflow-hidden flex flex-col justify-center border-b border-white/10 py-20 md:py-24 md:min-h-screen">
      {/* Background Image */}
      <img 
        src="/bg2.png" 
        alt="Background Pattern" 
        className="absolute w-[200%] max-w-none left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 md:w-full md:max-w-full md:translate-x-0 md:translate-y-0 md:top-0 md:left-0 z-0 opacity-70"
      />

      <div className="container mx-auto px-6 md:px-12 relative z-10 w-full h-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 min-h-0 md:min-h-[70vh]">
          
          {/* Left Column */}
          <div className="col-span-12 md:col-span-7 self-start pt-4 md:pt-0 space-y-6 md:space-y-8">
            <div className="space-y-4 md:space-y-6">
              <p className="font-roboto-mono text-xs md:text-sm text-gray-400 tracking-wider uppercase">
                The <span className="text-white">Agent Economy</span> is coming.
              </p>
              <h1 className="font-tobias text-5xl md:text-5xl lg:text-6xl leading-tight md:leading-[0.9] lg:leading-[0.9] text-white font-normal md:font-light">
                Models were yesterday.<br />
                Tasks are today.
              </h1>
              <p className="font-roboto-mono text-sm text-gray-400 leading-relaxed">
                One unified platform. Seamless for you, scalable
                <br className="hidden md:block" />
                for agents.
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-12 md:col-span-4 md:col-start-9 self-end space-y-8 md:space-y-10 font-roboto-mono text-lg md:text-xl font-normal md:font-light text-white/80 leading-relaxed pb-8 md:pb-0">
            <div className="space-y-8 md:space-y-12">
              {steps.map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-6 transition-all duration-500 ease-in-out ${
                    i === activeStep ? "opacity-100" : "opacity-30"
                  }`}
                >
                  <div 
                    className={`w-4 h-4 shrink-0 rounded-[1px] transition-colors duration-500 ${
                      i === activeStep ? "bg-white border-white" : "bg-transparent border border-white/40"
                    }`} 
                  />
                  <span className="text-white font-roboto-mono text-base md:text-lg font-normal md:font-light tracking-wide transition-all duration-500">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
