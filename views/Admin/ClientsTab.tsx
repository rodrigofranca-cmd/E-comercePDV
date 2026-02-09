
import React, { useState } from 'react';
import { Button, Input, Modal, Card } from '../../components/UI';
import { Client } from '../../types';

export const ClientsTab: React.FC<{ state: any }> = ({ state }) => {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [debtAmount, setDebtAmount] = useState<number>(0);

  const [clientForm, setClientForm] = useState<Partial<Client>>({
    name: '',
    whatsapp: '',
    address: '',
    limit: 0,
    cpf: '',
    debt: 0
  });

  const handleSaveClient = async () => {
    if (!clientForm.name || !clientForm.whatsapp) {
      alert("Nome e WhatsApp são obrigatórios!");
      return;
    }

    const newClient: Client = {
      ...clientForm,
      id: Math.random().toString(36).substr(2, 9),
      limit: Number(clientForm.limit) || 0,
    } as Client;

    await state.addClient(newClient);
    alert("Cliente cadastrado com sucesso!");
    setClientForm({
      name: '',
      whatsapp: '',
      address: '',
      limit: 0,
      cpf: '',
      debt: 0
    });
  };

  const handleUpdateDebt = (multiplier: number) => {
    if (selectedClient && debtAmount > 0) {
      state.updateClientDebt(selectedClient.id, debtAmount * multiplier);
      setIsDebtModalOpen(false);
      setDebtAmount(0);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-sm font-black italic uppercase text-gray-800 mb-4">Cadastro de Clientes</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="w-full aspect-square bg-gray-50 rounded-3xl border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 font-bold text-center p-2 uppercase italic">Imagem</div>
            <div className="col-span-2 space-y-4">
              <Input label="NOME *" value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} />
              <Input label="WHATSAPP *" value={clientForm.whatsapp} onChange={e => setClientForm({ ...clientForm, whatsapp: e.target.value })} />
            </div>
          </div>
          <Input label="ENDEREÇO" value={clientForm.address} onChange={e => setClientForm({ ...clientForm, address: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="LIMITE" type="number" value={clientForm.limit} onChange={e => setClientForm({ ...clientForm, limit: Number(e.target.value) })} />
            <Input label="DÍVIDA" type="number" value={clientForm.debt} disabled />
          </div>
          <div className="grid grid-cols-2 gap-4 items-end">
            <Input label="CPF" value={clientForm.cpf} onChange={e => setClientForm({ ...clientForm, cpf: e.target.value })} />
            <Button variant="secondary" className="w-full" onClick={handleSaveClient}>SALVAR</Button>
          </div>
        </div>
      </Card>

      <div className="relative">
        <Input placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} className="shadow-xl" />
      </div>

      <div className="space-y-4">
        {state.clients.filter((c: Client) => c.name.toLowerCase().includes(search.toLowerCase())).map((c: Client) => (
          <Card key={c.id} className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"><svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg></div>
                <div>
                  <h4 className="font-black italic uppercase text-gray-700">{c.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">📱 {c.whatsapp} 🗓️ 05/02/2026</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-green-500 uppercase">Restante: R$ {(c.limit - c.debt).toFixed(2)}</p>
                <p className={`text-xl font-black italic ${c.debt > 0 ? 'text-secondary' : 'text-green-500'}`}>R$ {c.debt.toFixed(2)}</p>
                <p className="text-[8px] font-bold text-gray-400 uppercase">Dívida Atual</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setSelectedClient(c); setIsDebtModalOpen(true); }}
                className="flex-1 bg-green-50 border border-green-200 text-green-600 py-2 rounded-xl text-[10px] font-black italic uppercase flex items-center justify-center gap-2 active:scale-95"
              >
                📝 Quitar Dívida
              </button>
              <button
                onClick={() => window.open(`https://wa.me/${c.whatsapp}?text=${encodeURIComponent("Olá " + c.name + ", estamos passando para lembrar da sua pendência de R$ " + c.debt.toFixed(2))}`)}
                className="flex-1 bg-blue-50 border border-blue-200 text-blue-600 py-2 rounded-xl text-[10px] font-black italic uppercase flex items-center justify-center gap-2 active:scale-95"
              >
                💬 Cobrar no Zap
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isDebtModalOpen} onClose={() => setIsDebtModalOpen(false)} title="GERENCIAR DÍVIDA">
        {selectedClient && (
          <div className="text-center space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2"><svg className="w-6 h-6 text-blue-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg></div>
              <h4 className="font-black italic uppercase text-primary">{selectedClient.name}</h4>
            </div>

            <div className="bg-orange-50/50 rounded-3xl p-4">
              <p className="text-[8px] font-bold text-secondary uppercase">Dívida Atual</p>
              <p className="text-3xl font-black italic text-secondary">R$ {selectedClient.debt.toFixed(2)}</p>
            </div>

            <Input label="Valor (R$)" type="number" value={debtAmount} onChange={e => setDebtAmount(Number(e.target.value))} className="text-center text-xl font-bold" />

            <div className="flex flex-col gap-2">
              <button onClick={() => { setDebtAmount(selectedClient.debt); handleUpdateDebt(-1); }} className="text-[10px] font-bold text-blue-600 uppercase underline">Quitar Tudo</button>
              <div className="flex gap-2">
                <button onClick={() => handleUpdateDebt(1)} className="flex-1 bg-orange-200/50 text-secondary py-3 rounded-2xl text-[10px] font-black italic uppercase border border-secondary/20">+ Adicionar Valor</button>
                <button onClick={() => handleUpdateDebt(-1)} className="flex-1 bg-green-600 text-white py-3 rounded-2xl text-[10px] font-black italic uppercase shadow-lg shadow-green-100">- Abater / Quitar</button>
              </div>
              <button onClick={() => setIsDebtModalOpen(false)} className="mt-4 text-[10px] font-bold text-gray-400 uppercase">Cancelar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
