
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between font-roboto-mono font-normal text-sm">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/navLogo.png" alt="Novi Logo" className="h-6 w-auto" />
        </div>
        
        {/* Center Links */}
        <div className="hidden md:flex items-center gap-12 text-sm text-gray-400">
          <a href="#problem" className="hover:text-white transition-colors">Problem</a>
          <a href="#solution" className="hover:text-white transition-colors">Solution</a>
          <a href="#how" className="hover:text-white transition-colors">How</a>
        </div>

        {/* Right Button */}
        <div className="flex items-center">
          <button 
            className="px-8 py-2 rounded-full border border-white text-white text-xs tracking-widest uppercase transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-400 hover:to-cyan-400 hover:border-transparent hover:text-black font-bold"
            onClick={() => navigate('/login')}
          >
            Log in
          </button>
        </div>
      </div>
    </nav>
  );
};
