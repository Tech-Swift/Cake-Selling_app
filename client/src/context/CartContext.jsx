import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart items on mount and when user changes
  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const response = await api.get("/cart");
      console.log("Cart API response:", response);
      console.log("Cart response.data:", response.data);
      
      // Handle different response structures
      const items = response.data?.items || response.data || [];
      console.log("Cart items after processing:", items);
      console.log("Is items array?", Array.isArray(items));
      
      setCartItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (cakeId) => {
    try {
      await api.post("/cart/add", { cakeId });
      await fetchCartItems(); // Refresh cart
      return { success: true };
    } catch (error) {
      console.error("Error adding to cart:", error);
      return { success: false, error: error.response?.data?.message || "Failed to add to cart" };
    }
  };

  const removeFromCart = async (cakeId) => {
    try {
      await api.delete(`/cart/remove/${cakeId}`);
      await fetchCartItems(); // Refresh cart
      return { success: true };
    } catch (error) {
      console.error("Error removing from cart:", error);
      return { success: false, error: error.response?.data?.message || "Failed to remove from cart" };
    }
  };

  const updateQuantity = async (cakeId, quantity) => {
    try {
      await api.put(`/cart/update/${cakeId}`, { quantity });
      await fetchCartItems(); // Refresh cart
      return { success: true };
    } catch (error) {
      console.error("Error updating cart:", error);
      return { success: false, error: error.response?.data?.message || "Failed to update cart" };
    }
  };

  const clearCart = async () => {
    try {
      await api.delete("/cart/clear");
      setCartItems([]);
      return { success: true };
    } catch (error) {
      console.error("Error clearing cart:", error);
      return { success: false, error: error.response?.data?.message || "Failed to clear cart" };
    }
  };

  const getCartCount = () => {
    if (!Array.isArray(cartItems)) {
      return 0;
    }
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  const getCartTotal = () => {
    if (!Array.isArray(cartItems)) {
      return 0;
    }
    return cartItems.reduce((total, item) => {
      return total + (item.cake?.price || 0) * (item.quantity || 1);
    }, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      cartCount: getCartCount(),
      cartTotal: getCartTotal(),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      fetchCartItems
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}; 