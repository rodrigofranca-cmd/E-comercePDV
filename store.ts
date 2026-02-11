
import { useState, useEffect, useCallback } from 'react';
import { supabase } from './src/lib/supabase';
import { CompanyConfig, Category, Product, Client, Employee, Order, OrderItem, OrderStatus, PaymentMethod } from './types';
import { INITIAL_CONFIG, INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_CLIENTS } from './constants';

export const useAppState = () => {
  const [config, setConfig] = useState<CompanyConfig>(() => {
    const saved = localStorage.getItem('market_config');
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [cart, setCart] = useState<OrderItem[]>([]);

  // Supabase Data Loading
  useEffect(() => {
    const fetchData = async () => {
      const { data: catData } = await supabase.from('categories').select('*');
      if (catData) setCategories(catData);

      const { data: prodData } = await supabase.from('products').select('*');
      if (prodData) {
        const formattedProducts = prodData.map((p: any) => ({
          ...p,
          purchasePrice: p.purchase_price,
          profitMargin: p.profit_margin,
          salePrice1: p.sale_price1,
          salePrice2: p.sale_price2,
          categoryId: p.category_id,
          isOffer: p.is_offer,
          isVisible: p.is_visible,
          offerPrice: p.offer_price,
          minOfferQty: p.min_offer_qty
        }));
        setProducts(formattedProducts);
      }

      const { data: cliData } = await supabase.from('clients').select('*');
      if (cliData) {
        const formattedClients = cliData.map((c: any) => ({
          ...c,
          limit: c.limit_value
        }));
        setClients(formattedClients);
      }

      // Fetch employees
      const { data: empData } = await supabase.from('employees').select('*');
      if (empData) {
        const formattedEmployees = empData.map((e: any) => ({
          ...e,
          birthDate: e.birth_date
        }));
        setEmployees(formattedEmployees);
      }

      const { data: ordData } = await supabase.from('orders').select('*, items:order_items(*)');
      if (ordData) {
        // Map database naming convention back to UI types if needed, or ensure query matches.
        // The current types match mostly, but we need to check if 'order_items' comes as 'items'
        // We used alias in the query above if we could, but here we just map it.
        const formattedOrders = ordData.map((o: any) => ({
          ...o,
          clientId: o.client_id,
          clientName: o.client_name,
          clientWhatsapp: o.client_whatsapp,
          paymentMethod: o.payment_method,
          createdAt: o.created_at,
          items: o.items.map((i: any) => ({
            ...i,
            productId: i.product_id,
            productName: i.product_name
          }))
        }));
        setOrders(formattedOrders);
      }
    };

    fetchData();

    // Realtime Subscriptions
    const channels = [
      supabase.channel('public:categories').on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, (payload) => {
        if (payload.eventType === 'INSERT') setCategories(prev => [...prev, payload.new as Category]);
        if (payload.eventType === 'UPDATE') setCategories(prev => prev.map(c => c.id === payload.new.id ? payload.new as Category : c));
        if (payload.eventType === 'DELETE') setCategories(prev => prev.filter(c => c.id !== payload.old.id));
      }).subscribe(),

      supabase.channel('public:products').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        const mapProduct = (p: any) => ({
          ...p,
          purchasePrice: p.purchase_price,
          profitMargin: p.profit_margin,
          salePrice1: p.sale_price1,
          salePrice2: p.sale_price2,
          categoryId: p.category_id,
          isOffer: p.is_offer,
          isVisible: p.is_visible,
          offerPrice: p.offer_price,
          minOfferQty: p.min_offer_qty
        });

        if (payload.eventType === 'INSERT') setProducts(prev => [...prev, mapProduct(payload.new)]);
        if (payload.eventType === 'UPDATE') setProducts(prev => prev.map(p => p.id === payload.new.id ? mapProduct(payload.new) : p));
        if (payload.eventType === 'DELETE') setProducts(prev => prev.filter(p => p.id !== payload.old.id));
      }).subscribe(),

      supabase.channel('public:orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const { data } = await supabase.from('orders').select('*, items:order_items(*)').eq('id', payload.new.id).single();
          if (data) {
            const newOrder = {
              ...data,
              clientId: data.client_id,
              clientName: data.client_name,
              clientWhatsapp: data.client_whatsapp,
              paymentMethod: data.payment_method,
              createdAt: data.created_at,
              items: data.items.map((i: any) => ({ ...i, productId: i.product_id, productName: i.product_name }))
            };
            setOrders(prev => [newOrder, ...prev]);
          }
        }
        if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, status: payload.new.status } : o));
        }
      }).subscribe(),

      supabase.channel('public:clients').on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, (payload) => {
        const mapClient = (c: any) => ({ ...c, limit: c.limit_value });
        if (payload.eventType === 'INSERT') setClients(prev => [...prev, mapClient(payload.new)]);
        if (payload.eventType === 'UPDATE') setClients(prev => prev.map(c => c.id === payload.new.id ? mapClient(payload.new) : c));
      }).subscribe()
    ];

    return () => {
      channels.forEach(ch => ch.unsubscribe());
    };
  }, []);

  const addToCart = (product: Product | { id: string }, quantity: number = 1) => {
    const fullProduct = products.find(p => p.id === product.id);
    if (!fullProduct) return;

    setCart(prev => {
      const existing = prev.find(item => item.productId === fullProduct.id);
      const newQty = (existing ? existing.quantity : 0) + quantity;

      if (newQty <= 0) {
        return prev.filter(item => item.productId !== fullProduct.id);
      }

      let currentPrice = fullProduct.salePrice1;
      if (fullProduct.isOffer && fullProduct.offerPrice !== undefined) {
        const minQty = fullProduct.minOfferQty || 1;
        if (newQty >= minQty) {
          currentPrice = fullProduct.offerPrice;
        }
      }

      if (existing) {
        return prev.map(item => item.productId === fullProduct.id
          ? { ...item, quantity: newQty, price: currentPrice }
          : item
        );
      }

      return [...prev, {
        productId: fullProduct.id,
        quantity: Math.max(1, newQty),
        price: currentPrice,
        productName: fullProduct.name
      }];
    });
  };

  const clearCart = () => setCart([]);

  const saveOrder = async (order: Order) => {
    // 1. Save Order to Supabase
    const { error: orderError } = await supabase.from('orders').insert({
      id: order.id,
      client_id: order.clientId,
      client_name: order.clientName,
      client_whatsapp: order.clientWhatsapp,
      address: order.address,
      total: order.total,
      payment_method: order.paymentMethod,
      status: order.status,
      type: order.type,
      created_at: order.createdAt
    });

    if (orderError) {
      console.error("Error saving order:", orderError);
      alert("Erro ao salvar pedido no banco de dados.");
      return;
    }

    // 2. Save Order Items
    const itemsToInsert = order.items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
      product_name: item.productName
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert as any);
    if (itemsError) console.error("Error saving items:", itemsError);

    // 3. Update Stock (Handled locally by realtime subscription ideally, but we nudge it here for specific logic if needed)
    // Actually, good practice is to call an RPC or handle it backend, but for now client-side update:
    for (const item of order.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        await supabase.from('products').update({ stock: product.stock - item.quantity }).eq('id', item.productId);
      }
    }

    // 4. Update Client Debt
    if (order.paymentMethod === PaymentMethod.ACCOUNT && order.clientId) {
      const client = clients.find(c => c.id === order.clientId);
      if (client) {
        await supabase.from('clients').update({ debt: client.debt + order.total }).eq('id', order.clientId);
      }
    }
  };

  const updateClientDebt = async (clientId: string, amount: number) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      await supabase.from('clients').update({ debt: Math.max(0, client.debt + amount) }).eq('id', clientId);
    }
  };

  return {
    config, setConfig,
    categories, setCategories,
    products, setProducts,
    clients, setClients,
    employees, setEmployees,
    orders, setOrders,
    cart, addToCart, clearCart, setCart,
    saveOrder, updateClientDebt,
    deleteOrder: async (orderId: string) => {
      // 1. Restaurar estoque
      const order = orders.find(o => o.id === orderId);
      if (order && order.status !== OrderStatus.CANCELLED) { // Só restaura se não tiver sido cancelado já (pois cancelar já restaura)
        for (const item of order.items) {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            await supabase.from('products').update({ stock: product.stock + item.quantity }).eq('id', item.productId);
          }
        }
      }

      // 2. Deletar (Cascata deve deletar itens, mas por segurança deletamos manual se precisar, mas FK com cascade é o ideal. Vamos assumir FK cascade ou deletar itens primeiro)
      await supabase.from('order_items').delete().eq('order_id', orderId);
      const { error } = await supabase.from('orders').delete().eq('id', orderId);

      if (error) {
        console.error("Error deleting order:", error);
        alert("Erro ao excluir venda.");
      } else {
        // Atualiza estado local
        setOrders(prev => prev.filter(o => o.id !== orderId));
        alert("Venda excluída com sucesso!");
      }
    },
    addCategory: async (category: Category) => {
      const { error } = await supabase.from('categories').insert(category);
      if (error) console.error("Error adding category:", error);
    },
    addProduct: async (product: Product) => {
      const dbProduct = {
        id: product.id,
        barcode: product.barcode,
        name: product.name,
        purchase_price: product.purchasePrice,
        profit_margin: product.profitMargin,
        sale_price1: product.salePrice1,
        sale_price2: product.salePrice2,
        stock: product.stock,
        validity: product.validity,
        image: product.image,
        category_id: product.categoryId,
        is_offer: product.isOffer,
        is_visible: product.isVisible,
        offer_price: product.offerPrice,
        min_offer_qty: product.minOfferQty
      };
      const { error } = await supabase.from('products').insert(dbProduct);
      if (error) console.error("Error adding product:", error);
    },
    updateProduct: async (product: Product) => {
      const dbProduct = {
        barcode: product.barcode,
        name: product.name,
        purchase_price: product.purchasePrice,
        profit_margin: product.profitMargin,
        sale_price1: product.salePrice1,
        sale_price2: product.salePrice2,
        stock: product.stock,
        validity: product.validity,
        image: product.image,
        category_id: product.categoryId,
        is_offer: product.isOffer,
        is_visible: product.isVisible,
        offer_price: product.offerPrice,
        min_offer_qty: product.minOfferQty
      };
      const { error } = await supabase.from('products').update(dbProduct).eq('id', product.id);
      if (error) console.error("Error updating product:", error);
    },
    addClient: async (client: Client) => {
      const dbClient = {
        id: client.id,
        name: client.name,
        whatsapp: client.whatsapp,
        address: client.address,
        cpf: client.cpf,
        limit_value: client.limit,
        debt: client.debt,
        photo: client.photo
      };
      const { error } = await supabase.from('clients').insert(dbClient);
      if (error) console.error("Error adding client:", error);
    },
    addEmployee: async (employee: Employee) => {
      const dbEmployee = {
        id: employee.id,
        name: employee.name,
        whatsapp: employee.whatsapp,
        birth_date: employee.birthDate,
        cpf: employee.cpf,
        role: employee.role,
        photo: employee.photo,
        password: employee.password
      };
      const { error } = await supabase.from('employees').insert(dbEmployee);
      if (error) console.error("Error adding employee:", error);
    },
    updateOrderStatus: async (orderId: string, status: OrderStatus) => {
      // 1. Atualiza o status no banco
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) {
        console.error("Error updating order status:", error);
        return;
      }

      // 2. Se o status for CANCELADO, repõe o estoque e ajusta o débito (se for conta)
      if (status === OrderStatus.CANCELLED) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          // Repõe o Estoque
          for (const item of order.items) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
              await supabase.from('products').update({ stock: product.stock + item.quantity }).eq('id', item.productId);
            }
          }

          // Repõe o Débito do Cliente (se for Fiado/Conta)
          if (order.paymentMethod === PaymentMethod.ACCOUNT && order.clientId) {
            const client = clients.find(c => c.id === order.clientId);
            if (client) {
              await supabase.from('clients').update({ debt: Math.max(0, client.debt - order.total) }).eq('id', order.clientId);
            }
          }
        }
      }
    }
  };
};
