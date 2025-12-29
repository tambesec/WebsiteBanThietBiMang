'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartApi } from '@/lib/api-client';
import type { AddToCartDto, UpdateCartItemDto } from '@/lib/api-client';
import { useAuth } from './AuthContext';

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
    slug: string;
    price: number;
    discount_price?: number;
    main_image?: string;
  };
}

interface Cart {
  id: number;
  items: CartItem[];
  summary: {
    subtotal: number;
    total: number;
    items_count: number;
  };
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Load cart only when user is authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadCart();
    } else if (!authLoading && !isAuthenticated) {
      // Clear cart if not authenticated
      setCart(null);
    }
  }, [isAuthenticated, authLoading]);

  const loadCart = async () => {
    try {
      // Backend automatically checks cookies - no need to check localStorage
      const response = await cartApi.cartControllerGetCart();
      // Backend: { data: { id, items, summary, ... } }
      const cart: any = response.data?.data || response.data;
      
      // Ensure cart has proper structure or set to null
      if (cart && typeof cart === 'object' && 'items' in cart) {
        setCart(cart as Cart);
      } else {
        setCart(null);
      }
    } catch (error) {
      // User not logged in or cart not found - this is normal
      setCart(null);
    }
  };

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!isAuthenticated) {
      throw new Error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
    }
    
    setIsLoading(true);
    try {
      const data: AddToCartDto = { product_id: productId, quantity };
      await cartApi.cartControllerAddToCart(data);
      await loadCart(); // Refresh cart after adding
    } catch (error: any) {
      throw new Error(error.message || 'Không thể thêm vào giỏ hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    setIsLoading(true);
    try {
      const data: UpdateCartItemDto = { quantity };
      await cartApi.cartControllerUpdateCartItem(itemId, data);
      await loadCart();
    } catch (error: any) {
      throw new Error(error.message || 'Không thể cập nhật số lượng');
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    setIsLoading(true);
    try {
      await cartApi.cartControllerRemoveCartItem(itemId);
      await loadCart();
    } catch (error: any) {
      throw new Error(error.message || 'Không thể xóa sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      await cartApi.cartControllerClearCart();
      setCart(null);
    } catch (error: any) {
      throw new Error(error.message || 'Không thể xóa giỏ hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCart = async () => {
    await loadCart();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addToCart,
        updateQuantity,
        removeItem,
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
