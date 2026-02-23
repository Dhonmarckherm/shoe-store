import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

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

  // Load cart from localStorage on mount (for non-authenticated users)
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Fetch cart from server when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      setCart(response.data.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
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
      } else {
        // Handle local cart for non-authenticated users
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

          return { items: newItems, totalItems, totalAmount };
        });
      }
      
      toast.success('Added to cart!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to cart';
      toast.error(message);
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

          return { items: newItems, totalItems, totalAmount };
        });
      }
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart';
      toast.error(message);
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
      } else {
        setCart((prevCart) => {
          const newItems = prevCart.items.filter((item) => item._id !== itemId);
          
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalAmount = newItems.reduce(
            (sum, item) => sum + (item.productId?.price || 0) * item.quantity,
            0
          );

          return { items: newItems, totalItems, totalAmount };
        });
      }
      
      toast.success('Removed from cart');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove from cart';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      
      if (isAuthenticated) {
        await cartAPI.clearCart();
      }
      
      setCart({ items: [], totalItems: 0, totalAmount: 0 });
      localStorage.removeItem('cart');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
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
    clearCart,
    refreshCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
