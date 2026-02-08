import React from 'react';

interface AdminNavbarProps {
    user: { name: string, role: string };
    activeTab: 'config' | 'products' | 'clients' | 'sales' | 'employees' | 'finance';
    setActiveTab: (tab: 'config' | 'products' | 'clients' | 'sales' | 'employees' | 'finance') => void;
    onLogout: () => void;
    hasPendingOrders: boolean;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ user, activeTab, setActiveTab, onLogout, hasPendingOrders }) => {
    const tabs = [
        { id: 'config', label: 'CONFIGURAÇÃO' },
        { id: 'products', label: 'PRODUTOS' },
        { id: 'clients', label: 'CLIENTES' },
        { id: 'sales', label: 'VENDAS/PEDIDOS' },
        { id: 'employees', label: 'FUNCIONÁRIOS' },
        { id: 'finance', label: 'FINANCEIRO' },
    ] as const;

    return (
        <div className="bg-primary p-4 pt-6 pb-6 rounded-b-[30px] shadow-2xl relative z-10 transition-colors duration-500">
            <div className="flex justify-between items-center mb-3">
                <div className="flex flex-col">
                    <h1 className="text-white text-xl font-black italic uppercase tracking-tighter leading-none">ADMINISTRAÇÃO</h1>
                    <span className="text-white/80 text-[7px] font-bold uppercase tracking-[0.1em] mt-1">ACESSO: {user.name} ({user.role})</span>
                </div>
                <button onClick={onLogout} className="text-white font-black text-[9px] hover:text-white/80 uppercase tracking-widest px-2 py-1 bg-white/10 rounded-lg">SAIR</button>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {tabs.map(tab => {
                    // Restrição: Funcionários e Financeiro são exclusivos do CHEFE
                    const isRestricted = (tab.id === 'finance' || tab.id === 'employees') && user.role !== 'CHEFE';
                    const isSales = tab.id === 'sales';

                    return (
                        <button
                            key={tab.id}
                            disabled={isRestricted}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 rounded-xl text-[7px] font-black italic uppercase transition-all shadow-md active:scale-95 whitespace-nowrap border flex items-center justify-center gap-1.5 ${activeTab === tab.id
                                    ? 'bg-secondary text-white border-white/20 shadow-orange-500/40'
                                    : 'bg-white/10 text-white/70 border-white/5 backdrop-blur-md'
                                } ${isRestricted ? 'opacity-40 grayscale cursor-not-allowed scale-100 active:scale-100' : ''}`}
                        >
                            <span className={activeTab === tab.id ? "border-b border-white/50" : ""}>
                                {isRestricted ? '🔒 ' : ''}{tab.label}
                            </span>

                            {/* Sininho de Notificação para Vendas Pendentes */}
                            {isSales && hasPendingOrders && (
                                <div className="relative flex items-center justify-center">
                                    <span className="absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                                    <svg className="w-3 h-3 ml-0.5 animate-bounce text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
