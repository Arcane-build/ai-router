// Layout
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Sections
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PlatformMechanicsSection } from "@/components/landing/PlatformMechanicsSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow">
        <Hero />
        <ProblemSection />
        <HowItWorksSection />
      </main>

      <div className="relative bg-black">
        <img 
          src="/bg6.png" 
          alt="Background" 
          loading="lazy"
          className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-[0.10] mix-blend-luminosity pointer-events-none"
        />
        <div className="relative z-10">
          <PlatformMechanicsSection />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
