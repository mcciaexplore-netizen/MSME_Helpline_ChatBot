import React from 'react';
import { TeamMember } from '/src/types/index.ts';
import { CogIcon, ArrowLeftIcon } from '/src/components/common/Icons.tsx';

interface HeaderProps {
  currentUser: TeamMember;
  onAdminClick?: () => void;
  onBackClick?: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onAdminClick, onBackClick, onLogout }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              MSME Assistant Chatbot
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-sm text-slate-600 hidden sm:block">
                Welcome, <span className="font-semibold">{currentUser.name}</span>
            </div>
            {onBackClick ? (
                <button
                    onClick={onBackClick}
                    className="p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    aria-label="Back to chat"
                    title="Back to chat"
                >
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
            ) : onAdminClick ? (
                <button
                    onClick={onAdminClick}
                    className="p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    aria-label="Admin Panel"
                    title="Admin Panel"
                >
                    <CogIcon className="h-6 w-6" />
                </button>
            ) : null}
             <button
              onClick={onLogout}
              className="p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Logout"
              title="Logout"
            >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
