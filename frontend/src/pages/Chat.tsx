import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatTopBar } from '@/components/chat/ChatTopBar';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';
import { WelcomeScreen } from '@/components/chat/WelcomeScreen';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image?: string;
  imageModel?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
}

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(chatId || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize first session or load existing
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed.map((s: any) => ({
        ...s,
        lastUpdated: new Date(s.lastUpdated),
        messages: s.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      })));
      
      if (chatId) {
        const session = parsed.find((s: any) => s.id === chatId);
        if (session) {
          setCurrentSessionId(chatId);
          setMessages(session.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })));
        }
      }
    } else if (!chatId) {
      createNewChat();
    }
  }, [chatId]);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const createNewChat = () => {
    const newSessionId = `chat-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      messages: [],
      lastUpdated: new Date()
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    setMessages([]);
    navigate(`/chat/${newSessionId}`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const isImagePrompt = input.toLowerCase().includes('image') || 
                           input.toLowerCase().includes('picture') || 
                           input.toLowerCase().includes('photo') ||
                           input.toLowerCase().includes('portrait');
      
      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: isImagePrompt 
          ? 'A cinematic portrait of a woman in neon light, cyberpunk style, shallow depth of field, ultra realistic.'
          : 'This is a simulated AI response. Integration with the AI service will be implemented next.',
        timestamp: new Date(),
        ...(isImagePrompt && {
          image: '/demo.png',
          imageModel: 'DALL-E'
        })
      };
      
      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);

      // Update session
      setSessions(prev => prev.map(session => 
        session.id === currentSessionId
          ? {
              ...session,
              messages: updatedMessages,
              title: session.title === 'New Chat' ? input.trim().substring(0, 30) : session.title,
              lastUpdated: new Date()
            }
          : session
      ));
    }, 1000);
  };

  const loadChat = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      navigate(`/chat/${sessionId}`);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ backgroundColor: '#0F0F0F' }}>
      <ChatTopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex overflow-hidden relative">
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 lg:w-auto
        `}>
          <ChatSidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNewChat={() => {
              createNewChat();
              setIsSidebarOpen(false);
            }}
            onLoadChat={(id) => {
              loadChat(id);
              setIsSidebarOpen(false);
            }}
          />
        </div>

        <div className="flex-1 flex flex-col relative min-w-0 overflow-hidden" style={{ backgroundColor: '#0F0F0F' }}>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {messages.length === 0 ? (
              <WelcomeScreen 
                input={input}
                setInput={setInput}
                onSubmit={handleSendMessage}
              />
            ) : (
              <ChatMessages messages={messages} />
            )}
          </div>

          {messages.length > 0 && (
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={handleSendMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
