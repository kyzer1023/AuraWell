import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { cartApi } from '@/services/api';
import type { CartItem, CartResponse } from '@/services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartResponse>({ items: [], totalAmount: 0, itemCount: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], totalAmount: 0, itemCount: 0 });
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await cartApi.get();
      setCart(data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    await cartApi.addItem(productId, quantity);
    await refreshCart();
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    await cartApi.updateItem(productId, quantity);
    await refreshCart();
  };

  const removeFromCart = async (productId: string) => {
    await cartApi.removeItem(productId);
    await refreshCart();
  };

  const clearCart = async () => {
    await cartApi.clear();
    await refreshCart();
  };

  return (
    <CartContext.Provider
      value={{
        items: cart.items,
        totalAmount: cart.totalAmount,
        itemCount: cart.itemCount,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

