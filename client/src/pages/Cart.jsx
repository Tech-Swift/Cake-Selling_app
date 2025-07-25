import { useEffect, useState } from "react";
import api from "@/utils/api";
import Footer from "../components/Footer";
import { toast, Toaster } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showTrackOrder, setShowTrackOrder] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = () => {
    setLoading(true);
    api.get("/cart")
      .then(res => {
        setItems(res.data?.items || []);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          setError("You must be logged in to view your cart. Please log in.");
        } else {
          setError("Failed to load cart");
        }
        console.log("Cart fetch error:", err, err.response);
      })
      .finally(() => setLoading(false));
  };

  const handleRemoveFromCart = async (cake) => {
    try {
      await api.delete(`/cart/remove/${cake._id}`);
      toast.success(`Removed ${cake.name} from cart!`);
      fetchCart();
    } catch (err) {
      toast.error("Failed to remove from cart");
    }
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      const payload = {
        items: items.map(item => ({ cakeId: item.cake._id, quantity: item.quantity || 1 }))
      };
      console.log("Placing order with payload:", payload);
      await api.post("/orders", payload);
      toast.success("Order placed successfully!");
      setShowTrackOrder(true);
      fetchCart();
    } catch (err) {
      toast.error("Failed to place order");
      console.log("Order error:", err, err.response);
    } finally {
      setPlacingOrder(false);
    }
  };

  const total = items.reduce((sum, item) => sum + (item.cake?.price || 0) * (item.quantity || 1), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" richColors />
      <div className="sticky top-0 z-20 bg-white shadow">
        <h1 className="text-2xl font-bold px-8 py-4">My Cart</h1>
      </div>
      <main className="flex-1 p-8">
        {loading ? (
          <div>Loading cart...</div>
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
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <h2 className="text-2xl font-semibold mb-2">Hi {user?.name || "there"}, you currently have no items in your cart.</h2>
            <p className="mb-4 text-lg">Check out our cakes and add them to your cart to view them here!</p>
            <button
              onClick={() => navigate('/dashboard/customer')}
              className="bg-blue-600 text-white px-6 py-2 rounded text-lg shadow hover:bg-blue-700 transition"
            >
              Browse Cakes
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <table className="w-full mb-6 border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Cake</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-left">Quantity</th>
                  <th className="p-2 text-left">Subtotal</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id} className="border-t">
                    <td className="p-2 flex items-center">
                      {item.cake.image && (
                        <img
                          src={item.cake.image.startsWith('http') ? item.cake.image : `http://localhost:5000/${item.cake.image.replace(/^\//, '')}`}
                          alt={item.cake.name}
                          className="w-12 h-12 object-cover rounded mr-2"
                        />
                      )}
                      <span>{item.cake.name}</span>
                    </td>
                    <td className="p-2">${item.cake.price}</td>
                    <td className="p-2">{item.quantity || 1}</td>
                    <td className="p-2">${(item.cake.price * (item.quantity || 1)).toFixed(2)}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleRemoveFromCart(item.cake)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm mr-2"
                      >
                        Remove
                      </button>
                      <Link
                        to={`/cakes/${item.cake._id}`}
                        className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right font-bold text-lg mb-6">Total: ${total.toFixed(2)}</div>
            <button
              onClick={() => navigate('/checkout')}
              className="bg-green-600 text-white px-6 py-2 rounded text-lg"
            >
              Checkout
            </button>
            {showTrackOrder && (
              <Link
                to="/orders"
                className="ml-4 bg-blue-600 text-white px-6 py-2 rounded text-lg inline-block"
              >
                Track Order
              </Link>
            )}
          </div>
        )}
      </main>
      <div className="sticky bottom-0 z-10 bg-white shadow">
        <Footer />
      </div>
    </div>
  );
} 