import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, FAQ, TeamMember, VideoSuggestion, ChatHistory } from '/src/types/index.ts';
import { findRelevantFaqs } from '/src/services/faqService.ts';
import { findRelevantVideos } from '/src/services/videoSuggestionService.ts';
import { logQuery, logFeedback } from '/src/services/loggingService.ts';
import { STARTER_PROMPTS, STARTER_PROMPT_TOPICS } from '/src/config/constants.ts';
import ChatMessageItem from '/src/components/chat/ChatMessageItem.tsx';
import StarterPrompts from '/src/components/chat/StarterPrompts.tsx';
import { SendIcon } from '/src/components/common/Icons.tsx';
import { saveNewChat, updateChatHistory } from '/src/services/chatHistoryService.ts';

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
    if (!prompt.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const relevantFaqs = findRelevantFaqs(prompt, faqs, 2);

    if (relevantFaqs.length > 0) {
      // FAQ-based response
      let responseContent = `I found some information that might help:\n\n**${relevantFaqs[0].Question}**\n${relevantFaqs[0].Solution}`;
      if (relevantFaqs.length > 1) {
        responseContent += `\n\nHere are some other related questions:\n` + relevantFaqs.slice(1).map(f => `- ${f.Question}`).join('\n');
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

      setMessages(prev => {
        const updatedMessages = [...prev, assistantMessage];
        logQuery({ userId: currentUser.id, userName: currentUser.name, query: prompt, response: responseContent, isFaqResult: true, relevantFaqs, videoSuggestions });
      
        if (activeChat) {
          updateChatHistory(activeChat.id, updatedMessages).then(c => c && onChatHistoryUpdate(c));
        } else {
          const domain = STARTER_PROMPT_TOPICS.find(t => prompt.toLowerCase().includes(t.toLowerCase().split(' ')[0])) || 'General';
          saveNewChat(currentUser.id, currentUser.name, prompt, domain, updatedMessages).then(c => c && onChatHistoryUpdate(c));
        }
        return updatedMessages;
      });

      setIsLoading(false);
    } else {
      // AI response via secure backend proxy
      const assistantId = `assistant-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        feedback: null,
        isFeedbackSubmitted: false,
      }]);

      let fullResponseText = '';
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok || !response.body) {
            const errorText = await response.text();
            console.error("Error from backend:", errorText);
            throw new Error(`Server responded with ${response.status}: ${errorText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunkText = decoder.decode(value);
          fullResponseText += chunkText;
          setMessages(prev => prev.map(msg => 
              msg.id === assistantId ? { ...msg, content: fullResponseText } : msg
          ));
        }

      } catch (error) {
        console.error("Error fetching from backend proxy:", error);
        fullResponseText = "Error: I'm sorry, I encountered an issue while generating a response. Please check the server logs and try again later.";
        setMessages(prev => prev.map(msg => 
            msg.id === assistantId ? { ...msg, content: fullResponseText } : msg
        ));
      }

      const videoSuggestions = findRelevantVideos(prompt, videos);
      
      setMessages(prev => {
        const finalMessages = prev.map(msg => 
            msg.id === assistantId 
                ? { ...msg, content: fullResponseText, searchedForVideos: true, videoSuggestions } 
                : msg
        );

        logQuery({
          userId: currentUser.id,
          userName: currentUser.name,
          query: prompt,
          response: fullResponseText,
          isFaqResult: false,
          relevantFaqs: [],
          videoSuggestions: videoSuggestions,
        });

        if (activeChat) {
          updateChatHistory(activeChat.id, finalMessages).then(c => c && onChatHistoryUpdate(c));
        } else {
          const domain = STARTER_PROMPT_TOPICS.find(t => prompt.toLowerCase().includes(t.toLowerCase().split(' ')[0])) || 'General';
          saveNewChat(currentUser.id, currentUser.name, prompt, domain, finalMessages).then(c => c && onChatHistoryUpdate(c));
        }
        return finalMessages;
      });
      setIsLoading(false);
    }
  }, [isLoading, faqs, videos, currentUser, activeChat, onChatHistoryUpdate]);


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
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
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
