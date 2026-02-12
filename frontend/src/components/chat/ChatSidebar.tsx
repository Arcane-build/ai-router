import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, History, MessageSquare, ChevronDown } from 'lucide-react';

interface ChatSession {
  id: string;
  title: string;
  lastUpdated: Date;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewChat: () => void;
  onLoadChat: (sessionId: string) => void;
}

export const ChatSidebar = ({
  sessions,
  currentSessionId,
  searchQuery,
  onSearchChange,
  onNewChat,
  onLoadChat
}: ChatSidebarProps) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      setSidebarWidth(Math.max(200, Math.min(480, e.clientX)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="relative flex flex-col border-r border-white/5 font-roboto-mono flex-shrink-0 h-full rounded-r-lg lg:rounded-none"
      style={{ 
        width: typeof window !== 'undefined' && window.innerWidth < 1024 ? '256px' : sidebarWidth,
        backgroundColor: '#171717'
      }}
    >
      {/* Resize Handle - hidden on mobile/tablet */}
      <div
        className="hidden lg:block absolute right-0 top-0 bottom-0 w-1 flex justify-end cursor-col-resize z-50 group"
        onMouseDown={() => setIsResizing(true)}
      >
        <div className={`w-[1px] h-full transition-colors ${isResizing ? 'bg-blue-500' : 'bg-transparent group-hover:bg-[#243145]'}`} />
      </div>
      {/* New Chat Button */}
      <div className="p-3 sm:p-4">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 bg-[#1A1A1A] hover:bg-[#252525] text-white border border-white/5 h-10 rounded-lg transition-all"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">New Chat</span>
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#AEB3B6] group-focus-within:text-gray-400 transition-colors" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-transparent border border-none focus:border-white/10 text-white placeholder:text-gray-600 h-9 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="px-2 mb-2">
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="w-full relative text-sm font-medium text-[#AEB3B6] pl-9 pr-2 py-1 flex items-center justify-between hover:text-gray-300 transition-colors"
          >
            <div className="flex items-center">
              <History className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#AEB3B6]" />
              History
            </div>
            <ChevronDown 
              className={`h-3 w-3 transition-transform duration-200 ${isHistoryOpen ? '' : '-rotate-90'}`}
            />
          </button>
        </div>
        <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isHistoryOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isHistoryOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
            <div className="space-y-0.5 mt-2 p-2">
              {filteredSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => onLoadChat(session.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 group ${
                    session.id === currentSessionId
                      ? 'bg-[#1A1A1A] text-white font-medium'
                      : 'text-[#AEB3B6] hover:bg-[#1A1A1A] hover:text-gray-200'
                  }`}
                >
                  <MessageSquare className={`h-4 w-4 flex-shrink-0 transition-colors ${
                    session.id === currentSessionId ? 'text-white' : 'text-[#AEB3B6] group-hover:text-gray-500'
                  }`} />
                  <span className="truncate">{session.title}</span>
                </button>
              ))}
              {filteredSessions.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs text-[#AEB3B6]">No chats yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
