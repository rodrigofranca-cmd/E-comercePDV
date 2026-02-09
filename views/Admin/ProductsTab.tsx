
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button, Input, Modal, Card } from '../../components/UI';
import { Product, Category } from '../../types';
import { Html5Qrcode } from 'html5-qrcode';

export const ProductsTab: React.FC<{ state: any }> = ({ state }) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'none' | 'low-stock' | 'expiring'>('none');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Estados para Importação
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emptyProduct: Partial<Product> = {
    name: '',
    barcode: '',
    purchasePrice: 0,
    profitMargin: 25,
    salePrice1: 0,
    stock: 0,
    image: '',
    isOffer: false,
    isVisible: true,
    offerPrice: 0,
    minOfferQty: 1,
    categoryId: state.categories[0]?.id || ''
  };

  const [productForm, setProductForm] = useState<Partial<Product>>(emptyProduct);

  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({
    name: '',
    image: ''
  });

  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setProductForm(emptyProduct);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({ ...product });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.salePrice1) {
      alert("Nome e Preço são obrigatórios!");
      return;
    }

    if (editingProductId) {
      await state.updateProduct({ ...productForm, id: editingProductId } as Product);
      alert("Produto atualizado com sucesso!");
    } else {
      const newProduct = {
        ...productForm,
        id: Math.random().toString(36).substr(2, 9),
      } as Product;
      await state.addProduct(newProduct);
      alert("Produto cadastrado com sucesso!");
    }

    setIsProductModalOpen(false);
  };

  // Função de Importação de CSV
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(10);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      const newProducts: Product[] = [];
      const totalLines = lines.length - 1;

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',').map(v => v.trim());
        const productData: any = {};

        headers.forEach((header, index) => {
          productData[header] = values[index];
        });

        // Mapeamento e fallback para ID de Categoria
        const catId = productData.categoryid || state.categories[0]?.id || '1';

        const product: Product = {
          id: Math.random().toString(36).substr(2, 9),
          barcode: productData.barcode || '',
          name: productData.name || 'Produto sem nome',
          purchasePrice: Number(productData.purchaseprice) || 0,
          profitMargin: Number(productData.profitmargin) || 0,
          salePrice1: Number(productData.saleprice) || 0,
          stock: Number(productData.stock) || 0,
          image: productData.image || 'https://cdn-icons-png.flaticon.com/512/679/679821.png',
          categoryId: catId,
          isOffer: productData.isoffer?.toLowerCase() === 'true',
          isVisible: true, // Default to visible on import
          offerPrice: Number(productData.offerprice) || 0,
          minOfferQty: Number(productData.minofferqty) || 1,
        };

        newProducts.push(product);
        // Call addProduct for each imported item (or batch if we supported it, but loop is fine for now)
        await state.addProduct(product);

        // Simular progresso
        if (i % 5 === 0) {
          setImportProgress(Math.min(90, 10 + (i / totalLines) * 80));
          await new Promise(r => setTimeout(r, 50));
        }
      }

      setImportProgress(100);

      setTimeout(() => {
        setIsImporting(false);
        setImportProgress(0);
        alert(`${newProducts.length} produtos importados com sucesso!`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 500);
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const headers = "barcode,name,purchasePrice,profitMargin,salePrice,stock,categoryId,image,isOffer,offerPrice,minOfferQty";
    const example = "789123456,Arroz 5kg,15.00,30,19.50,100,3,https://exemplo.com/arroz.png,false,0,0";
    const blob = new Blob([`${headers}\n${example}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_importacao.csv';
    a.click();
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name) return;
    const newCat = {
      ...categoryForm,
      id: Math.random().toString(36).substr(2, 9),
    } as Category;
    await state.addCategory(newCat);
    setIsCategoryModalOpen(false);
    alert("Categoria salva com sucesso!");
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
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      const qrConfig = { fps: 10, qrbox: { width: 250, height: 150 } };

      html5QrCode.start(
        { facingMode: "environment" },
        qrConfig,
        (decodedText) => {
          setProductForm(prev => ({ ...prev, barcode: decodedText }));
          stopScanning();
        },
        () => { }
      ).catch(err => {
        console.error("Scanner error:", err);
        alert("Erro ao abrir a câmera. Verifique as permissões.");
        setIsScanning(false);
      });
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => { });
      }
    };
  }, [isScanning]);

  const calculateSalePrice = (buy: number, margin: number) => {
    return Number((buy * (1 + margin / 100)).toFixed(2));
  };

  const updatePurchasePrice = (val: number) => {
    const margin = productForm.profitMargin !== undefined ? productForm.profitMargin : 25;
    setProductForm({
      ...productForm,
      purchasePrice: val,
      salePrice1: calculateSalePrice(val, margin)
    });
  };

  const updateProfitMargin = (val: number) => {
    const buy = productForm.purchasePrice || 0;
    setProductForm({
      ...productForm,
      profitMargin: val,
      salePrice1: calculateSalePrice(buy, val)
    });
  };

  const filteredProducts = useMemo(() => {
    return state.products.filter((p: Product) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
      if (!matchesSearch) return false;
      if (activeFilter === 'low-stock') return p.stock < 5;
      if (activeFilter === 'expiring') {
        if (!p.validity) return false;
        const expiryDate = new Date(p.validity);
        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 20;
      }
      return true;
    });
  }, [state.products, search, activeFilter]);

  return (
    <div className="space-y-4">
      {/* Botões de Ação Superiores */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleOpenNewProduct}
          className="bg-secondary p-5 rounded-[30px] text-white font-black italic uppercase text-[9px] flex flex-col items-center justify-center text-center gap-2 shadow-xl active:scale-95 transition-all border border-white/20"
        >
          <span className="text-2xl filter drop-shadow-md">📦</span>
          <span className="leading-tight tracking-tight drop-shadow-md uppercase">CADASTRO DE PRODUTOS / SERVIÇOS</span>
        </button>

        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className="bg-secondary p-5 rounded-[30px] text-white font-black italic uppercase text-[9px] flex flex-col items-center justify-center text-center gap-2 shadow-xl active:scale-95 transition-all border border-white/20"
        >
          <span className="text-2xl filter drop-shadow-md">🗂️</span>
          <span className="leading-tight tracking-tight drop-shadow-md uppercase">CADASTRO DE CATEGORIAS / SETOR</span>
        </button>
      </div>

      {/* ÁREA DE IMPORTAÇÃO (Conforme Retângulo Azul no Screenshot) */}
      <div className="px-1 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-white border-2 border-dashed border-slate-200 py-3 rounded-[20px] flex items-center justify-center gap-3 active:scale-95 transition-all group"
          >
            <span className="text-lg group-hover:animate-bounce">📥</span>
            <span className="text-[10px] font-black italic text-slate-400 uppercase tracking-tighter">IMPORTAR PRODUTOS (CSV/EXCEL)</span>
          </button>
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="w-12 bg-slate-50 border border-slate-100 rounded-[20px] flex items-center justify-center text-lg active:scale-90"
            title="Ver Modelo de Planilha"
          >
            📋
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportCSV}
          accept=".csv"
          className="hidden"
        />

        {/* Barra de Status de Carregamento */}
        {isImporting && (
          <div className="animate-in fade-in slide-in-from-top duration-300">
            <div className="flex justify-between items-center mb-1 px-2">
              <span className="text-[8px] font-black text-slate-400 uppercase italic">PROCESSANDO PLANILHA...</span>
              <span className="text-[8px] font-black text-primary italic">{Math.round(importProgress)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50 shadow-inner">
              <div
                className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                style={{ width: `${importProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Barra de Pesquisa de Produtos */}
      <div className="relative group px-1">
        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </span>
        <input
          type="text"
          placeholder="PESQUISAR PRODUTO..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-6 py-2.5 bg-white rounded-[20px] shadow-sm outline-none focus:ring-2 focus:ring-secondary transition-all text-slate-700 font-black italic uppercase text-[9px] border border-slate-100"
        />
      </div>

      {/* Filtros Especiais */}
      <div className="grid grid-cols-2 gap-3 px-1">
        <button
          onClick={() => setActiveFilter(activeFilter === 'low-stock' ? 'none' : 'low-stock')}
          className={`py-2 px-3 rounded-xl text-[8px] font-black italic uppercase transition-all border-2 flex items-center justify-center gap-2 ${activeFilter === 'low-stock'
            ? 'bg-primary text-white border-primary shadow-lg scale-105'
            : 'bg-white text-primary border-primary shadow-sm active:scale-95'
            }`}
        >
          <span className="text-sm">⚠️</span>
          ESTOQUE BAIXO ({"<"}5)
        </button>
        <button
          onClick={() => setActiveFilter(activeFilter === 'expiring' ? 'none' : 'expiring')}
          className={`py-2 px-3 rounded-xl text-[8px] font-black italic uppercase transition-all border-2 flex items-center justify-center gap-2 ${activeFilter === 'expiring'
            ? 'bg-primary text-white border-primary shadow-lg scale-105'
            : 'bg-white text-primary border-primary shadow-sm active:scale-95'
            }`}
        >
          <span className="text-sm">📅</span>
          VENCIMENTO ({"<"}20d)
        </button>
      </div>

      <div className="bg-slate-100/50 rounded-t-[40px] p-2 pt-4 pb-12 space-y-3">
        {/* Lista de Produtos */}
        <div className="space-y-2.5 px-3">
          {filteredProducts.map((p: Product) => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-3 bg-white rounded-[22px] border border-slate-50 shadow-sm active:scale-[0.98] transition-all cursor-pointer group relative"
            >
              {/* Toggle de Visibilidade Direto na Lista */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  state.updateProduct({ ...p, isVisible: !p.isVisible });
                }}
                className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all z-10 ${p.isVisible ? 'bg-secondary' : 'bg-slate-300'}`}
                title={p.isVisible ? "Produto Visível" : "Produto Oculto"}
              >
                <span className="text-[10px]">{p.isVisible ? '👁️' : '🚫'}</span>
              </button>

              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center p-1.5 border border-slate-50 group-hover:scale-105 transition-transform" onClick={() => handleEditProduct(p)}>
                <img src={p.image} className="max-w-full max-h-full object-contain filter drop-shadow-sm" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-slate-700 leading-tight truncate uppercase italic">{p.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className={`text-[8px] font-bold uppercase tracking-tight ${p.stock < 5 ? 'text-red-500' : 'text-slate-400'}`}>
                    ESTOQUE: <span className="font-black">{p.stock}</span>
                  </p>
                  {p.validity && (
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">VALIDADE: <span className="text-slate-600 font-black">{new Date(p.validity).toLocaleDateString('pt-BR')}</span></p>
                  )}
                </div>
              </div>
              <div className="text-right flex flex-col justify-center">
                {p.isOffer && (
                  <p className="text-[8px] font-bold text-slate-300 line-through uppercase tracking-tighter leading-none mb-0.5">R$ {p.salePrice1.toFixed(2)}</p>
                )}
                <p className="text-xs font-black italic text-secondary leading-none">
                  R$ {(p.isOffer ? (p.offerPrice || p.salePrice1) : p.salePrice1).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Modelo de Planilha */}
      <Modal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} title="MODELO DE PLANILHA">
        <div className="space-y-6">
          <div className="bg-slate-50 p-5 rounded-[30px] border border-slate-100 space-y-4">
            <p className="text-[10px] font-black italic text-slate-500 uppercase leading-relaxed">
              O arquivo deve ser um **CSV** (Separado por vírgulas) com os seguintes cabeçalhos exatos na primeira linha:
            </p>
            <div className="bg-white p-3 rounded-2xl border border-slate-100 overflow-x-auto">
              <code className="text-[9px] font-bold text-primary whitespace-nowrap">
                barcode,name,purchasePrice,profitMargin,salePrice,stock,categoryId,image,isOffer,offerPrice,minOfferQty
              </code>
            </div>
            <div className="space-y-2">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">• categoryId: Verifique os IDs na aba de categorias (ex: 1, 2, 3...)</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">• isOffer: use "true" ou "false"</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">• Imagens: Use links completos (http...)</p>
            </div>
          </div>
          <Button onClick={downloadTemplate} className="w-full bg-primary py-4 rounded-[25px] font-black italic uppercase text-xs">BAIXAR PLANILHA MODELO (CSV)</Button>
        </div>
      </Modal>

      {/* Modais de Cadastro de Produto e Categoria (Removidos p/ brevidade pois não mudaram, mas incluídos no contexto real) */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProductId ? "EDIÇÃO DE PRODUTO" : "CADASTRO DE PRODUTO"}
      >
        <div className="space-y-5">
          <div className="flex gap-4">
            <Input label="CÓDIGO DE BARRAS" className="flex-1" value={productForm.barcode} onChange={e => setProductForm({ ...productForm, barcode: e.target.value })} />
            <button onClick={startScanning} className="p-4 bg-slate-100 rounded-3xl self-end active:scale-90 transition-transform shadow-inner"><svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></button>
          </div>
          <Input label="NOME DO PRODUTO *" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="PREÇO COMPRA *" type="number" value={productForm.purchasePrice} onChange={e => updatePurchasePrice(Number(e.target.value))} />
            <Input label="% LUCRO" type="number" value={productForm.profitMargin} onChange={e => updateProfitMargin(Number(e.target.value))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="PREÇO VENDA *" type="number" value={productForm.salePrice1} onChange={e => setProductForm({ ...productForm, salePrice1: Number(e.target.value) })} />
            <div className="flex flex-col gap-1 w-full"><label className="text-[10px] font-black italic uppercase text-gray-400 ml-2">CATEGORIA</label><select className="px-4 py-2 bg-gray-100 border-none rounded-2xl outline-none shadow-inner text-sm font-bold text-gray-700" value={productForm.categoryId} onChange={e => setProductForm({ ...productForm, categoryId: e.target.value })}>{state.categories.map((c: any) => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="ESTOQUE" type="number" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })} />
            <Input label="VALIDADE" type="date" value={productForm.validity || ''} onChange={e => setProductForm({ ...productForm, validity: e.target.value })} />
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex-1"><Input label="URL IMAGEM" value={productForm.image} onChange={e => setProductForm({ ...productForm, image: e.target.value })} /></div>
            <div className="w-20 h-20 bg-slate-50 rounded-[25px] border-2 border-dashed flex items-center justify-center p-2 overflow-hidden">{productForm.image ? (<img src={productForm.image} className="max-h-full object-contain" />) : (<span className="text-[7px] text-slate-300 uppercase">SEM FOTO</span>)}</div>
          </div>
          <div className="p-5 bg-orange-50/50 rounded-[35px] border border-orange-100 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black italic uppercase text-orange-600">Ativar Oferta?</span>
              <input type="checkbox" checked={productForm.isOffer} onChange={e => setProductForm({ ...productForm, isOffer: e.target.checked })} className="w-12 h-6 bg-slate-200 rounded-full appearance-none checked:bg-secondary transition-all relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:w-4 after:h-4 after:rounded-full checked:after:translate-x-6 shadow-inner" />
            </div>
            {productForm.isOffer && (<div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300"><Input label="PREÇO OFERTA" type="number" value={productForm.offerPrice} onChange={e => setProductForm({ ...productForm, offerPrice: Number(e.target.value) })} /><Input label="QTD MÍN" type="number" value={productForm.minOfferQty} onChange={e => setProductForm({ ...productForm, minOfferQty: Number(e.target.value) })} /></div>)}

            <div className="h-px bg-orange-200/50 w-full"></div>

            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black italic uppercase text-slate-500">Produto Visível para Venda?</span>
              <input type="checkbox" checked={productForm.isVisible} onChange={e => setProductForm({ ...productForm, isVisible: e.target.checked })} className="w-12 h-6 bg-slate-200 rounded-full appearance-none checked:bg-green-500 transition-all relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:w-4 after:h-4 after:rounded-full checked:after:translate-x-6 shadow-inner" />
            </div>
          </div>
          <Button onClick={handleSaveProduct} variant="secondary" className="w-full py-5 text-xl italic font-black uppercase rounded-[30px] shadow-xl">{editingProductId ? 'ATUALIZAR PRODUTO' : 'SALVAR NOVO PRODUTO'}</Button>
        </div>
      </Modal>

      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="CADASTRO DE CATEGORIA">
        <div className="space-y-6">
          <Input label="NOME DA CATEGORIA *" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} />
          <Input label="URL DA IMAGEM *" value={categoryForm.image} onChange={e => setCategoryForm({ ...categoryForm, image: e.target.value })} />
          <Button onClick={handleSaveCategory} variant="secondary" className="w-full py-4 text-lg italic font-black uppercase rounded-[25px]">SALVAR CATEGORIA</Button>
        </div>
      </Modal>

      <Modal isOpen={isScanning} onClose={stopScanning} title="ESCANEANDO CÓDIGO">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-full aspect-square max-w-[300px] bg-black rounded-3xl overflow-hidden border-4 border-secondary shadow-2xl"><div id="reader" className="w-full h-full"></div></div>
          <Button onClick={stopScanning} className="w-full bg-slate-200 text-slate-600 shadow-none">CANCELAR</Button>
        </div>
      </Modal>
    </div>
  );
};
