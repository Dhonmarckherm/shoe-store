import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem('cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Load cart error:', error);
    }
  };

  const saveCart = async (newCart) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Save cart error:', error);
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      setCart(response.data.data);
      await saveCart(response.data.data);
    } catch (error) {
      console.error('Fetch cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity, size, color = null) => {
    try {
      setLoading(true);
      
      if (isAuthenticated) {
        const response = await cartAPI.addToCart({ productId, quantity, size, color });
        setCart(response.data.data);
        await saveCart(response.data.data);
      } else {
        // Handle local cart
        setCart((prevCart) => {
          const existingItemIndex = prevCart.items.findIndex(
            (item) =>
              item.productId === productId &&
              item.size === size &&
              item.color === color
          );

          let newItems;
          if (existingItemIndex > -1) {
            newItems = [...prevCart.items];
            newItems[existingItemIndex].quantity += quantity;
          } else {
            newItems = [
              ...prevCart.items,
              { _id: Date.now().toString(), productId, quantity, size, color },
            ];
          }

          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalAmount = newItems.reduce(
            (sum, item) => sum + (item.productId?.price || 0) * item.quantity,
            0
          );

          const newCart = { items: newItems, totalItems, totalAmount };
          saveCart(newCart);
          return newCart;
        });
      }
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to cart';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      setLoading(true);
      
      if (isAuthenticated) {
        const response = await cartAPI.updateCartItem(itemId, { quantity });
        setCart(response.data.data);
        await saveCart(response.data.data);
      } else {
        setCart((prevCart) => {
          const newItems = prevCart.items.map((item) =>
            item._id === itemId ? { ...item, quantity } : item
          );
          
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalAmount = newItems.reduce(
            (sum, item) => sum + (item.productId?.price || 0) * item.quantity,
            0
          );

          const newCart = { items: newItems, totalItems, totalAmount };
          saveCart(newCart);
          return newCart;
        });
      }
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      
      if (isAuthenticated) {
        const response = await cartAPI.removeFromCart(itemId);
        setCart(response.data.data);
        await saveCart(response.data.data);
      } else {
        setCart((prevCart) => {
          const newItems = prevCart.items.filter((item) => item._id !== itemId);
          
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalAmount = newItems.reduce(
            (sum, item) => sum + (item.productId?.price || 0) * item.quantity,
            0
          );

          const newCart = { items: newItems, totalItems, totalAmount };
          saveCart(newCart);
          return newCart;
        });
      }
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove from cart';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
