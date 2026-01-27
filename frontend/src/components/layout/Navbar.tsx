
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between font-roboto-mono font-normal text-sm">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/navLogo.png" alt="Novi Logo" className="h-4 sm:h-6 w-auto" />
        </div>

        {/* Right Button */}
        <div className="flex items-center">
          <button 
            className="px-4 sm:px-8 py-1.5 sm:py-2 rounded-full border border-white text-white text-[10px] sm:text-xs tracking-widest uppercase transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-400 hover:to-cyan-400 hover:border-transparent hover:text-black font-bold"
            onClick={() => navigate('/login')}
          >
            Log in
          </button>
        </div>
      </div>
    </nav>
  );
};
