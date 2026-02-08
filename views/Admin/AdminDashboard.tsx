
import React, { useState, useMemo } from 'react';
import { Button, Input, Modal, Card } from '../../components/UI';
import { AdminNavbar } from '../../components/Admin/AdminNavbar';
import { ConfigTab } from './ConfigTab';
import { ProductsTab } from './ProductsTab';
import { ClientsTab } from './ClientsTab';
import { SalesTab } from './SalesTab';
import { EmployeesTab } from './EmployeesTab';
import { FinanceTab } from './FinanceTab';
import { OrderStatus } from '../../types';

interface AdminDashboardProps {
  state: any;
  user: { name: string, role: string };
  onLogout: () => void;
  onBack: () => void;
}

export const AdminView: React.FC<AdminDashboardProps> = ({ state, user, onLogout, onBack }) => {
  const [activeTab, setActiveTab] = useState<'config' | 'products' | 'clients' | 'sales' | 'employees' | 'finance'>('products');

  const hasPendingOrders = useMemo(() => {
    return state.orders.some((o: any) => o.status === OrderStatus.PENDING);
  }, [state.orders]);

  const tabs = [
    { id: 'config', label: 'CONFIGURAÇÃO' },
    { id: 'products', label: 'PRODUTOS' },
    { id: 'clients', label: 'CLIENTES' },
    { id: 'sales', label: 'VENDAS/PEDIDOS' },
    { id: 'employees', label: 'FUNCIONÁRIOS' },
    { id: 'finance', label: 'FINANCEIRO' },
  ] as const;

  return (
    <div className="flex flex-col h-screen bg-slate-50 relative">
      <AdminNavbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        hasPendingOrders={hasPendingOrders}
      />

      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {activeTab === 'config' && <ConfigTab state={state} user={user} />}
        {activeTab === 'products' && <ProductsTab state={state} />}
        {activeTab === 'clients' && <ClientsTab state={state} />}
        {activeTab === 'sales' && <SalesTab state={state} />}
        {activeTab === 'employees' && (user.role === 'CHEFE' ? <EmployeesTab state={state} /> : <div className="p-10 text-center opacity-30 font-black italic uppercase text-xs">ACESSO RESTRITO AO CHEFE</div>)}
        {activeTab === 'finance' && (user.role === 'CHEFE' ? <FinanceTab state={state} /> : <div className="p-10 text-center opacity-30 font-black italic uppercase text-xs">ACESSO RESTRITO AO CHEFE</div>)}
      </div>
    </div>
  );
};
