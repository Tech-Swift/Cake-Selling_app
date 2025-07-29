import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import CakeGrid from "../components/CakeGrid";
import api from "../utils/api";
import { toast, Toaster } from "sonner";
import Navbar from "../components/Navbar";
import { Menu } from 'lucide-react';

const CATEGORIES = ["All", "Birthday", "Wedding", "Custom", "Anniversary", "Cupcake", "Other"];

export default function CustomerDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cake data states
  const [featured, setFeatured] = useState([]);
  const [allCakes, setAllCakes] = useState([]);
  const [category, setCategory] = useState("All");
  const [highlyRated, setHighlyRated] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    Promise.all([
      api.get("/cakes/featured").catch(err => {
        console.error("Featured cakes error:", err);
        return { data: [] };
      }),
      api.get("/cakes").catch(err => {
        console.error("All cakes error:", err);
        return { data: [] };
      }),
    ]).then(([featuredRes, allRes]) => {
      console.log("Featured response:", featuredRes);
      console.log("All cakes response:", allRes);
      
      const featuredData = featuredRes.data?.data || featuredRes.data || [];
      const allCakesData = allRes.data || [];
      
      setFeatured(featuredData);
      setAllCakes(allCakesData);
      setHighlyRated([...allCakesData].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)).slice(0, 6));
      setSuggested([...allCakesData].sort(() => 0.5 - Math.random()).slice(0, 6));
    }).catch(err => {
      console.error("Dashboard loading error:", err);
      setError("Failed to load cakes");
      toast.error("Failed to load cakes");
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
      <div className="sticky top-0 z-40 bg-white shadow w-full">
        <div className="flex items-center justify-between px-4 py-2 md:ml-64">
          <Navbar />
          {/* Hamburger for mobile */}
          <button className="md:hidden p-2" onClick={() => setSidebarOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
      </div>
      <div className="flex flex-1 min-h-0 w-full">
        {/* Main Content (Scrollable) */}
        <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-10 overflow-y-auto min-h-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading cakes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-lg mb-4">⚠️ {error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Featured Cakes */}
              <section>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Featured Cakes</h2>
                {featured.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">🍰</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No featured cakes available</h3>
                    <p className="text-gray-500">Check out our other delicious cakes below!</p>
                  </div>
                ) : (
                  <CakeGrid cakes={featured} onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist} />
                )}
              </section>
              
              {/* Category-wise Cakes */}
              <section>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Browse by Category</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                        category === cat ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {cakesByCategory.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">🎂</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No cakes in this category</h3>
                    <p className="text-gray-500">Try selecting a different category or check back later!</p>
                  </div>
                ) : (
                  <CakeGrid cakes={cakesByCategory} onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist} />
                )}
              </section>
              
              {/* Highly Rated Cakes */}
              <section>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Highly Rated Cakes</h2>
                {highlyRated.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">⭐</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No highly rated cakes yet</h3>
                    <p className="text-gray-500">Be the first to rate our cakes!</p>
                  </div>
                ) : (
                  <CakeGrid cakes={highlyRated} onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist} />
                )}
              </section>
              
              {/* Suggested Cakes */}
              <section>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Suggested for You</h2>
                {suggested.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">🎁</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No suggestions available</h3>
                    <p className="text-gray-500">Browse our categories to discover delicious cakes!</p>
                  </div>
                ) : (
                  <CakeGrid cakes={suggested} onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist} />
                )}
              </section>
            </>
          )}
        </main>
        {/* Notifications Panel */}
        <section className="hidden lg:flex w-80 bg-white border-l p-6 shadow-lg h-screen sticky top-0 flex-col">
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
        {/* Mobile Notifications Panel */}
        <section className="flex lg:hidden w-full bg-white border-t p-4 shadow-lg fixed bottom-0 left-0 z-20">
          <div className="flex-1 overflow-x-auto flex gap-4">
            {notifications.slice(0, 3).map(n => (
              <div
                key={n._id}
                className={`p-3 rounded cursor-pointer transition min-w-[180px] ${!n.read ? "bg-blue-50" : "bg-gray-100"}`}
                onClick={() => !n.read && handleMarkAsRead(n._id)}
              >
                <div className="font-semibold text-sm">{n.message}</div>
                <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                {!n.read && <span className="text-xs text-blue-600 ml-2">Mark as read</span>}
              </div>
            ))}
          </div>
        </section>
      </div>
      {/* Footer (regular, not sticky) */}
      <div className="bg-white shadow w-full mt-auto md:ml-64">
        <Footer />
      </div>
    </div>
  );
} 