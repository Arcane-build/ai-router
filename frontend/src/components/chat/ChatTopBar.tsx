import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Menu, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';

interface ChatTopBarProps {
  onMenuClick?: () => void;
}

export const ChatTopBar = ({ onMenuClick }: ChatTopBarProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div className="h-14 sm:h-16 w-full border-b border-white/5 flex items-center justify-between px-3 sm:px-4" style={{ backgroundColor: '#171717' }}>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <img src="/navLogo.png" alt="Novi.AI" className="h-4 sm:h-5 w-auto" />
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        <div 
          className="hidden md:flex items-center rounded-md border mr-2"
          style={{
            width: 'auto',
            minWidth: '90px',
            height: '35px',
            gap: '6px',
            borderRadius: '6px',
            padding: '8px',
            background: '#191919',
            border: '1px solid #1E1E1E',
          }}
        >
          <Sparkles className="h-3 w-3 text-amber-400 flex-shrink-0" />
          <span 
            className="font-satoshi text-white text-center whitespace-nowrap"
            style={{
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '100%',
              letterSpacing: '0px',
            }}
          >
            {user?.credits || 5000} Credits
          </span>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-[#1A1A1A] border border-white/5 hover:bg-white/5 transition-colors"
          >
            <Menu className="h-4 w-4 text-gray-400 ml-1 hidden sm:block" />
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'User'}`}
                alt="Avatar"
                className="h-full w-full rounded-full"
              />
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-white/10 shadow-xl z-50 bg-[#1A1A1A]">
              {/* Credits in dropdown for mobile */}
              <div className="md:hidden px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-sm text-white">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span className="font-satoshi">{user?.credits || 5000} Credits</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 rounded-t-lg flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Profile Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 rounded-b-lg flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
