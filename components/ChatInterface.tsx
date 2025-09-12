import { GoogleGenAI } from '@google/genai';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChatMessage, FAQ, TeamMember, VideoSuggestion, ChatHistory } from '../types';
import { findRelevantFaqs } from '../services/faqService';
import { findRelevantVideos } from '../services/videoSuggestionService';
import { logQuery, logFeedback } from '../services/loggingService';
import { STARTER_PROMPTS, STARTER_PROMPT_TOPICS } from '../constants';
import ChatMessageItem from './ChatMessageItem';
import StarterPrompts from './StarterPrompts';
import { SendIcon } from './icons';
import { saveNewChat, updateChatHistory } from '../services/chatHistoryService';

interface ChatInterfaceProps {
  currentUser: TeamMember;
  faqs: FAQ[];
  videos: VideoSuggestion[];
  activeChat: ChatHistory | null;
  onNewChat: () => void;
  onChatHistoryUpdate: (updatedChat: ChatHistory) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentUser, faqs, videos, activeChat, onNewChat, onChatHistoryUpdate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini AI client using the globally available process.env.API_KEY.
  // App.tsx ensures this component only renders when the key is valid.
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY! }), []);

  useEffect(() => {
    if (activeChat) {
      setMessages(activeChat.messages);
    } else {
      setMessages([
          {
            id: 'initial-greeting',
            role: 'assistant',
            content: `Hello ${currentUser.name}! I am the MSME Assistant. How can I help you today? You can ask me about business registration, marketing, funding, or tax compliance.`,
            timestamp: new Date().toISOString(),
          }
      ]);
    }
  }, [activeChat, currentUser.name]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async (prompt: string) => {
    if (!ai || !prompt.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInputValue('');
    setIsLoading(true);

    let responseContent: string;
    let isFaqResult = false;
    let relevantFaqs: FAQ[] = [];
    
    relevantFaqs = findRelevantFaqs(prompt, faqs, 2);
    if (relevantFaqs.length > 0) {
      responseContent = `I found some information that might help:\n\n**${relevantFaqs[0].Question}**\n${relevantFaqs[0].Solution}`;
      if (relevantFaqs.length > 1) {
        responseContent += `\n\nHere are some other related questions:\n` + relevantFaqs.slice(1).map(f => `- ${f.Question}`).join('\n');
      }
      isFaqResult = true;
    } else {
      try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are an expert assistant for Micro, Small, and Medium Enterprises (MSMEs) in India. Keep your answers concise, helpful, and easy to understand. User query: "${prompt}"`,
        });
        responseContent = result.text;
      } catch (error) {
        console.error("Error calling Gemini API:", error);
        responseContent = "Error: I'm sorry, I encountered an issue while generating a response. Please check if the API key is valid and try again later.";
      }
    }

    const videoSuggestions = findRelevantVideos(prompt, videos);

    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: responseContent,
      timestamp: new Date().toISOString(),
      feedback: null,
      isFeedbackSubmitted: false,
      searchedForVideos: true,
      videoSuggestions: videoSuggestions,
    };
    
    const finalMessages = [...currentMessages, assistantMessage];
    setMessages(finalMessages);

    logQuery({
      userId: currentUser.id,
      userName: currentUser.name,
      query: prompt,
      response: responseContent,
      isFaqResult: isFaqResult,
      relevantFaqs: relevantFaqs,
      videoSuggestions: videoSuggestions,
    });

    if (activeChat) {
        const updatedChat = await updateChatHistory(activeChat.id, finalMessages);
        if (updatedChat) onChatHistoryUpdate(updatedChat);
    } else {
        const domain = STARTER_PROMPT_TOPICS.find(t => prompt.toLowerCase().includes(t.toLowerCase().split(' ')[0])) || 'General';
        const newChat = await saveNewChat(currentUser.id, currentUser.name, prompt, domain, finalMessages);
        if (newChat) onChatHistoryUpdate(newChat);
    }

    setIsLoading(false);
  }, [ai, isLoading, messages, faqs, videos, currentUser, activeChat, onChatHistoryUpdate]);


  const handleFeedback = (messageId: string, feedback: '👍' | '👎') => {
    const updatedMessages = messages.map(msg => {
      if (msg.id === messageId) {
        logFeedback({
          userId: currentUser.id,
          userName: currentUser.name,
          query: messages[messages.indexOf(msg) - 1]?.content || 'N/A',
          response: msg.content,
          feedback: feedback,
        });
        return { ...msg, feedback: feedback, isFeedbackSubmitted: true };
      }
      return msg;
    });
    setMessages(updatedMessages);
    if (activeChat) {
        updateChatHistory(activeChat.id, updatedMessages);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
    setTimeout(() => handleSendMessage(prompt), 50);
  };
  
  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((message) => (
          <ChatMessageItem
            key={message.id}
            message={message}
            onFeedback={(feedback) => handleFeedback(message.id, feedback)}
            isFeedbackSubmitted={message.isFeedbackSubmitted}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] sm:max-w-[80%] p-3 rounded-xl shadow-sm bg-slate-100 text-slate-800 rounded-bl-none">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 sm:p-6 bg-white border-t border-slate-200">
        {messages.length <= 1 && !activeChat && (
          <StarterPrompts 
            topics={STARTER_PROMPT_TOPICS} 
            prompts={STARTER_PROMPTS} 
            onPromptClick={handlePromptClick} 
            disabled={isLoading}
          />
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="relative"
        >
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(inputValue);
              }
            }}
            placeholder="Type your question here..."
            className="w-full p-3 pr-14 text-sm text-slate-800 bg-slate-100 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;