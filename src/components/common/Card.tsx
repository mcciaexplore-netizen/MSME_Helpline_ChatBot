import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, actions, noPadding = false }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {(title || actions) && (
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4 sm:p-6'}>
        {children}
      </div>
    </div>
  );
};

export default Card;
