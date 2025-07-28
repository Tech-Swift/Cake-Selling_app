import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch wishlist items on mount and when user changes
  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const fetchWishlistItems = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      const response = await api.get("/wishlist");
      console.log("Wishlist API response:", response);
      console.log("Wishlist response.data:", response.data);
      
      // Handle different response structures
      const items = response.data?.items || response.data || [];
      console.log("Wishlist items after processing:", items);
      console.log("Is items array?", Array.isArray(items));
      
      setWishlistItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (cakeId) => {
    try {
      await api.post("/wishlist/add", { cakeId });
      await fetchWishlistItems(); // Refresh wishlist
      return { success: true };
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      return { success: false, error: error.response?.data?.message || "Failed to add to wishlist" };
    }
  };

  const removeFromWishlist = async (cakeId) => {
    try {
      await api.delete(`/wishlist/remove/${cakeId}`);
      await fetchWishlistItems(); // Refresh wishlist
      return { success: true };
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return { success: false, error: error.response?.data?.message || "Failed to remove from wishlist" };
    }
  };

  const clearWishlist = async () => {
    try {
      await api.delete("/wishlist/clear");
      setWishlistItems([]);
      return { success: true };
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      return { success: false, error: error.response?.data?.message || "Failed to clear wishlist" };
    }
  };

  const isInWishlist = (cakeId) => {
    // Ensure wishlistItems is an array before using .some()
    if (!Array.isArray(wishlistItems)) {
      return false;
    }
    return wishlistItems.some(item => {
      const itemCakeId = item.cake?._id || item.cakeId || item._id;
      return itemCakeId === cakeId;
    });
  };

  const getWishlistCount = () => {
    return Array.isArray(wishlistItems) ? wishlistItems.length : 0;
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      loading,
      wishlistCount: getWishlistCount(),
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
      isInWishlist,
      fetchWishlistItems
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}; 