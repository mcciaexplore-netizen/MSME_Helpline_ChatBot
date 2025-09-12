import React from 'react';

interface StarterPromptsProps {
  topics: string[];
  prompts: { [key: string]: string };
  onPromptClick: (prompt: string) => void;
  disabled?: boolean;
}

const StarterPrompts: React.FC<StarterPromptsProps> = ({ topics, prompts, onPromptClick, disabled }) => {
  return (
    <div className="mb-4">
      <p className="text-sm text-gray-700 mb-2 font-medium">Or explore common topics:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => onPromptClick(prompts[topic] || `Tell me more about ${topic}`)}
            disabled={disabled}
            className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 focus:ring-offset-gray-50"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StarterPrompts;