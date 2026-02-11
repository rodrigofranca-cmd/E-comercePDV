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

  const printReceipt = (order: Order) => {
    const content = `
      <html>
        <head>
          <title>Recibo #${order.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 10px; margin: 0; padding: 5px; width: 300px; }
            .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
            .title { font-size: 12px; font-weight: bold; }
            .info { font-size: 9px; }
            .items { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            .items th { border-bottom: 1px dashed #000; text-align: left; }
            .items td { padding-top: 2px; }
            .totals { text-align: right; border-top: 1px dashed #000; pt-2; }
            .footer { text-align: center; margin-top: 10px; font-size: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${state.config.name}</div>
            <div class="info">${state.config.address}</div>
            <div class="info">Tel: ${state.config.phone}</div>
            <div class="info">CNPJ: ${state.config.cnpj}</div>
          </div>
          
          <div class="info">
            PEDIDO: #${order.id.toUpperCase()}<br/>
            DATA: ${new Date(order.createdAt).toLocaleString('pt-BR')}<br/>
            CLIENTE: ${order.clientName}
          </div>
          
          <br/>
          
          <table class="items">
            <thead>
              <tr>
                <th width="10%">QTD</th>
                <th width="60%">ITEM</th>
                <th width="30%" align="right">VALOR</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.quantity}</td>
                  <td>${item.productName}</td>
                  <td align="right">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <strong>TOTAL: R$ ${order.total.toFixed(2)}</strong><br/>
            FORMA PAGTO: ${order.paymentMethod}
          </div>
          
          <div class="footer">
            Obrigado pela preferência!<br/>
            Volte sempre.
          </div>
          
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=350,height=600');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
    } else {
      alert("Pop-up bloqueado! Permita pop-ups para imprimir.");
    }
  };

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
                <div className="flex items-center gap-2">
                  <span className={`text-[7px] font-black px-3 py-1 rounded-full uppercase italic shadow-sm border ${o.status === OrderStatus.PENDING ? 'bg-orange-50 text-orange-500 border-orange-100' :
                    o.status === OrderStatus.CONFIRMED ? 'bg-green-50 text-green-500 border-green-100' :
                      'bg-red-50 text-red-500 border-red-100'
                    }`}>
                    {o.status}
                  </span>

                  {/* Botão de Excluir */}
                  <button
                    onClick={async () => {
                      if (confirm('ATENÇÃO: Deseja realmente excluir este pedido?')) {
                        await state.deleteOrder(o.id);
                      }
                    }}
                    className="w-6 h-6 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                    title="Excluir Venda"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
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
                  onClick={() => printReceipt(o)}
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
