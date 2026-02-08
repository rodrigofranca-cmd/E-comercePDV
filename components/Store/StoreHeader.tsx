import React from 'react';

interface StoreHeaderProps {
    state: any;
    welcomeMessage: string;
    onNavigate: (view: 'store' | 'admin' | 'login' | 'cart') => void;
    search: string;
    setSearch: (search: string) => void;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ state, welcomeMessage, onNavigate, search, setSearch }) => {
    return (
        <div className="bg-primary pt-6 pb-10 px-6 rounded-b-[45px] relative shadow-lg z-30 transition-colors duration-500">
            <div className="flex justify-between items-center mb-1 gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-[8px] font-bold uppercase tracking-widest leading-none mb-1">{welcomeMessage}</p>
                    <h1 className="text-white text-2xl font-black italic tracking-tighter uppercase leading-none drop-shadow-sm truncate">
                        {state.config.name}
                    </h1>
                </div>
                <button
                    onClick={() => onNavigate('admin')}
                    className="w-20 h-14 bg-transparent rounded-[20px] overflow-hidden flex items-center justify-center transition-all active:scale-95 group flex-shrink-0"
                >
                    {state.config.logoUrl ? (
                        <img src={state.config.logoUrl} alt="Logo" className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <span className="text-white text-[8px] font-black text-center uppercase tracking-widest opacity-50">LOGO</span>
                    )}
                </button>
            </div>

            <div className="absolute -bottom-4 left-6 right-6 z-40">
                <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </span>
                    <input
                        type="text"
                        placeholder="O que você procura hoje?"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-10 py-2.5 bg-white rounded-full shadow-xl shadow-black/10 outline-none focus:ring-2 focus:ring-secondary transition-all text-gray-700 font-medium text-sm border border-gray-100"
                    />
                </div>
            </div>
        </div>
    );
};
