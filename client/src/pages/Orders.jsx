import { useEffect, useState } from "react";
import api from "@/utils/api";
import Footer from "../components/Footer";
import { toast, Toaster } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import StarRating from "@/components/ui/StarRating";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("current"); // 'current' or 'history'

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    api.get("/orders/my-orders")
      .then(res => setOrders(res.data || []))
      .catch((err) => {
        console.log("Orders fetch error:", err, err.response);
        setError("Failed to load orders");
      })
      .finally(() => setLoading(false));
  };

  const currentOrders = orders.filter(order => order.status !== "delivered");
  const pastOrders = orders.filter(order => order.status === "delivered");

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" richColors />
      <div className="sticky top-0 z-20 bg-white shadow">
        <h1 className="text-2xl font-bold px-8 py-4">My Orders</h1>
      </div>
      <main className="flex-1 p-8">
        {loading ? (
          <div>Loading orders...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : selectedOrder ? (
          <OrderDetails order={selectedOrder} onBack={() => setSelectedOrder(null)} />
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex space-x-4">
              <button
                className={`px-4 py-2 rounded ${tab === "current" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
                onClick={() => setTab("current")}
              >
                Current Orders
              </button>
              <button
                className={`px-4 py-2 rounded ${tab === "history" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
                onClick={() => setTab("history")}
              >
                Order History
              </button>
            </div>
            <table className="w-full border mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Order #</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Total</th>
                  <th className="p-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {(tab === "current" ? currentOrders : pastOrders).map(order => (
                  <tr key={order._id} className="border-t">
                    <td className="p-2">{order._id.slice(-6).toUpperCase()}</td>
                    <td className="p-2">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="p-2 capitalize">{order.status}</td>
                    <td className="p-2">${order.totalAmount?.toFixed(2) || "-"}</td>
                    <td className="p-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(tab === "current" ? currentOrders : pastOrders).length === 0 && (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <h2 className="text-2xl font-semibold mb-2">Hi {user?.name || "there"}, you have no orders yet.</h2>
                <p className="mb-4 text-lg">Browse our cakes and place your first order!</p>
                <button
                  onClick={() => navigate('/dashboard/customer')}
                  className="bg-blue-600 text-white px-6 py-2 rounded text-lg shadow hover:bg-blue-700 transition"
                >
                  Browse Cakes
                </button>
              </div>
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

function OrderDetails({ order, onBack }) {
  const [showReview, setShowReview] = useState(false);
  const [cakeRatings, setCakeRatings] = useState(() =>
    order.items.map(item => ({ cakeId: item.cake?._id, rating: 0, comment: "" }))
  );
  const [sellerRating, setSellerRating] = useState(0);
  const [sellerComment, setSellerComment] = useState("");
  const [orderRating, setOrderRating] = useState(0);
  const [orderComment, setOrderComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Assume seller is the createdBy of the first cake (adjust if you support multi-seller orders)
  const sellerId = order.items[0]?.cake?.createdBy?._id || order.items[0]?.cake?.createdBy;
  const sellerName = order.items[0]?.cake?.createdBy?.name || "Seller";

  const canReview = order.status === "delivered";

  const handleCakeRatingChange = (idx, field, value) => {
    setCakeRatings(ratings => ratings.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const handleSubmitReview = async () => {
    if (!sellerRating || !sellerComment.trim() || !orderRating || !orderComment.trim()) {
      toast.error("Please fill in all required fields (seller and order review)");
      return;
    }
    setSubmitting(true);
    try {
      // Submit order-level review (optional: you may want a separate endpoint for this)
      const orderReviewPayload = {
        orderId: order._id,
        rating: orderRating,
        comment: orderComment,
      };
      console.log('Order review payload:', orderReviewPayload);
      await api.post("/reviews", orderReviewPayload);
      // Submit seller review
      const sellerReviewPayload = {
        sellerId,
        sellerRating,
        sellerComment,
        orderId: order._id,
      };
      console.log('Seller review payload:', sellerReviewPayload);
      await api.post("/reviews", sellerReviewPayload);
      // Submit each cake review (optional)
      for (const { cakeId, rating, comment } of cakeRatings) {
        if (rating > 0 || comment.trim()) {
          const cakeReviewPayload = {
            cakeId,
            rating,
            comment,
            orderId: order._id,
          };
          console.log('Cake review payload:', cakeReviewPayload);
          await api.post("/reviews", cakeReviewPayload);
        }
      }
      toast.success("Thank you for your review!");
      setShowReview(false);
    } catch (err) {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded shadow p-6">
      <button onClick={onBack} className="text-blue-600 underline mb-4">&larr; Back to Orders</button>
      <h2 className="text-xl font-bold mb-2">Order #{order._id.slice(-6).toUpperCase()}</h2>
      <div className="mb-2">Placed: {new Date(order.createdAt).toLocaleString()}</div>
      <div className="mb-2">Status: <span className="capitalize font-semibold">{order.status}</span></div>
      <div className="mb-2">Total: <span className="font-bold">${order.totalAmount?.toFixed(2) || "-"}</span></div>
      <div className="mb-2">Payment Method: {order.paymentMethod || "-"}</div>
      <div className="mb-2">Delivery Address: {order.address || "-"}</div>
      <div className="mb-4">Tracking:
        <ul className="list-disc ml-6 text-gray-700">
          <li>Created: {new Date(order.createdAt).toLocaleString()}</li>
          {order.statusHistory?.map((s, i) => (
            <li key={i}>{s.status}: {new Date(s.timestamp).toLocaleString()}</li>
          ))}
          {order.status === "delivered" && (
            <li>Delivered: {new Date(order.updatedAt).toLocaleString()}</li>
          )}
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Items:</h3>
        <ul className="list-disc ml-6">
          {order.items.map((item, idx) => (
            <li key={idx}>{item.cake?.name || "Cake"} x {item.quantity}</li>
          ))}
        </ul>
      </div>
      {canReview && (
        <button
          className="bg-green-600 text-white px-4 py-2 rounded mt-4"
          onClick={() => setShowReview(true)}
        >
          Rate & Review
        </button>
      )}
      {showReview && (
        <Dialog open={showReview} onOpenChange={setShowReview}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Rate & Review Your Order</DialogTitle>
              <DialogDescription>
                Please rate your overall order experience and the seller. Reviewing individual cakes is optional.
              </DialogDescription>
            </DialogHeader>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Order Experience (required):</h3>
              <label className="block mb-1">Rating:
                <StarRating value={orderRating} onChange={setOrderRating} />
              </label>
              <textarea
                className="w-full border rounded p-2 mt-1"
                placeholder="Write a review for the order (required)..."
                value={orderComment}
                onChange={e => setOrderComment(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Seller: {sellerName} (required)</h3>
              <label className="block mb-1">Rating:
                <StarRating value={sellerRating} onChange={setSellerRating} />
              </label>
              <textarea
                className="w-full border rounded p-2 mt-1"
                placeholder="Write a review for the seller (required)..."
                value={sellerComment}
                onChange={e => setSellerComment(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Cakes (optional):</h3>
              {order.items.map((item, idx) => (
                <div key={item.cake?._id || idx} className="mb-4 p-2 border rounded">
                  <div className="mb-1 font-medium">{item.cake?.name || "Cake"}</div>
                  <label className="block mb-1">Rating:
                    <StarRating value={cakeRatings[idx].rating} onChange={val => handleCakeRatingChange(idx, "rating", val)} />
                  </label>
                  <textarea
                    className="w-full border rounded p-2 mt-1"
                    placeholder="Write a review (optional)..."
                    value={cakeRatings[idx].comment}
                    onChange={e => handleCakeRatingChange(idx, "comment", e.target.value)}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleSubmitReview}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
              <button
                className="ml-4 px-4 py-2 rounded border"
                onClick={() => setShowReview(false)}
                disabled={submitting}
              >
                Cancel
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 