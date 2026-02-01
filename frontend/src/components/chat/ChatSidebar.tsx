import { Plus, Search, Clock, ChevronRight, X } from 'lucide-react';

interface ChatSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ChatSidebar = ({ isOpen, onClose }: ChatSidebarProps) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-black border-r border-white/5 flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <img src="/navLogo.png" alt="Novi Logo" className="h-5 w-auto" />
            </div>
            {onClose && (
              <button 
                onClick={onClose}
                className="lg:hidden p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <button className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 flex items-center gap-2 hover:bg-white/10 transition-colors text-sm font-medium mb-8">
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-400 hover:text-white">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            <div className="relative group">
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-400 hover:text-white">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4" />
                  <span>History</span>
                </div>
                <ChevronRight className="w-3 h-3 group-hover:rotate-90 transition-transform" />
              </button>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

