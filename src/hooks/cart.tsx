import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE

      const productsStoraged = await AsyncStorage.getItem('@gomarket-cart');
      const productsParsed: Product[] = productsStoraged
        ? JSON.parse(productsStoraged)
        : [];

      setProducts(productsParsed);
    }

    loadProducts();
  }, []);

  const increment = useCallback(async id => {
    // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
    setProducts(state => {
      const listProductsUpdated = state.map(element =>
        element.id === id
          ? { ...element, quantity: element.quantity + 1 }
          : element,
      );

      AsyncStorage.setItem(
        '@gomarket-cart',
        JSON.stringify(listProductsUpdated),
      );
      return listProductsUpdated;
    });
  }, []);

  const decrement = useCallback(async id => {
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
    setProducts(state => {
      const listProductsUpdated = state.map(element =>
        element.id === id && element.quantity > 0
          ? { ...element, quantity: element.quantity - 1 }
          : element,
      );

      AsyncStorage.setItem(
        '@gomarket-cart',
        JSON.stringify(listProductsUpdated),
      );
      return listProductsUpdated;
    });
  }, []);

  const addToCart = useCallback(
    async (product: Omit<Product, 'quantity'>) => {
      // TODO ADD A NEW ITEM TO THE CART
      const productExist = products.findIndex(
        element => element.id === product.id,
      );

      if (productExist >= 0) {
        increment(product.id);
        return;
      }

      const listProductUpdated = [...products, { ...product, quantity: 1 }];
      AsyncStorage.setItem(
        '@gomarket-cart',
        JSON.stringify(listProductUpdated),
      );

      setProducts(listProductUpdated);
    },
    [increment, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
