
import React, { useState, useMemo, useEffect } from 'react';
import { Button, Input, Modal, Card } from '../../components/UI';
import { PaymentMethod, Order, OrderStatus } from '../../types';

export const CartView: React.FC<{ state: any; onBack: () => void }> = ({ state, onBack }) => {
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  
  // Persistence logic: Initialize state from localStorage if available
  const [formData, setFormData] = useState(() => {
    const savedInfo = localStorage.getItem('market_customer_info');
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        return {
          name: parsed.name || '',
          whatsapp: parsed.whatsapp || '',
          address: parsed.address || '',
          type: parsed.type || 'DELIVERY',
          payment: PaymentMethod.PIX
        };
      } catch (e) {
        console.error("Erro ao carregar dados do cliente", e);
      }
    }
    return {
      name: '',
      whatsapp: '',
      address: '',
      type: 'DELIVERY' as 'DELIVERY' | 'PICKUP',
      payment: PaymentMethod.PIX
    };
  });

  const total = useMemo(() => state.cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0), [state.cart]);

  const handleFinish = () => {
    if (!formData.name || !formData.whatsapp || (formData.type === 'DELIVERY' && !formData.address)) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    // Save client info for next time
    localStorage.setItem('market_customer_info', JSON.stringify({
      name: formData.name,
      whatsapp: formData.whatsapp,
      address: formData.address,
      type: formData.type
    }));

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      clientName: formData.name,
      clientWhatsapp: formData.whatsapp,
      address: formData.type === 'DELIVERY' ? formData.address : 'RETIRADA NO LOCAL',
      items: state.cart,
      total,
      paymentMethod: formData.payment,
      status: OrderStatus.PENDING,
      type: formData.type,
      createdAt: new Date().toISOString()
    };

    state.saveOrder(newOrder);
    
    // Format WhatsApp message
    const message = `🚀 *NOVO PEDIDO - ${state.config.name}*\n\n` +
      `👤 *Cliente:* ${formData.name}\n` +
      `📞 *WhatsApp:* ${formData.whatsapp}\n` +
      `📦 *Tipo:* ${formData.type === 'DELIVERY' ? 'Entrega' : 'Retirada'}\n` +
      `📍 *Endereço:* ${newOrder.address}\n` +
      `💳 *Pagamento:* ${formData.payment}\n\n` +
      `🛒 *PRODUTOS:*\n` +
      state.cart.map((i: any) => `- ${i.quantity}x ${i.productName}: R$ ${(i.price * i.quantity).toFixed(2)}`).join('\n') +
      `\n\n💰 *TOTAL:* R$ ${total.toFixed(2)}`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${state.config.phone.replace(/\D/g, '')}?text=${encoded}`, '_blank');
    
    state.clearCart();
    onBack();
  };

  if (state.cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-10 text-center">
        <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        </div>
        <h2 className="text-2xl font-black italic text-gray-400 mb-4 uppercase">Carrinho Vazio</h2>
        <Button onClick={onBack} variant="primary">VOLTAR ÀS COMPRAS</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* 1. Ultra-Narrow Header */}
      <div className="bg-primary px-4 pt-6 pb-2 text-white rounded-b-[20px] shadow-md z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 bg-white/20 rounded-full transition-transform active:scale-90">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 className="text-sm font-black italic uppercase tracking-tight">Meu Carrinho</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {step === 'cart' ? (
          state.cart.map((item: any) => {
            const product = state.products.find((p: any) => p.id === item.productId);
            const isPromoApplied = product?.isOffer && item.quantity >= (product.minOfferQty || 1);
            
            return (
              <div key={item.productId} className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md relative">
                {/* Selo de Oferta no Carrinho - Só aparece se a promoção estiver ativa para a QTD */}
                {isPromoApplied && (
                  <span className="absolute -top-1.5 -left-1.5 bg-promo text-white text-[6.5px] px-2 py-0.5 rounded-full font-black italic uppercase shadow-md z-20 border border-white animate-in zoom-in-50 duration-300">
                    OFERTA
                  </span>
                )}

                <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-1 border border-gray-100">
                  <img src={product?.image} className="max-w-full max-h-full object-contain" alt="" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[9px] font-black text-gray-700 uppercase leading-tight line-clamp-2 italic mb-0.5">{item.productName}</h4>
                  <div className="flex items-baseline gap-2">
                    <p className="text-[#2b6be7] font-black italic text-sm">R$ {item.price.toFixed(2)}</p>
                    {product?.isOffer && !isPromoApplied && (
                       <span className="text-[7px] font-black text-promo uppercase italic">Mín. {product.minOfferQty} p/ oferta</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center bg-gray-50 rounded-full px-2 py-1 gap-3 border border-gray-100 shadow-inner">
                  <button onClick={() => state.addToCart({id: item.productId}, -1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-full text-secondary font-black shadow-sm">-</button>
                  <span className="text-xs font-black w-4 text-center text-gray-700 italic">{item.quantity}</span>
                  <button onClick={() => state.addToCart({id: item.productId}, 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-full text-secondary font-black shadow-sm">+</button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="space-y-5">
            <div className="flex gap-2">
              <button 
                onClick={() => setFormData({ ...formData, type: 'DELIVERY' })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black italic text-[11px] uppercase transition-all ${formData.type === 'DELIVERY' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-300 border border-gray-100'}`}
              >
                🚲 ENTREGA
              </button>
              <button 
                onClick={() => setFormData({ ...formData, type: 'PICKUP' })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black italic text-[11px] uppercase transition-all ${formData.type === 'PICKUP' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-300 border border-gray-100'}`}
              >
                🏪 RETIRADA
              </button>
            </div>

            <Input label="Seu Nome" placeholder="Ex: João Silva" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <Input label="WhatsApp (com DDD)" placeholder="Ex: 11999999999" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} />
            {formData.type === 'DELIVERY' && (
              <Input label="Endereço Completo" placeholder="Rua, Número, Bairro, Ref." value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
            )}

            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Forma de Pagamento</label>
              <div className="grid grid-cols-2 gap-2">
                {[PaymentMethod.PIX, PaymentMethod.CREDIT, PaymentMethod.DEBIT, PaymentMethod.CASH].map(method => (
                  <button 
                    key={method}
                    onClick={() => setFormData({ ...formData, payment: method })}
                    className={`py-3 px-2 rounded-xl text-[9px] font-black italic uppercase transition-all border ${formData.payment === method ? 'bg-secondary text-white border-secondary shadow-lg' : 'bg-white text-gray-400 border-gray-100'}`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Footer Area - Transparent Background with Separate Pill Buttons */}
      <div className="px-6 py-8 bg-transparent flex justify-center">
        {step === 'cart' ? (
          <div className="flex gap-6 items-center w-full">
            {/* Improved PEDIR Button */}
            <button 
              onClick={() => setStep('checkout')}
              className="group flex-[1.2] bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white py-4.5 px-6 rounded-full shadow-[0_12px_24px_rgba(34,197,94,0.3)] active:scale-95 transition-all overflow-hidden relative border-t border-white/30"
            >
              <span className="text-2xl font-black italic uppercase tracking-tighter drop-shadow-md relative z-10">PEDIR</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out_infinite]"></div>
              <style>{`
                @keyframes shine {
                  100% { transform: translateX(100%); }
                }
              `}</style>
            </button>
            
            {/* Price Display */}
            <div className="flex-1 bg-transparent flex items-center justify-center">
               <span className="text-2xl font-black italic tracking-tight whitespace-nowrap text-[#1a365d] drop-shadow-sm">
                 🛒 R$ {total.toFixed(2)}
               </span>
            </div>
          </div>
        ) : (
          /* Narrower and more Modern Finish Button */
          <button 
             onClick={handleFinish}
             className="w-[90%] bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white py-4 px-8 rounded-full flex items-center justify-between shadow-[0_20px_40px_rgba(22,163,74,0.35)] active:scale-95 transition-all border-t border-white/30 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-lg font-black italic uppercase tracking-tighter relative z-10 drop-shadow-sm">FINALIZAR</span>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-px h-5 bg-white/30"></div>
              <span className="text-sm font-black italic tracking-tight uppercase flex items-center gap-1.5">
                WHATSAPP <span className="text-lg">🚀</span>
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
