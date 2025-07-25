import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import CakeGrid from "../components/CakeGrid";
import api from "@/utils/api";
import { toast, Toaster } from "sonner";
import Navbar from "../components/Navbar";

const CATEGORIES = ["All", "Birthday", "Wedding", "Custom", "Anniversary", "Cupcake", "Other"];

export default function CustomerDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // Cake data states
  const [featured, setFeatured] = useState([]);
  const [allCakes, setAllCakes] = useState([]);
  const [category, setCategory] = useState("All");
  const [highlyRated, setHighlyRated] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/cakes/featured"),
      api.get("/cakes"),
    ]).then(([featuredRes, allRes]) => {
      setFeatured(featuredRes.data.data || featuredRes.data);
      setAllCakes(allRes.data);
      setHighlyRated([...allRes.data].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)).slice(0, 6));
      setSuggested([...allRes.data].sort(() => 0.5 - Math.random()).slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  // Fetch notifications for the customer
  useEffect(() => {
    setNotifLoading(true);
    api.get("/notifications")
      .then(res => setNotifications(res.data))
      .catch(() => setNotifications([]))
      .finally(() => setNotifLoading(false));
  }, []);

  const cakesByCategory = category === "All"
    ? allCakes
    : allCakes.filter(cake => cake.category === category);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAddToCart = (cake) => toast.success(`Added ${cake.name} to cart!`);
  const handleAddToWishlist = async (cake) => {
    try {
      await api.post("/wishlist/add", { cakeId: cake._id });
      toast.success(`Added ${cake.name} to wishlist!`);
    } catch (err) {
      toast.error("Failed to add to wishlist");
    }
  };

  // Mark individual notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications =>
        notifications.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(notifications => notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" richColors />
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-40 bg-white shadow ml-64">
        <Navbar />
      </div>
      <div className="flex flex-1 min-h-0 ml-64">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-100 p-6 border-r min-h-screen fixed left-0 top-0 z-30 flex flex-col justify-between">
          <nav className={`flex flex-col space-y-4 transition-opacity duration-300 ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <Link to="/dashboard/customer" className="text-blue-700">Dashboard Home</Link>
            <Link to="/orders" className="text-blue-600">My Orders</Link>
            <Link to="/wishlist" className="text-blue-600">Wishlist</Link>
            <Link to="/cart" className="text-blue-600">Cart</Link>
            <Link to="/profile" className="text-blue-600">Profile</Link>
            <Link to="/dashboard/customer" className="text-blue-600">Home</Link>
          </nav>
          <button onClick={handleLogout} className="text-red-600 text-left mt-8">Logout</button>
        </aside>
        {/* Main Content (Scrollable) */}
        <main className="flex-1 p-8 space-y-10 overflow-y-auto min-h-0 flex flex-col">
          {loading ? (
            <div>Loading cakes...</div>
          ) : (
            <>
              {/* Featured Cakes */}
              <section>
                <h2 className="text-xl font-semibold mb-2">Featured Cakes</h2>
                <CakeGrid cakes={featured} onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist} />
              </section>
              {/* Category-wise Cakes */}
              <section>
                <h2 className="text-xl font-semibold mb-2 mt-8">Browse by Category</h2>
                <div className="flex space-x-2 mb-4">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1 rounded ${category === cat ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <CakeGrid cakes={cakesByCategory} onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist} />
              </section>
              {/* Highly Rated Cakes */}
              <section>
                <h2 className="text-xl font-semibold mb-2 mt-8">Highly Rated Cakes</h2>
                <CakeGrid cakes={highlyRated} onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist} />
              </section>
              {/* Suggested Cakes */}
              <section>
                <h2 className="text-xl font-semibold mb-2 mt-8">Suggested for You</h2>
                <CakeGrid cakes={suggested} onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist} />
              </section>
            </>
          )}
        </main>
        {/* Notifications Panel */}
        <section className="w-80 bg-white border-l p-6 shadow-lg h-screen sticky top-0 flex flex-col">
          <h2 className="text-lg font-bold mb-4">Notifications</h2>
          <button
            className="mb-4 px-3 py-1 bg-blue-600 text-white rounded text-sm"
            onClick={handleMarkAllAsRead}
            disabled={notifLoading || notifications.every(n => n.read)}
          >
            Mark All as Read
          </button>
          <div className="flex-1 overflow-y-auto">
            {notifLoading ? (
              <p>Loading...</p>
            ) : notifications.length === 0 ? (
              <p>No notifications yet.</p>
            ) : (
              <ul>
                {notifications.map(n => (
                  <li
                    key={n._id}
                    className={`mb-3 p-3 rounded cursor-pointer transition ${!n.read ? "bg-blue-50" : "bg-gray-100"}`}
                    onClick={() => !n.read && handleMarkAsRead(n._id)}
                  >
                    <div className="font-semibold">{n.message}</div>
                    <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                    {!n.read && <span className="text-xs text-blue-600 ml-2">Mark as read</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
      {/* Footer (regular, not sticky) */}
      <div className="bg-white shadow ml-64 mt-auto">
        <Footer />
      </div>
    </div>
  );
} 