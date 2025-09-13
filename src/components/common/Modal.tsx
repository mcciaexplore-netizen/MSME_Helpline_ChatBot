import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
    >
        <div 
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col" 
            onClick={(e) => e.stopPropagation()}
        >
            <header className="p-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-lg flex justify-between items-center">
                <h3 id="modal-title" className="text-xl font-semibold text-slate-800">{title}</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-500" aria-label="Close modal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </header>
            <main className="p-6 overflow-y-auto">
                {children}
            </main>
            {footer && (
                <footer className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-lg text-right">
                    {footer}
                </footer>
            )}
        </div>
        <style>{`.animate-fade-in { animation: fadeIn 0.2s ease-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
};

export default Modal;
