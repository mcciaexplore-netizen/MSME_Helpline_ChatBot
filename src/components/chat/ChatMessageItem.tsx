import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '/src/types/index.ts';
import VideoSuggestionsDisplay from '/src/components/chat/VideoSuggestionsDisplay.tsx';

interface ChatMessageItemProps {
  message: ChatMessage;
  onFeedback?: (feedback: '👍' | '👎') => void;
  isFeedbackSubmitted?: boolean;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, onFeedback, isFeedbackSubmitted }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex mb-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] sm:max-w-[80%] p-3 rounded-xl shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-slate-100 text-slate-800 rounded-bl-none'
        }`}
      >
        <div className={`prose prose-sm max-w-none ${isUser ? 'text-white prose-invert' : 'text-slate-800'} 
                        prose-p:my-1 prose-p:last:mb-0 
                        prose-ul:my-1.5 prose-ul:pl-5 
                        prose-ol:my-1.5 prose-ol:pl-5
                        prose-headings:my-1.5
                        prose-strong:font-semibold
                        prose-a:font-medium 
                        `}>
             <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                    a: ({node, ...props}) => <a 
                        className={isUser ? "text-blue-300 hover:text-blue-200 underline" : "text-blue-600 hover:text-blue-800 underline"} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        {...props} 
                    />,
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                }}
             >
                {message.content}
            </ReactMarkdown>
        </div>

        {/* Display Video Suggestions for assistant messages */}
        {message.role === 'assistant' && message.searchedForVideos && !message.content.startsWith("Error:") && (
          <VideoSuggestionsDisplay videos={message.videoSuggestions || []} />
        )}

        {/* Feedback section */}
        {message.role === 'assistant' && onFeedback && !message.content.startsWith("Error:") && (
          <div className={`mt-2.5 pt-2 ${message.searchedForVideos ? '' : 'border-t border-slate-300/70'} flex items-center space-x-2`}>
            {!isFeedbackSubmitted ? (
              <>
                <button
                  onClick={() => onFeedback('👍')}
                  className="p-1.5 rounded-full hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 focus:ring-offset-slate-100 text-lg"
                  aria-label="Good response"
                >
                  👍
                </button>
                <button
                  onClick={() => onFeedback('👎')}
                  className="p-1.5 rounded-full hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 focus:ring-offset-slate-100 text-lg"
                  aria-label="Bad response"
                >
                  👎
                </button>
              </>
            ) : (
              <span className="text-xs text-slate-500 italic">Feedback submitted.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageItem;
