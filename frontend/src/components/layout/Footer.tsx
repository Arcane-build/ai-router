
import { Globe, Github } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-transparent text-white py-12 border-t border-white/5 font-sans">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between h-auto md:h-40">
           
           {/* Left Section: Icons & Copyright */}
           <div className="flex flex-col justify-end gap-6 order-2 md:order-1 mt-8 md:mt-0">
              <div className="flex gap-6 text-gray-400">
                 <button className="hover:text-white transition-colors">
                    <Globe className="w-5 h-5" />
                 </button>
                 <button className="hover:text-white transition-colors">
                    <Github className="w-5 h-5" />
                 </button>
                 <button className="hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
                      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                    </svg>
                 </button>
              </div>
              <p className="text-gray-500 text-xs font-roboto-mono">© 2024 Novi AI Inc.</p>
           </div>

           {/* Right Section: Links & Status */}
           <div className="flex flex-col justify-between items-end h-full order-1 md:order-2 gap-8 md:gap-0">
              <nav className="flex flex-col items-end gap-6 text-sm text-gray-400 font-light">
                  <a href="#" className="hover:text-white transition-colors">About</a>
                  <a href="#" className="hover:text-white transition-colors">Careers</a>
                  <a href="#" className="hover:text-white transition-colors">Blog</a>
              </nav>

              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-gray-500 text-xs font-roboto-mono">All systems normal</span>
              </div>
           </div>

        </div>
      </div>
    </footer>
  );
};
