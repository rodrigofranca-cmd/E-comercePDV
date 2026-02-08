
import { CompanyConfig, Category, Product, Client, Employee } from './types';

export const INITIAL_CONFIG: CompanyConfig = {
  name: "MERCADO ONLINE",
  cnpj: "53.950.951/0001-98",
  pixKey: "98970001048",
  address: "Rua Exemplo, 123 - Centro",
  phone: "(98) 97000-1048",
  logoUrl: "https://cdn-icons-png.freepik.com/512/18518/18518050.png",
  colors: {
    menus: "#2563eb", // Blue-600
    buttons: "#f97316", // Orange-500
    promotions: "#ea580c" // Orange-600
  }
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Frutas', image: 'https://cdn-icons-png.freepik.com/512/11111/11111276.png?ga=GA1.1.384170038.1770424620' },
  { id: '2', name: 'Carnes', image: 'https://cdn-icons-png.freepik.com/512/14859/14859394.png?ga=GA1.1.384170038.1770424620' },
  { id: '3', name: 'Mercearia', image: 'https://tse4.mm.bing.net/th/id/OIP.nAmN42negpgI_eeTVJzXggHaF9?rs=1&pid=ImgDetMain&o=7&rm=3' },
  { id: '4', name: 'Bebidas', image: 'https://cdn-icons-png.freepik.com/512/3194/3194517.png' },
];

export const INITIAL_PRODUCTS: Product[] = [
  // FRUTAS (Categoria 1)
  {
    id: 'p1',
    barcode: '789001',
    name: 'Banana Prata kg',
    purchasePrice: 3.00,
    profitMargin: 66,
    salePrice1: 4.99,
    stock: 100,
    image: 'https://cdn-icons-png.flaticon.com/512/2909/2909761.png',
    categoryId: '1',
    isOffer: true,
    offerPrice: 3.99,
    minOfferQty: 3
  },
  {
    id: 'p2',
    barcode: '789002',
    name: 'Maçã Gala kg',
    purchasePrice: 4.50,
    profitMargin: 44,
    salePrice1: 6.50,
    stock: 80,
    image: 'https://cdn-icons-png.flaticon.com/512/415/415733.png',
    categoryId: '1',
    isOffer: false
  },
  // CARNES (Categoria 2)
  {
    id: 'p3',
    barcode: '789003',
    name: 'Alcatra Bovina kg',
    purchasePrice: 28.00,
    profitMargin: 42,
    salePrice1: 39.90,
    stock: 25,
    image: 'https://cdn-icons-png.flaticon.com/512/3143/3143643.png',
    categoryId: '2',
    isOffer: false
  },
  {
    id: 'p4',
    barcode: '789004',
    name: 'Sobrecoxa Frango kg',
    purchasePrice: 8.50,
    profitMargin: 75,
    salePrice1: 14.90,
    stock: 40,
    image: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png',
    categoryId: '2',
    isOffer: true,
    offerPrice: 12.90,
    minOfferQty: 2
  },
  // MERCEARIA (Categoria 3)
  {
    id: 'p5',
    barcode: '789005',
    name: 'Café Tradicional 500g',
    purchasePrice: 11.00,
    profitMargin: 71,
    salePrice1: 18.90,
    stock: 60,
    image: 'https://cdn-icons-png.flaticon.com/512/2835/2835154.png',
    categoryId: '3',
    isOffer: true,
    offerPrice: 15.90,
    minOfferQty: 1
  },
  {
    id: 'p6',
    barcode: '789006',
    name: 'Açúcar Refinado 1kg',
    purchasePrice: 2.80,
    profitMargin: 60,
    salePrice1: 4.50,
    stock: 120,
    image: 'https://cdn-icons-png.flaticon.com/512/5029/5029241.png',
    categoryId: '3',
    isOffer: false
  },
  // BEBIDAS (Categoria 4)
  {
    id: 'p7',
    barcode: '789007',
    name: 'Coca-Cola 2L',
    purchasePrice: 6.80,
    profitMargin: 47,
    salePrice1: 9.99,
    stock: 48,
    image: 'https://cdn-icons-png.freepik.com/512/15595/15595920.png',
    categoryId: '4',
    isOffer: true,
    offerPrice: 8.99,
    minOfferQty: 3
  },
  {
    id: 'p8',
    barcode: '789008',
    name: 'Água Mineral 500ml',
    purchasePrice: 0.60,
    profitMargin: 233,
    salePrice1: 2.00,
    stock: 200,
    image: 'https://cdn-icons-png.flaticon.com/512/3100/3100566.png',
    categoryId: '4',
    isOffer: false
  }
];

export const INITIAL_CLIENTS: Client[] = [];
