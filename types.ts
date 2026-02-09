
export enum PaymentMethod {
  PIX = 'PIX',
  CREDIT = 'CRÉDITO',
  DEBIT = 'DÉBITO',
  CASH = 'DINHEIRO',
  ACCOUNT = 'A PRAZO'
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  purchasePrice: number;
  profitMargin: number;
  salePrice1: number;
  salePrice2?: number;
  stock: number;
  validity?: string;
  image: string;
  categoryId: string;
  isOffer: boolean;
  isVisible: boolean;
  offerPrice?: number;
  minOfferQty?: number;
}

export interface Client {
  id: string;
  name: string;
  whatsapp: string;
  address: string;
  cpf: string;
  limit: number;
  debt: number;
  photo?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  productName: string;
}

export enum OrderStatus {
  PENDING = 'PENDENTE',
  CONFIRMED = 'CONFIRMADO',
  CANCELLED = 'CANCELADO'
}

export interface Order {
  id: string;
  clientId?: string;
  clientName: string;
  clientWhatsapp: string;
  address: string;
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  type: 'DELIVERY' | 'PICKUP' | 'POS';
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  whatsapp: string;
  birthDate: string;
  cpf: string;
  role: string;
  photo?: string;
  password?: string;
}

export interface CompanyConfig {
  name: string;
  cnpj: string;
  pixKey: string;
  address: string;
  phone: string;
  logoUrl: string;
  colors: {
    menus: string;
    buttons: string;
    promotions: string;
  };
}
