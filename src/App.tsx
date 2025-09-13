import React, { useState, useEffect, useCallback } from 'react';
import UserLogin from '/src/components/auth/UserLogin.tsx';
import AdminLogin from '/src/components/auth/AdminLogin.tsx';
import AdminDashboard from '/src/components/admin/AdminDashboard.tsx';
import Header from '/src/components/common/Header.tsx';
import Spinner from '/src/components/common/Spinner.tsx';
import ChatInterface from '/src/components/chat/ChatInterface.tsx';
import { TeamMember, FAQ, VideoSuggestion, ChatHistory } from '/src/types/index.ts';
import { TEAM_MEMBERS, ADMIN_PASSWORD } from '/src/config/constants.ts';
import { loadFaqsFromGoogleSheet } from '/src/services/faqService.ts';
import { loadVideosFromGoogleSheet } from '/src/services/videoSuggestionService.ts';
import { getChatHistoryForUser } from '/src/services/chatHistoryService.ts';
import ChatHistorySidebar from '/src/components/chat/ChatHistorySidebar.tsx';
import { supabase } from '/src/services/supabaseService.ts';

type AppView = 'userLogin' | 'chat' | 'adminLogin' | 'adminDashboard';

const FullScreenLoader: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-center">
            <Spinner className="w-12 h-12 mx-auto" />
            <p className="text-slate-600 mt-4">{text}</p>
        </div>
    </div>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [view, setView] = useState<AppView>('userLogin');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [videos, setVideos] = useState<VideoSuggestion[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      console.log("Loading initial FAQ and Video data...");
      const loadedFaqs = await loadFaqsFromGoogleSheet();
      setFaqs(loadedFaqs);
      const loadedVideos = await loadVideosFromGoogleSheet();
      setVideos(loadedVideos);
      setIsDataLoaded(true);
    };
    loadData();
  }, []);
  
  const loadChatHistory = useCallback(async (userId: string) => {
      if (!supabase) return;
      setIsHistoryLoading(true);
      const history = await getChatHistoryForUser(userId);
      setChatHistory(history);
      setIsHistoryLoading(false);
  }, []);

  useEffect(() => {
      if (currentUser) {
          loadChatHistory(currentUser.id);
      } else {
          setChatHistory([]);
          setActiveChatId(null);
      }
  }, [currentUser, loadChatHistory]);

  const handleLogin = (userId: string, password?: string): boolean => {
    const user = TEAM_MEMBERS.find(m => m.id === userId);
    if (!user) return false;

    if (user.role === 'guest' || user.password === password) {
      setCurrentUser(user);
      setView('chat');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('userLogin');
    setActiveChatId(null);
  };

  const handleAdminLogin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      const adminUser = TEAM_MEMBERS.find(m => m.role === 'admin');
      if (adminUser) {
        setCurrentUser(adminUser);
        setView('adminDashboard');
        return true;
      }
    }
    return false;
  };

  const handleAdminClick = () => {
    if (currentUser?.role === 'admin') {
      setView('adminDashboard');
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
  };
  
  const handleChatHistoryUpdate = (updatedChat: ChatHistory) => {
    setActiveChatId(updatedChat.id);
    setChatHistory(prev => {
        const existing = prev.find(c => c.id === updatedChat.id);
        if (existing) {
            return prev.map(c => c.id === updatedChat.id ? updatedChat : c).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        return [updatedChat, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    });
  };

  const activeChat = chatHistory.find(c => c.id === activeChatId) || null;

  const renderContent = () => {
    if (!isDataLoaded) {
        return <FullScreenLoader text="Loading initial data..." />;
    }

    switch (view) {
      case 'userLogin':
        return <UserLogin onLogin={handleLogin} onAdminLoginClick={() => setView('adminLogin')} />;
      case 'adminLogin':
        return <AdminLogin onLogin={handleAdminLogin} onCancel={() => setView('userLogin')} />;
      case 'adminDashboard':
        // currentUser is guaranteed to be set by handleAdminLogin or by being logged in before.
        if (!currentUser) return <UserLogin onLogin={handleLogin} onAdminLoginClick={() => setView('adminLogin')} />;
        return (
          <div className="flex flex-col h-screen">
            <Header currentUser={currentUser} onBackClick={() => setView('chat')} onLogout={handleLogout} />
            <AdminDashboard />
          </div>
        );
      case 'chat':
        if (!currentUser) return <UserLogin onLogin={handleLogin} onAdminLoginClick={() => setView('adminLogin')} />;
        return (
          <div className="flex flex-col h-screen bg-slate-50 font-sans">
            <Header
              currentUser={currentUser}
              onAdminClick={currentUser.role === 'admin' ? handleAdminClick : undefined}
              onLogout={handleLogout}
            />
            <main className="flex-1 flex overflow-hidden">
               {supabase && (
                 <ChatHistorySidebar
                    chats={chatHistory}
                    activeChatId={activeChatId}
                    onSelectChat={setActiveChatId}
                    onNewChat={handleNewChat}
                    isLoading={isHistoryLoading}
                />
               )}
              <div className="flex-1 flex flex-col">
                  <ChatInterface 
                      currentUser={currentUser} 
                      faqs={faqs} 
                      videos={videos}
                      activeChat={activeChat}
                      onNewChat={handleNewChat}
                      onChatHistoryUpdate={handleChatHistoryUpdate}
                  />
              </div>
            </main>
          </div>
        );
      default:
        return <UserLogin onLogin={handleLogin} onAdminLoginClick={() => setView('adminLogin')} />;
    }
  };

  return <div className="h-screen w-screen">{renderContent()}</div>;
};

export default App;
