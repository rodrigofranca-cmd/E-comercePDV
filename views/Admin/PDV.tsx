
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button, Input, Modal, Card } from '../../components/UI';
import { Product, PaymentMethod, Client } from '../../types';
import { Html5Qrcode } from 'html5-qrcode';
import { Pix } from '../../src/lib/pix';

export const PDVView: React.FC<{ state: any; onBack: () => void }> = ({ state, onBack }) => {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  // Remove local items state, use global state.cart
  const items = state.cart;
  const setItems = state.setCart;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const total = useMemo(() => items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0), [items]);
  const change = Math.max(0, cashReceived - total);

  // Produtos que batem com a pesquisa atual (Filtrando estoque <= 0)
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const lowerSearch = search.toLowerCase();
    return state.products.filter((p: Product) =>
      p.stock > 0 && ( // Filtro de Estoque
        p.name.toLowerCase().includes(lowerSearch) ||
        p.barcode.includes(search)
      )
    ).slice(0, 5);
  }, [search, state.products]);

  // Recalcular preços quando método de pagamento muda
  useEffect(() => {
    if (items.length === 0) return;

    const newItems = items.map((item: any) => {
      const product = state.products.find((p: any) => p.id === item.productId);
      if (!product) return item;

      let currentPrice = product.salePrice1;

      if (paymentMethod === PaymentMethod.ACCOUNT) {
        // Se for A PRAZO, usa SalePrice2 (ou fallback para SalePrice1)
        currentPrice = product.salePrice2 || product.salePrice1;
      } else {
        // Lógica padrão (Oferta)
        if (product.isOffer && product.offerPrice !== undefined && item.quantity >= (product.minOfferQty || 1)) {
          currentPrice = product.offerPrice;
        }
      }

      return { ...item, price: currentPrice };
    });

    // Só atualiza se houver mudança para evitar loop infinito
    const hasChanges = newItems.some((item: any, idx: number) => item.price !== items[idx].price);
    if (hasChanges) {
      setItems(newItems);
    }
  }, [paymentMethod, state.products]); // Removed items from dependency to avoid loop, logic depends on paymentMethod change mainly. Note: need to be careful.

  // Helper para adicionar produto
  const addProductToSale = (product: Product) => {
    if (product.stock <= 0) {
      alert("Produto sem estoque!");
      return;
    }

    const existingIndex = items.findIndex((i: any) => i.productId === product.id);
    const existing = items[existingIndex];
    const newQty = (existing ? existing.quantity : 0) + 1;

    let currentPrice = product.salePrice1;
    if (paymentMethod === PaymentMethod.ACCOUNT) {
      currentPrice = product.salePrice2 || product.salePrice1;
    } else {
      if (product.isOffer && product.offerPrice !== undefined && newQty >= (product.minOfferQty || 1)) {
        currentPrice = product.offerPrice;
      }
    }

    if (existing) {
      const newItems = [...items];
      newItems[existingIndex] = { ...existing, quantity: newQty, price: currentPrice };
      setItems(newItems);
    } else {
      setItems([...items, {
        productId: product.id,
        productName: product.name,
        price: currentPrice,
        quantity: 1
      }]);
    }
    setSearch('');
  };

  const updateItemQty = (idx: number, delta: number) => {
    const newItems = [...items];
    const item = newItems[idx];
    const product = state.products.find((p: any) => p.id === item.productId);
    if (!product) return;

    const newQty = Math.max(1, item.quantity + delta);

    let currentPrice = product.salePrice1;
    if (paymentMethod === PaymentMethod.ACCOUNT) {
      currentPrice = product.salePrice2 || product.salePrice1;
    } else {
      if (product.isOffer && product.offerPrice !== undefined && newQty >= (product.minOfferQty || 1)) {
        currentPrice = product.offerPrice;
      }
    }

    newItems[idx] = { ...item, quantity: newQty, price: currentPrice };
    setItems(newItems);
  };

  const removeItem = (idx: number) => {
    const newItems = items.filter((_: any, i: number) => i !== idx);
    setItems(newItems);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      addProductToSale(searchResults[0]);
    }
  };

  const startScanning = async () => {
    setIsScanning(true);
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (isScanning) {
      const html5QrCode = new Html5Qrcode("pdv-reader");
      scannerRef.current = html5QrCode;
      const qrConfig = { fps: 10, qrbox: { width: 250, height: 150 } };

      html5QrCode.start(
        { facingMode: "environment" },
        qrConfig,
        (decodedText) => {
          const product = state.products.find((p: Product) => p.barcode === decodedText);
          if (product) {
            if (product.stock > 0) {
              addProductToSale(product);
              stopScanning();
            } else {
              alert("Produto sem estoque: " + product.name);
            }
          } else {
            alert("Produto não encontrado: " + decodedText);
          }
        },
        () => { }
      ).catch(err => {
        console.error("Scanner error:", err);
        setIsScanning(false);
      });
    }
    return () => { if (scannerRef.current) scannerRef.current.stop().catch(() => { }); };
  }, [isScanning]);

  const handleFinish = async () => {
    if (items.length === 0) return;

    const newOrder = {
      id: Math.random().toString(36).substr(2, 9),
      clientName: selectedClient ? selectedClient.name : 'CLIENTE PDV',
      clientId: selectedClient?.id,
      clientWhatsapp: selectedClient?.whatsapp || '',
      address: 'VENDA PDV',
      items,
      total,
      paymentMethod,
      status: 'CONFIRMADO',
      type: 'POS',
      createdAt: new Date().toISOString()
    };

    await state.saveOrder(newOrder);
    alert("VENDA CONCLUÍDA!");
    setItems([]); // Limpa o carrinho global após finalizar
    setCashReceived(0);
    setSelectedClient(null);
    setSearch('');
  };

  // Gera QR Code PIX válido (BR Code)
  const pixQrCodeUrl = useMemo(() => {
    if (total <= 0 || !state.config.pixKey) return '';
    try {
      // Gera o payload Pix Copia e Cola
      const payload = Pix.payload(
        state.config.pixKey,
        state.config.name || 'PDV',
        'SuaCidade', // Idealmente viria da config
        '',
        total
      );
      return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(payload)}`;
    } catch (e) {
      console.error("Erro gerar PIX:", e);
      return '';
    }
  }, [state.config.pixKey, state.config.name, total]);

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col overflow-hidden">
      {/* Header Compacto */}
      <div className="bg-primary p-4 pt-6 pb-4 flex items-center gap-4 text-white shadow-lg z-20">
        <button onClick={onBack} className="p-2 active:scale-90 transition-transform">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
        </button>
        <h1 className="text-xl font-black italic uppercase tracking-tighter">PDV - FRENTE DE CAIXA</h1>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-slate-50">
        {/* Barra de Pesquisa com Câmera */}
        <div className="relative z-30">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="flex-1 relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
              <input
                type="text"
                placeholder="NOME OU CÓDIGO DE BARRAS..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-white rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-primary border border-slate-100 font-bold text-[10px] uppercase italic text-slate-600"
              />
              <button
                type="button"
                onClick={startScanning}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary active:scale-90 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </button>
            </div>
          </form>

          {/* Sugestões de Pesquisa */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {searchResults.map((p: Product) => (
                <button
                  key={p.id}
                  onClick={() => addProductToSale(p)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-left"
                >
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center p-1 border border-slate-100 flex-shrink-0">
                    <img src={p.image} className="max-w-full max-h-full object-contain" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase italic text-slate-700 truncate">{p.name}</p>
                    <p className="text-[8px] font-bold text-slate-400">COD: {p.barcode}</p>
                  </div>
                  <p className="text-[10px] font-black text-primary italic">R$ {p.salePrice1.toFixed(2)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lista de Itens no Carrinho PDV */}
        <div className="min-h-[250px] bg-white rounded-[32px] p-4 space-y-2.5 border border-slate-100 shadow-inner overflow-y-auto">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <p className="text-[10px] font-black uppercase italic">Nenhum item na venda</p>
            </div>
          ) : (
            items.map((item: any, idx: number) => {
              const product = state.products.find((p: any) => p.id === item.productId);
              const hasPotentialOffer = product?.isOffer && item.quantity < (product.minOfferQty || 1) && paymentMethod !== PaymentMethod.ACCOUNT;

              return (
                <div key={idx} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-slate-700 uppercase italic truncate">{item.productName}</p>
                      {item.price === product?.offerPrice && paymentMethod !== PaymentMethod.ACCOUNT && (
                        <span className="bg-promo text-white text-[6px] px-1 rounded-full font-black italic">OFERTA</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[8px] font-bold text-slate-400">UN: R$ {item.price.toFixed(2)}</p>
                      {hasPotentialOffer && (
                        <span className="text-[6px] font-black text-promo uppercase italic">Faltam {product.minOfferQty - item.quantity} p/ oferta</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-full shadow-sm border border-slate-100">
                      <button onClick={() => updateItemQty(idx, -1)} className="w-6 h-6 flex items-center justify-center font-black text-primary hover:bg-slate-50 rounded-full transition-colors">-</button>
                      <span className="text-[10px] font-black w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateItemQty(idx, 1)} className="w-6 h-6 flex items-center justify-center font-black text-primary hover:bg-slate-50 rounded-full transition-colors">+</button>
                    </div>
                    <button
                      onClick={() => removeItem(idx)}
                      className="p-1.5 text-red-300 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                    <span className="text-xs font-black italic text-slate-700 min-w-[60px] text-right">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Painel de Fechamento PDV */}
      <div className="bg-white p-6 pb-8 rounded-t-[45px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] border-t border-slate-100 z-10 space-y-4 flex flex-col items-stretch">
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-[10px] font-black text-primary uppercase italic tracking-widest">TOTAL DA VENDA</span>
          <span className="text-3xl font-black italic text-primary drop-shadow-sm">R$ {total.toFixed(2)}</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {[PaymentMethod.CASH, PaymentMethod.PIX, PaymentMethod.ACCOUNT, PaymentMethod.DEBIT, PaymentMethod.CREDIT].map(m => {
            const isSelected = paymentMethod === m;
            const isAccount = m === PaymentMethod.ACCOUNT;

            // Verifica se o cliente selecionado está bloqueado (dívida > 29 dias)
            let isBlocked = false;
            if (isAccount && selectedClient) {
              const clientOrders = state.orders
                .filter((o: any) => o.clientId === selectedClient.id)
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              const lastDateStr = clientOrders[0]?.createdAt;
              if (lastDateStr && selectedClient.debt > 0) {
                const lastDate = new Date(lastDateStr);
                const today = new Date();
                const diffTime = Math.abs(today.getTime() - lastDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 29) isBlocked = true;
              }
            }

            let activeClass = 'bg-primary text-white border-primary';
            if (isAccount) {
              activeClass = isBlocked ? 'bg-red-100 text-red-300 border-red-200 cursor-not-allowed opacity-50' : 'bg-secondary text-white border-secondary switch-price-animation';
            }

            return (
              <button
                key={m}
                onClick={() => {
                  if (isBlocked) {
                    alert("PAGAMENTO BLOQUEADO: Cliente com dívida superior a 29 dias!");
                    return;
                  }
                  setPaymentMethod(m);
                }}
                disabled={isBlocked && isSelected}
                className={`py-3 rounded-xl text-[9.5px] font-black italic uppercase shadow-sm transition-all border ${isSelected ? `${activeClass} scale-105 shadow-md` : (isBlocked && isAccount ? 'bg-red-50 text-red-200 border-red-100 cursor-not-allowed' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50')}`}
              >
                {isBlocked && isAccount ? '⛔ BLOQ.' : m}
              </button>
            );
          })}
        </div>

        {paymentMethod === PaymentMethod.CASH && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase italic ml-2">VALOR RECEBIDO</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black italic text-[10px]">R$</span>
                <input
                  type="number"
                  value={cashReceived || ''}
                  onChange={e => setCashReceived(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-slate-50 pl-10 pr-4 py-3 rounded-2xl shadow-inner border-none outline-none font-black text-lg text-primary"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase italic ml-2">TROCO</label>
              <div className="w-full bg-blue-50/50 p-3 h-[48px] rounded-2xl font-black italic text-lg text-primary flex items-center justify-center border border-blue-100 shadow-inner">
                R$ {change.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {paymentMethod === PaymentMethod.PIX && total > 0 && (
          <div className="flex flex-col items-center bg-slate-50 p-4 rounded-[30px] border border-slate-100 animate-in zoom-in-95 duration-300 shadow-inner">
            <p className="text-[8px] font-black text-primary uppercase italic mb-2 tracking-widest">ESCANEIE PARA PAGAR VIA PIX</p>
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
              <img src={pixQrCodeUrl} className="w-40 h-40 object-contain" alt="PIX QR Code" />
            </div>
            <p className="text-[7px] font-bold text-slate-400 mt-2 uppercase">CHAVE: {state.config.pixKey}</p>
            <p className="text-[7px] font-bold text-slate-400 uppercase">VALOR: R$ {total.toFixed(2)}</p>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[8px] font-black text-slate-400 uppercase italic ml-2">SELECIONAR CLIENTE</label>
          <div className="relative">
            <select
              className="w-full bg-slate-50 p-3 pr-10 rounded-2xl shadow-inner border-none outline-none text-[10px] font-black text-slate-600 appearance-none uppercase italic"
              onChange={e => setSelectedClient(state.clients.find((c: any) => c.id === e.target.value) || null)}
              value={selectedClient?.id || ''}
            >
              <option value="">-- CLIENTE PDV --</option>
              {state.clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <button
          onClick={handleFinish}
          disabled={items.length === 0}
          className="w-[60%] mx-auto bg-primary text-white py-5 rounded-[32px] font-black italic text-xl uppercase shadow-xl shadow-blue-200 active:scale-[0.97] disabled:opacity-30 disabled:active:scale-100 transition-all border-t border-white/20 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="relative z-10 flex items-center justify-center gap-3 tracking-tighter">
            FINALIZAR VENDA <span className="text-2xl">✅</span>
          </span>
        </button>
      </div>

      {/* Modal do Scanner PDV */}
      <Modal
        isOpen={isScanning}
        onClose={stopScanning}
        title="BIPAR PRODUTO"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-full aspect-square max-w-[300px] bg-black rounded-[40px] overflow-hidden border-4 border-primary shadow-2xl">
            <div id="pdv-reader" className="w-full h-full"></div>
            <div className="absolute inset-0 border-[40px] border-black/30 pointer-events-none"></div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_15px_red] animate-pulse pointer-events-none"></div>
          </div>
          <p className="text-[10px] font-black italic text-slate-400 uppercase text-center animate-pulse tracking-widest">
            Aponte para o código de barras
          </p>
          <Button onClick={stopScanning} variant="ghost" className="w-full text-slate-400 font-black uppercase text-[10px]">CANCELAR</Button>
        </div>
      </Modal>
    </div>
  );
};
