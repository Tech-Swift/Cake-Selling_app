import { useEffect, useState } from "react";
import api from "@/utils/api";
import Footer from "../components/Footer";
import { toast, Toaster } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Wishlist() {
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = () => {
    setLoading(true);
    api.get("/wishlist")
      .then(res => {
        const items = (res.data && Array.isArray(res.data.items)) ? res.data.items : [];
        const cakeList = items.map(item => item.cake);
        setCakes(cakeList);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          setError("You must be logged in to view your wishlist. Please log in.");
        } else {
          setError("Failed to load wishlist");
        }
        console.log("Wishlist fetch error:", err, err.response);
      })
      .finally(() => setLoading(false));
  };

  const handleRemoveFromWishlist = async (cake) => {
    try {
      await api.delete(`/wishlist/remove/${cake._id}`);
      toast.success(`Removed ${cake.name} from wishlist!`);
      fetchWishlist();
    } catch (err) {
      toast.error("Failed to remove from wishlist");
    }
  };

  const handleAddToCart = async (cake) => {
    try {
      // Fetch current cart
      const res = await api.get("/cart");
      const items = res.data?.items || [];
      if (items.length > 0) {
        const existingSeller = items[0].cake.createdBy?._id || items[0].cake.createdBy;
        const newSeller = cake.createdBy?._id || cake.createdBy;
        if (existingSeller !== newSeller) {
          toast.error('You can only add cakes from one seller per order.');
          return;
        }
        // Sellers match, proceed to add
        await api.post("/cart/add", { cakeId: cake._id });
        toast(`Added ${cake.name} to cart!`, { style: { background: '#2563eb', color: 'white' } });
        // Remove from wishlist after adding to cart
        await api.delete(`/wishlist/remove/${cake._id}`);
        fetchWishlist();
      } else {
        // Cart is empty, allow adding and treat this seller as the cart's seller
        await api.post("/cart/add", { cakeId: cake._id });
        toast(`Added ${cake.name} to cart!`, { style: { background: '#2563eb', color: 'white' } });
        // Remove from wishlist after adding to cart
        await api.delete(`/wishlist/remove/${cake._id}`);
        fetchWishlist();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add to cart");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" richColors />
      <div className="sticky top-0 z-20 bg-white shadow">
        <h1 className="text-2xl font-bold px-8 py-4">My Wishlist</h1>
      </div>
      <main className="flex-1 p-8">
        {loading ? (
          <div>Loading wishlist...</div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-96 text-center text-red-600">
            <h2 className="text-2xl font-semibold mb-2">{error}</h2>
            <button
              onClick={() => navigate('/auth?mode=login')}
              className="bg-blue-600 text-white px-6 py-2 rounded text-lg shadow hover:bg-blue-700 transition mt-4"
            >
              Login
            </button>
          </div>
        ) : cakes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <h2 className="text-2xl font-semibold mb-2">Hi {user?.name || "there"}, your wishlist is empty.</h2>
            <p className="mb-4 text-lg">Browse cakes and add your favorites!</p>
            <button
              onClick={() => navigate('/dashboard/customer')}
              className="bg-blue-600 text-white px-6 py-2 rounded text-lg shadow hover:bg-blue-700 transition"
            >
              Browse Cakes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cakes.map(cake => (
              <div key={cake._id} className="border rounded p-4 shadow flex flex-col items-center bg-white">
                {cake.image && (
                  <img
                    src={cake.image.startsWith('http') ? cake.image : `http://localhost:5000/${cake.image.replace(/^\//, '')}`}
                    alt={cake.name}
                    className="w-32 h-32 object-cover mb-2 rounded"
                  />
                )}
                <h3 className="font-semibold text-lg mb-1">{cake.name}</h3>
                <p className="mb-1">{cake.description}</p>
                <p className="font-bold mb-2">${cake.price}</p>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleRemoveFromWishlist(cake)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => handleAddToCart(cake)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Add to Cart
                  </button>
                  <Link
                    to={`/cakes/${cake._id}`}
                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <div className="sticky bottom-0 z-10 bg-white shadow">
        <Footer />
      </div>
    </div>
  );
} 