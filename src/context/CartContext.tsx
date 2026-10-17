import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, OrderItem } from '../types/index.ts';
import { useAuth } from './AuthContext.tsx';

interface CartContextType {
  cartItems: OrderItem[];
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  addToCart: (product: Product, quantity?: number, selectedDesign?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  favorites: string[];
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<OrderItem[]>(() => {
    try {
      const stored = localStorage.getItem('campusshop_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('campusshop_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Load favorites when user changes
  useEffect(() => {
    if (!user) return;
    fetch('/api/favorites', {
      headers: { 'x-user-id': user.id },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.productIds) {
          setFavorites(data.productIds);
        }
      })
      .catch((err) => console.error('Failed to load favorites:', err));
  }, [user]);

  const addToCart = (product: Product, quantity = 1, selectedDesign?: string) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.id && item.selectedDesign === selectedDesign
      );
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id && item.selectedDesign === selectedDesign
            ? { ...item, quantity: product.isDigital ? 1 : Math.min(item.quantity + quantity, product.stockQuantity || 99) }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productTitle: product.title,
          unitPrice: product.price,
          quantity: product.isDigital ? 1 : Math.min(quantity, product.stockQuantity || 99),
          imageUrl: product.images[0] || '',
          storeId: product.storeId,
          isDigital: Boolean(product.isDigital),
          selectedDesign,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.success) {
        setFavorites(data.productIds);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        isCartOpen,
        isCheckoutOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        openCheckout: () => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        },
        closeCheckout: () => setIsCheckoutOpen(false),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        favorites,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
