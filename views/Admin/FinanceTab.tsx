
import React, { useState, useMemo } from 'react';
import { Card } from '../../components/UI';

export const FinanceTab: React.FC<{ state: any }> = ({ state }) => {
   const [filter, setFilter] = useState<'TUDO' | 'DIARIO' | 'SEMANAL' | 'MENSAL' | 'ANUAL' | 'INTERVALO'>('TUDO');
   const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
   const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

   const stats = useMemo(() => {
      const now = new Date();
      const todayStr = now.toDateString();

      // Inícios dos períodos (timestamp em MS para comparação direta)
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo como início da semana
      startOfWeek.setHours(0, 0, 0, 0);
      const startOfWeekMs = startOfWeek.getTime();

      const startOfMonthMs = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const startOfYearMs = new Date(now.getFullYear(), 0, 1).getTime();

      // 1. Filtrar pedidos válidos e dentro do período selecionado
      const filteredOrders = (state.orders || []).filter((o: any) => {
         // REGRA: Somente vendas CONFIRMADAS são computadas no financeiro.
         if (o.status !== 'CONFIRMADO') return false;

         // Se for TUDO, não precisa verificar data
         if (filter === 'TUDO') return true;

         // Pegar data (suportando ambas as convenções: createdAt e created_at)
         const dateStr = o.createdAt || o.created_at;
         if (!dateStr) return false;

         const orderDate = new Date(dateStr);
         if (isNaN(orderDate.getTime())) return false;

         // Comparação por período
         if (filter === 'DIARIO') {
            return orderDate.toDateString() === todayStr;
         }

         const orderMs = orderDate.getTime();
         if (filter === 'SEMANAL') return orderMs >= startOfWeekMs;
         if (filter === 'MENSAL') return orderMs >= startOfMonthMs;
         if (filter === 'ANUAL') return orderMs >= startOfYearMs;

         if (filter === 'INTERVALO') {
            const [sYear, sMonth, sDay] = startDate.split('-').map(Number);
            const [eYear, eMonth, eDay] = endDate.split('-').map(Number);

            const start = new Date(sYear, sMonth - 1, sDay, 0, 0, 0, 0);
            const end = new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999);

            const orderMs = orderDate.getTime();
            return orderMs >= start.getTime() && orderMs <= end.getTime();
         }

         return true;
      });

      // 2. Calcular estatísticas sobre os pedidos filtrados
      const totalsByMethod = {
         PIX: 0,
         'CRÉDITO': 0,
         'DÉBITO': 0,
         'DINHEIRO': 0,
         'A PRAZO': 0
      };

      let totalSales = 0;
      let totalProfit = 0;

      filteredOrders.forEach((o: any) => {
         const orderTotal = Number(o.total || 0);
         totalSales += orderTotal;

         if ((totalsByMethod as any)[o.paymentMethod] !== undefined) {
            (totalsByMethod as any)[o.paymentMethod] += orderTotal;
         }

         // Cálculo de Lucro detalhado
         (o.items || []).forEach((item: any) => {
            const product = state.products.find((p: any) => p.id === item.productId);
            const itemPrice = Number(item.price || 0);
            const itemQty = Number(item.quantity || 0);

            if (product) {
               totalProfit += (itemPrice - Number(product.purchasePrice || 0)) * itemQty;
            } else {
               // Fallback para 30% de margem se o produto não for encontrado
               totalProfit += (itemPrice * 0.3) * itemQty;
            }
         });
      });

      return { totalSales, totalsByMethod, totalProfit };
   }, [state.orders, state.products, filter, startDate, endDate]);

   return (
      <div className="space-y-6 pb-20 px-1 animate-in fade-in duration-500">
         {/* Filtros de Período - Design Moderno */}
         <div className="flex gap-2 overflow-x-auto carousel-scroll py-2 px-1">
            {['TUDO', 'DIARIO', 'SEMANAL', 'MENSAL', 'ANUAL', 'INTERVALO'].map(f => (
               <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-5 py-2 rounded-full text-[8px] font-black italic uppercase transition-all border-2 whitespace-nowrap ${filter === f
                     ? 'bg-primary text-white border-primary shadow-lg shadow-blue-100 scale-105'
                     : 'bg-white text-slate-300 border-slate-50 hover:bg-slate-50 active:scale-95'
                     }`}
               >
                  {f === 'INTERVALO' ? '📅 PERSONALIZADO' : f}
               </button>
            ))}
         </div>

         {/* Inputs de Data para Intervalo Personalizado */}
         {filter === 'INTERVALO' && (
            <div className="flex flex-col gap-3 p-4 bg-white rounded-[30px] border border-slate-100 shadow-sm animate-in slide-in-from-top-2 duration-300">
               <div className="flex items-center justify-between px-2">
                  <span className="text-[9px] font-black italic text-slate-400 uppercase tracking-widest">PERÍODO SELECIONADO</span>
                  <div className="h-px flex-1 mx-4 bg-slate-50"></div>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                     <label className="text-[7px] font-bold text-slate-400 ml-2 uppercase">Início</label>
                     <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-[10px] font-bold text-slate-600 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                     />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[7px] font-bold text-slate-400 ml-2 uppercase">Fim</label>
                     <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-[10px] font-bold text-slate-600 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                     />
                  </div>
               </div>
            </div>
         )}

         {/* Banner Vendas Totais - Destaque Principal */}
         <div className="relative bg-slate-100/60 rounded-[50px] p-8 border border-slate-200/50 overflow-hidden flex flex-col items-center shadow-sm">
            <div className="relative z-10 flex flex-col items-center w-full">
               <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase italic tracking-[0.3em]">VENDAS TOTAIS</span>
                  <span className="text-lg animate-bounce">💰</span>
               </div>

               <div className="bg-white px-12 py-6 rounded-[35px] shadow-xl shadow-slate-200/50 border border-white flex items-center justify-center min-w-[240px] transform hover:scale-105 transition-transform duration-300">
                  <p className="text-3xl font-black italic text-primary tracking-tighter drop-shadow-sm">
                     R$ {stats.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
               </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
         </div>

         {/* Grid de Vendas por Categorias */}
         <div className="space-y-4">
            <h3 className="text-[9px] font-black italic text-slate-300 uppercase tracking-widest ml-4">VENDAS POR CATEGORIAS</h3>

            <div className="grid grid-cols-2 gap-4">
               {/* A PRAZO - Destaque em Laranja conforme UI */}
               <div className="bg-orange-50/50 rounded-[40px] p-5 border border-orange-100 flex flex-col h-36 relative active:scale-95 transition-all shadow-sm group">
                  <span className="text-[8px] font-black italic uppercase text-slate-400 leading-none mb-3">A PRAZO</span>
                  <div className="flex-1 flex items-center justify-center">
                     <div className="bg-white w-full h-16 rounded-[25px] shadow-lg shadow-orange-100/50 border border-white flex items-center justify-center group-hover:scale-105 transition-transform">
                        <span className="text-xl font-black italic tracking-tighter text-secondary">R$ {stats.totalsByMethod['A PRAZO'].toFixed(2)}</span>
                     </div>
                  </div>
               </div>

               {/* CARTÃO */}
               <div className="bg-blue-50/40 rounded-[40px] p-5 border border-blue-100/50 flex flex-col h-36 relative active:scale-95 transition-all shadow-sm group">
                  <span className="text-[8px] font-black italic uppercase text-slate-400 leading-none mb-3">CARTÃO</span>
                  <div className="flex-1 flex items-center justify-center">
                     <div className="bg-white w-full h-16 rounded-[25px] shadow-lg shadow-blue-50/50 border border-white flex items-center justify-center group-hover:scale-105 transition-transform">
                        <span className="text-xl font-black italic tracking-tighter text-primary">R$ {(stats.totalsByMethod['CRÉDITO'] + stats.totalsByMethod['DÉBITO']).toFixed(2)}</span>
                     </div>
                  </div>
               </div>

               {/* PIX */}
               <div className="bg-blue-50/40 rounded-[40px] p-5 border border-blue-100/50 flex flex-col h-36 relative active:scale-95 transition-all shadow-sm group">
                  <span className="text-[8px] font-black italic uppercase text-slate-400 leading-none mb-3">PIX</span>
                  <div className="flex-1 flex items-center justify-center">
                     <div className="bg-white w-full h-16 rounded-[25px] shadow-lg shadow-blue-50/50 border border-white flex items-center justify-center group-hover:scale-105 transition-transform">
                        <span className="text-xl font-black italic tracking-tighter text-primary">R$ {stats.totalsByMethod.PIX.toFixed(2)}</span>
                     </div>
                  </div>
               </div>

               {/* DINHEIRO */}
               <div className="bg-blue-50/40 rounded-[40px] p-5 border border-blue-100/50 flex flex-col h-36 relative active:scale-95 transition-all shadow-sm group">
                  <span className="text-[8px] font-black italic uppercase text-slate-400 leading-none mb-3">DINHEIRO</span>
                  <div className="flex-1 flex items-center justify-center">
                     <div className="bg-white w-full h-16 rounded-[25px] shadow-lg shadow-blue-50/50 border border-white flex items-center justify-center group-hover:scale-105 transition-transform">
                        <span className="text-xl font-black italic tracking-tighter text-primary">R$ {stats.totalsByMethod.DINHEIRO.toFixed(2)}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Lucro Total - Barra Verde Profissional */}
         <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-6 text-white shadow-xl shadow-green-100 flex justify-between items-center active:scale-[0.98] transition-all relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex flex-col relative z-10">
               <span className="text-[10px] font-black italic uppercase tracking-wider leading-none mb-1">LUCRO TOTAL ✅</span>
               <span className="text-[7px] font-bold opacity-70 uppercase tracking-widest leading-none">RESULTADO LÍQUIDO</span>
            </div>
            <div className="flex-1 mx-6 h-px bg-white/30"></div>
            <span className="text-2xl font-black italic tracking-tighter drop-shadow-md">R$ {stats.totalProfit.toFixed(2)}</span>
         </div>

         {/* Lista de Despesas - Barra Branca Premium */}
         <div className="bg-white rounded-full p-6 text-slate-400 flex justify-between items-center border border-slate-100 transition-all active:scale-[0.98] cursor-pointer shadow-xl shadow-slate-200/50 group">
            <span className="text-[10px] font-black italic uppercase tracking-widest group-hover:text-primary transition-colors">LISTA DESPESAS 🧾</span>
            <div className="flex-1 mx-6 h-px bg-slate-100"></div>
            <span className="text-2xl font-black italic tracking-tighter text-slate-300">R$ 0,00</span>
         </div>
      </div>
   );
};
