import React from 'react';
import { ChatHistory } from '/src/types/index.ts';
import { DOMAIN_COLORS } from '/src/config/constants.ts';
import { PlusIcon } from '/src/components/common/Icons.tsx';

interface ChatHistorySidebarProps {
    chats: ChatHistory[];
    activeChatId: string | null;
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
    isLoading: boolean;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({ chats, activeChatId, onSelectChat, onNewChat, isLoading }) => {

    const getDomainColor = (domain: string): string => {
        return DOMAIN_COLORS[domain as keyof typeof DOMAIN_COLORS] || 'bg-slate-400';
    };

    return (
        <aside className="w-full md:w-72 lg:w-80 bg-slate-100 border-r border-slate-200 flex flex-col h-full">
            <div className="p-3 border-b border-slate-200">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md py-2.5 px-4 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    New Chat
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center text-sm text-slate-500">Loading chats...</div>
                ) : chats.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">No chat history yet.</div>
                ) : (
                    <nav className="p-2 space-y-1">
                        {chats.map(chat => (
                            <button
                                key={chat.id}
                                onClick={() => onSelectChat(chat.id)}
                                className={`w-full text-left flex items-center gap-3 p-2.5 rounded-md transition-colors text-sm ${
                                    activeChatId === chat.id
                                        ? 'bg-blue-100 text-blue-800 font-semibold'
                                        : 'text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getDomainColor(chat.domain)}`}></span>
                                <span className="truncate flex-1">{chat.initial_query}</span>
                            </button>
                        ))}
                    </nav>
                )}
            </div>
        </aside>
    );
};

export default ChatHistorySidebar;
