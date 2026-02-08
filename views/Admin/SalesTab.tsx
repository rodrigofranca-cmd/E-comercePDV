import React, { useState } from 'react';
import { Button, Input, Modal, Card } from '../../components/UI';
import { Order, OrderStatus } from '../../types';
import { PDVView } from './PDV';

export const SalesTab: React.FC<{ state: any }> = ({ state }) => {
  const [showPDV, setShowPDV] = useState(false);
  // REGRA: Filtro padrão alterado para 'TODOS' conforme solicitação do usuário.
  const [filter, setFilter] = useState<string>('TODOS');
  const [search, setSearch] = useState('');

  if (showPDV) {
    return <PDVView state={state} onBack={() => setShowPDV(false)} />;
  }

  const filteredOrders = state.orders.filter((o: Order) => {
    const matchesFilter = filter === 'TODOS' || o.status === filter;
    const matchesSearch = o.clientName.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Botão PDV / VENDA - Estilo Vibrante conforme Screenshot */}
      <div className="px-1">
        <button
          onClick={() => setShowPDV(true)}
          className="w-full bg-gradient-to-r from-[#ff8c3a] via-[#ff6b00] to-[#ff4d00] py-8 rounded-[40px] text-white font-black italic text-4xl uppercase shadow-[0_15px_35px_rgba(255,107,0,0.35)] active:scale-95 transition-all border-t border-white/30 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="relative z-10 tracking-tighter drop-shadow-md">— PDV / VENDA —</span>
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black italic text-slate-300 uppercase tracking-[0.2em] ml-4">GESTÃO DE PEDIDOS</h3>

        <div className="px-1">
          <input
            placeholder="Buscar por nome do cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-6 py-4 bg-slate-100/50 border border-slate-50 rounded-[25px] outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold text-slate-600 shadow-inner placeholder:text-slate-300 placeholder:italic"
          />
        </div>

        {/* Filtros de Pedidos - Tamanho Reduzido Conforme Solicitado */}
        <div className="flex gap-2 overflow-x-auto carousel-scroll pb-2 px-2">
          {['TODOS', 'PENDENTE', 'CONFIRMADO', 'CANCELADO'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-[12px] text-[8.5px] font-black italic uppercase transition-all whitespace-nowrap border-2 ${filter === f
                ? 'bg-primary text-white border-primary shadow-lg shadow-blue-50/40 scale-105'
                : 'bg-white border-slate-50 text-slate-300 hover:bg-slate-50'
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-4 px-1 pb-10">
          {filteredOrders.map((o: Order) => (
            <Card key={o.id} className="p-3.5 space-y-2 border-slate-100 shadow-lg shadow-slate-100/30 rounded-[30px] group transition-all hover:scale-[1.01]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[8px] font-black text-slate-200 tracking-widest mb-0.5 uppercase">#{o.id.toUpperCase()}</p>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black italic text-slate-700 uppercase leading-none tracking-tight">{o.clientName}</h4>
                    <span className="text-[7px] font-black bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full uppercase italic tracking-tighter border border-blue-100/30 shadow-sm">{o.paymentMethod}</span>
                  </div>
                </div>
                <span className={`text-[7px] font-black px-3 py-1 rounded-full uppercase italic shadow-sm border ${o.status === OrderStatus.PENDING ? 'bg-orange-50 text-orange-500 border-orange-100' :
                  o.status === OrderStatus.CONFIRMED ? 'bg-green-50 text-green-500 border-green-100' :
                    'bg-red-50 text-red-500 border-red-100'
                  }`}>
                  {o.status}
                </span>
              </div>

              <div className="flex justify-between items-end border-b border-slate-50 pb-1.5">
                <p className="text-[9px] text-slate-400 font-bold uppercase italic opacity-60">{new Date(o.createdAt).toLocaleString('pt-BR')}</p>
                <p className="text-lg font-black italic text-primary tracking-tighter drop-shadow-sm">R$ {o.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>

              {o.status === OrderStatus.PENDING && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={async () => {
                      if (confirm('Confirmar este pedido?')) {
                        await state.updateOrderStatus(o.id, OrderStatus.CONFIRMED);
                      }
                    }}
                    className="bg-gradient-to-r from-green-400 to-green-500 text-white py-1.5 rounded-lg text-[7.5px] font-black italic uppercase shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all border-t border-white/20"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    CONFIRMAR
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Cancelar este pedido?')) {
                        await state.updateOrderStatus(o.id, OrderStatus.CANCELLED);
                      }
                    }}
                    className="bg-gradient-to-r from-red-400 to-red-500 text-white py-1.5 rounded-lg text-[7.5px] font-black italic uppercase shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all border-t border-white/20"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                    CANCELAR
                  </button>
                </div>
              )}

              {o.status === OrderStatus.CONFIRMED && (
                <button
                  onClick={() => alert("Gerando comprovante...")}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-1.5 rounded-lg text-[7.5px] font-black italic uppercase flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 border-t border-white/20 mt-1"
                >
                  <span className="text-sm">🖨️</span> IMPRIMIR RECIBO TÉRMICO
                </button>
              )}
            </Card>
          ))}

          {filteredOrders.length === 0 && (
            <div className="py-20 text-center opacity-10 flex flex-col items-center gap-4">
              <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <p className="text-[9px] font-black italic uppercase tracking-[0.3em]">Nenhum pedido filtrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
