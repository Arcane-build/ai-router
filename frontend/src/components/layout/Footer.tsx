
import { Send } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-transparent text-white py-20 border-t border-white/5 font-sans relative">
      <div className="container mx-auto px-6 md:px-12">
        
        {/* Centered Logo & Email */}
        <div className="flex flex-col items-center gap-6 mb-12">
           <img src="/footLogo.png" alt="Novi Logo" className="h-10 w-auto opacity-90" />
           <a href="mailto:support@noviai.xyz" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
             <Send className="w-3 h-3" />
             support@noviai.xyz
           </a>
        </div>

        {/* Fading Divider Line */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>

        <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-8 md:gap-0">
           
           {/* Left Section: Copyright */}
           <div className="flex flex-col items-center md:items-start">
              <p className="text-gray-500 text-xs font-roboto-mono">© 2024 Novi AI Inc.</p>
           </div>

           {/* Right Section: Links & Social */}
           <div className="flex flex-row flex-wrap justify-center md:flex-row items-center gap-6 md:gap-8">
              <nav className="flex flex-row flex-wrap justify-center gap-6 text-sm text-gray-400 font-light">
                  <a href="#" className="hover:text-white transition-colors">Privacy policy</a>
                  <a href="#" className="hover:text-white transition-colors">About</a>
                  <a href="#" className="hover:text-white transition-colors">Docs</a>
              </nav>

              <a href="https://x.com/Noviaixyz" className="text-gray-400 hover:text-white transition-colors">
                 <span className="sr-only">X (Twitter)</span>
                 <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
                   <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                 </svg>
              </a>
           </div>

        </div>
      </div>
    </footer>
  );
};
