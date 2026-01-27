
import { Crosshair, Share2, Globe, Link, ArrowDownCircle } from "lucide-react";

export const PlatformMechanicsSection = () => {
  return (
    <section className="min-h-screen bg-transparent text-white py-20 md:py-32 border-b border-white/10 font-sans">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Big Texts (Span 4) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="inline-flex items-center px-3 py-1 border border-white/10 rounded bg-white/5 mx-auto lg:mx-0">
               <span className="font-roboto-mono text-[10px] text-gray-500 tracking-widest uppercase">x402 as the Economic Layer</span>
            </div>
            <h2 className="font-tobias text-5xl md:text-7xl leading-tight">
              The Platform<br />Mechanics
            </h2>
          </div>

          {/* Middle Column: Spacer (Span 2) */}
          <div className="lg:col-span-2 hidden lg:block">
            {/* Empty space */}
          </div>

          {/* Right Column: Grid Structure (Span 6) */}
          <div className="lg:col-span-6">
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-12 md:gap-y-20">
              
              {/* Item 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 font-roboto-mono text-sm text-gray-300">
                  <Crosshair className="w-4 h-4" />
                  <span>Task Interface</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Users describe what they want done.
                </p>
              </div>

              {/* Item 2 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 font-roboto-mono text-sm text-gray-300">
                  <Share2 className="w-4 h-4" />
                  <span>Orchestration</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Tasks are decomposed, routed, chained, and retried if needed.
                </p>
              </div>

              {/* Item 3 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 font-roboto-mono text-sm text-gray-300">
                  <Globe className="w-4 h-4" />
                  <span>Pricing Engine</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Real-time cost estimation, margin logic, settlement instructions.
                </p>
              </div>

              {/* Item 4 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 font-roboto-mono text-sm text-gray-300">
                  <Link className="w-4 h-4" />
                  <span>Tool Integration</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  APIs, OAuth, BYOK, embedded workflows.
                </p>
              </div>

              {/* Item 5 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 font-roboto-mono text-sm text-gray-300">
                  <ArrowDownCircle className="w-4 h-4" />
                  <span>Output Delivery</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Text, audio, video, images, files. Logged and reusable.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
