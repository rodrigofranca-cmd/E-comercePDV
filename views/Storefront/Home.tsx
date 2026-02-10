
import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../../components/UI';
import { StoreHeader } from '../../components/Store/StoreHeader';
import { Category, Product } from '../../types';

interface HomeViewProps {
  state: any;
  onNavigate: (view: 'store' | 'admin' | 'login' | 'cart') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ state, onNavigate }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showOnlyOffers, setShowOnlyOffers] = useState(false);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

  const welcomeMessage = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "BOM DIA, BEM-VINDO!";
    if (hour < 18) return "BOA TARDE, BEM-VINDA!";
    return "BOA NOITE, BEM-VINDO!";
  }, []);

  const filteredProducts = useMemo(() => {
    return state.products.filter((p: Product) => {
      // Regra de Estoque: Só exibe se stock > 0
      if (p.stock <= 0) return false;

      if (showOnlyOffers) return p.isOffer;
      const matchesCategory = selectedCategory ? p.categoryId === selectedCategory : true;
      const matchesSearch = search ? p.name.toLowerCase().includes(search.toLowerCase()) : true;
      return p.isVisible && matchesCategory && matchesSearch;
    });
  }, [state.products, selectedCategory, showOnlyOffers, search]);

  const visibleCategories = useMemo(() => {
    return state.categories.filter((cat: Category) =>
      state.products.some((p: Product) => p.isVisible && p.categoryId === cat.id && p.stock > 0)
    );
  }, [state.categories, state.products]);

  const offers = useMemo(() => state.products.filter((p: Product) => p.isVisible && p.isOffer && p.stock > 0), [state.products]);

  useEffect(() => {
    if (offers.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [offers]);

  const cartCount = state.cart.reduce((acc: number, item: any) => acc + item.quantity, 0);

  const handleCategoryClick = (catId: string) => {
    setShowOnlyOffers(false);
    setSearch('');
    setSelectedCategory(selectedCategory === catId ? null : catId);
  };

  return (
    <div className="flex flex-col h-screen overflow-y-auto pb-32 bg-white select-none relative">
      {/* 1. Header with Search Bar */}
      {/* 1. Header with Search Bar */}
      <StoreHeader
        state={state}
        welcomeMessage={welcomeMessage}
        onNavigate={onNavigate}
        search={search}
        setSearch={setSearch}
      />

      <div className="mt-8 px-4">
        {/* Departamentos */}
        {!search && (
          <div className="mb-2">
            <div className="flex gap-3 overflow-x-auto pb-2 carousel-scroll">
              {visibleCategories.map((cat: Category) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex flex-col items-center gap-1.5 min-w-[72px] transition-all ${selectedCategory === cat.id ? 'scale-105' : 'scale-100'}`}
                >
                  <div className={`w-16 h-16 rounded-full border-[3px] overflow-hidden flex items-center justify-center shadow-md bg-white ${selectedCategory === cat.id ? 'border-secondary' : 'border-gray-50'}`}>
                    <img src={cat.image} className="w-full h-full object-cover" alt={cat.name} />
                  </div>
                  <span className="text-[10px] font-black text-gray-800 uppercase italic truncate w-full text-center drop-shadow-sm leading-tight px-1">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ofertas */}
        {offers.length > 0 && !search && (
          <div className="mt-0 mb-4">
            <div className="flex justify-between items-end mb-2">
              <h3 className="text-gray-400 font-black text-[10px] flex items-center gap-2 tracking-[0.2em] uppercase">Ofertas Imbatíveis 🔥</h3>
              <div className="flex gap-0.5 mb-0.5">
                {offers.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentOfferIndex ? 'w-3 bg-secondary' : 'w-1 bg-gray-200'}`}></div>
                ))}
              </div>
            </div>

            <button
              onClick={() => { setShowOnlyOffers(!showOnlyOffers); setSelectedCategory(null); }}
              className={`group w-full text-left bg-promo rounded-[30px] px-5 py-3 text-white relative overflow-hidden shadow-2xl transition-all active:scale-[0.98] ${showOnlyOffers ? 'ring-2 ring-white/50' : ''}`}
              style={{ background: `linear-gradient(135deg, var(--color-promo), ${state.config.colors.promotions}dd)` }}
            >
              <div className="relative w-full min-h-[85px] flex items-center z-10">
                {offers.map((offer: Product, idx: number) => (
                  <div
                    key={offer.id}
                    className={`absolute inset-0 flex items-center justify-between gap-3 transition-all duration-[800ms] ease-in-out transform ${idx === currentOfferIndex ? 'translate-x-0 opacity-100' : (idx < currentOfferIndex ? '-translate-x-12 opacity-0' : 'translate-x-12 opacity-0')
                      }`}
                  >
                    <div className="flex-1 pr-1">
                      <h4 className="text-base font-black italic mb-0.5 leading-tight uppercase tracking-tight truncate drop-shadow-md">{offer.name}</h4>
                      <div className="flex flex-col">
                        <span className="text-[8px] opacity-70 line-through font-bold">R$ {offer.salePrice1.toFixed(2)}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-[10px] font-bold opacity-90">R$</span>
                          <span className="text-xl font-black italic leading-none">{offer.offerPrice?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative w-24 h-24 bg-white/95 backdrop-blur-sm rounded-[22px] p-2 shadow-lg flex items-center justify-center flex-shrink-0 border border-white/50 overflow-hidden">
                      <img src={offer.image} className="w-full h-full object-contain drop-shadow-sm" alt={offer.name} />
                    </div>
                  </div>
                ))}
              </div>
            </button>
          </div>
        )}

        {/* Lista de Produtos - Grade de 3 Colunas */}
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">
              {search ? 'Resultados' : selectedCategory ? 'Destaques do Setor' : 'Mais Procurados'}
            </h3>
            {(showOnlyOffers || selectedCategory || search) && (
              <button
                onClick={() => { setShowOnlyOffers(false); setSelectedCategory(null); setSearch(''); }}
                className="text-[9px] font-black italic text-secondary uppercase underline"
              >
                Ver Tudo
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {filteredProducts.map((product: Product) => {
              const inCart = state.cart.find((i: any) => i.productId === product.id);
              const price = product.isOffer ? product.offerPrice : product.salePrice1;
              return (
                <div key={product.id} className="bg-white rounded-[24px] p-2 pb-4 flex flex-col items-center border border-gray-100 shadow-sm relative active:scale-[0.98] transition-all group overflow-hidden">
                  {/* Selo de Oferta - Com Nome OFERTA e Qtd Mínima (Fontes aumentadas) */}
                  {product.isOffer && (
                    <div className="absolute top-1 right-1 flex flex-col items-end gap-0.5 z-10">
                      <span className="bg-promo text-white text-[7.5px] px-2 py-0.5 rounded-full font-black italic uppercase shadow-md leading-none">
                        OFERTA
                      </span>
                      {product.minOfferQty && product.minOfferQty > 1 && (
                        <span className="bg-white/90 text-promo text-[6.5px] px-1.5 py-0.5 rounded-full font-black italic border border-promo/20 shadow-sm leading-tight">
                          MIN: {product.minOfferQty}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="relative w-full h-28 mb-2">
                    <div className="w-full h-full p-2 bg-gray-50/40 rounded-[20px] flex items-center justify-center overflow-hidden">
                      <img src={product.image} className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500" alt="" />
                    </div>

                    {/* Botão de Adicionar / Controle de Quantidade */}
                    <div className="absolute bottom-0 right-0 translate-x-1.5 translate-y-1.5 z-20">
                      {!inCart ? (
                        <button
                          onClick={() => state.addToCart(product, 1)}
                          className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-xl font-black text-xl transition-all active:scale-90 border-[3px] border-white"
                        >
                          +
                        </button>
                      ) : (
                        <div className="flex items-center justify-between bg-green-500 rounded-full h-10 w-28 px-2 text-white shadow-xl animate-in slide-in-from-right duration-300 border-[3px] border-white overflow-hidden">
                          <button onClick={() => state.addToCart(product, -1)} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-black text-xs active:scale-90 transition-transform">-</button>
                          <span className="flex-1 text-center font-black italic text-[11px] px-2">{inCart.quantity}</span>
                          <button onClick={() => state.addToCart(product, 1)} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-black text-xs active:scale-90 transition-transform">+</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-[8.5px] font-black text-gray-800 uppercase italic truncate w-full text-center mb-0.5 px-0.5 leading-tight">{product.name}</p>

                  {/* Exibição de Preço com Riscado acima para Ofertas */}
                  <div className="flex flex-col items-center">
                    {product.isOffer && (
                      <span className="text-[9px] font-bold text-gray-400 line-through leading-none mb-0.5">
                        R$ {product.salePrice1.toFixed(2)}
                      </span>
                    )}
                    <p className="text-secondary font-black italic text-[14px] leading-none">R$ {price?.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-16 text-center opacity-30 flex flex-col items-center">
              <svg className="w-10 h-10 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <p className="text-[10px] font-black uppercase italic">Sem resultados</p>
            </div>
          )}
        </div>
      </div>

      {/* Botão de Carrinho Flutuante */}
      {cartCount > 0 && (
        <div className="fixed bottom-10 right-8 z-50">
          <button
            onClick={() => onNavigate('cart')}
            className="relative p-2 bg-transparent active:scale-90 transition-transform flex items-center justify-center group"
          >
            <svg className="w-12 h-12 text-secondary drop-shadow-2xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <div className="absolute -top-1 -right-1 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-black text-xs border-2 border-white shadow-lg animate-float">
              {cartCount}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
