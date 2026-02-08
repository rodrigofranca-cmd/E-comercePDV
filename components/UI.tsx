
import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' }> = 
({ children, variant = 'primary', className = '', ...props }) => {
  const styles = {
    // Primary em nosso app são os botões de ação (Laranja por padrão)
    primary: 'bg-secondary text-white hover:opacity-90',
    // Secondary são as cores dos menus/destaques (Azul por padrão)
    secondary: 'bg-primary text-white hover:opacity-90',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-green-600 text-white hover:bg-green-700',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100'
  };
  
  return (
    <button 
      className={`px-4 py-2 rounded-full font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-md ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = 
({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-[10px] font-black italic uppercase text-gray-400 ml-2">{label}</label>}
    <input 
      className={`px-4 py-2 bg-gray-100 border-none rounded-2xl focus:ring-2 focus-ring-primary outline-none shadow-inner text-sm font-bold text-gray-700 ${className}`}
      {...props}
    />
  </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = 
({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 uppercase italic font-black">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = 
({ children, className = '' }) => (
  <div className={`bg-white rounded-[35px] shadow-sm border border-gray-100 overflow-hidden ${className}`}>
    {children}
  </div>
);
