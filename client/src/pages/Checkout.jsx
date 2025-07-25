import { useEffect, useState } from "react";
import api from "@/utils/api";
import Footer from "../components/Footer";
import { toast, Toaster } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderSeller, setLastOrderSeller] = useState("");
  const [cartMissing, setCartMissing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.get("/cart")
      .then(res => {
        if (res.data === null) {
          setCartMissing(true);
          setItems([]);
        } else {
          setCartMissing(false);
          setItems(res.data.items || []);
        }
      })
      .catch((err) => {
        console.log("Checkout fetch error:", err, err.response);
        setError("Failed to load cart for checkout");
      })
      .finally(() => setLoading(false));
  }, []);

  const total = items.reduce((sum, item) => sum + (item.cake?.price || 0) * (item.quantity || 1), 0);

  const handlePlaceOrder = async () => {
    if (!address.trim() || !paymentMethod) {
      toast.error("Please provide delivery address and payment method.");
      return;
    }
    setPlacingOrder(true);
    try {
      const payload = {
        items: items.map(item => ({ cakeId: item.cake._id, quantity: item.quantity || 1 })),
        address,
        paymentMethod
      };
      await api.post("/orders", payload);
      toast.success("Order placed successfully!");
      setAddress("");
      setPaymentMethod("");
      // Get seller name from the first item (all items are from the same seller)
      if (items.length > 0) {
        setLastOrderSeller(items[0].cake.createdBy?.name || "the seller");
      }
      setOrderSuccess(true);
      // Refresh cart from backend to ensure it's empty
      const res = await api.get("/cart");
      setItems(res.data?.items || []);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to place order");
      console.log("Order error:", err, err.response);
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" richColors />
      <div className="sticky top-0 z-20 bg-white shadow">
        <h1 className="text-2xl font-bold px-8 py-4">Checkout</h1>
      </div>
      <main className="flex-1 p-8">
        {cartMissing ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <h2 className="text-2xl font-semibold mb-2">Hi {user?.name || "there"}, your checkout is empty.</h2>
            <p className="mb-4 text-lg">Add some cakes to your cart to proceed to checkout!</p>
            <button
              onClick={() => navigate('/dashboard/customer')}
              className="bg-blue-600 text-white px-6 py-2 rounded text-lg shadow hover:bg-blue-700 transition"
            >
              Browse Cakes
            </button>
          </div>
        ) : orderSuccess ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-green-700">Your order has been received!</h2>
            <p className="mb-4 text-lg">Your order has been received by <span className="font-bold">{lastOrderSeller}</span>.</p>
            <button
              onClick={() => navigate('/orders')}
              className="bg-blue-600 text-white px-6 py-2 rounded text-lg shadow hover:bg-blue-700 transition"
            >
              Track Your Order
            </button>
          </div>
        ) : loading ? (
          <div>Loading checkout...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <h2 className="text-2xl font-semibold mb-2">Hi {user?.name || "there"}, your checkout is empty.</h2>
            <p className="mb-4 text-lg">Add some cakes to your cart to proceed to checkout!</p>
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
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.cake._id} className="border-t">
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
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right font-bold text-lg mb-6">Total: ${total.toFixed(2)}</div>
            <form className="mb-6" onSubmit={e => { e.preventDefault(); handlePlaceOrder(); }}>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Delivery Address</label>
                <textarea
                  className="w-full border rounded p-2"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                  rows={3}
                  placeholder="Enter your delivery address"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Payment Method</label>
                <select
                  className="w-full border rounded p-2"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="">Select payment method</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded text-lg w-full"
                disabled={placingOrder}
              >
                {placingOrder ? "Placing Order..." : "Place Order"}
              </button>
            </form>
          </div>
        )}
      </main>
      <div className="sticky bottom-0 z-10 bg-white shadow">
        <Footer />
      </div>
    </div>
  );
} 