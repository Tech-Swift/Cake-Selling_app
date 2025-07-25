import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SalesOverview from "@/components/SalesOverview";
import api from "../utils/api";
import { Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Menu } from 'lucide-react';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalCakesSold: 0, chartData: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seller, setSeller] = useState(null);
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get("/orders/seller/sales-stats")
      .then(res => setStats(res.data))
      .catch(() => setError("Failed to load sales stats"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get('/users/me').then(res => setSeller(res.data));
  }, []);

  // Fetch notifications
  useEffect(() => {
    setNotifLoading(true);
    api.get('/notifications')
      .then(res => setNotifications(res.data))
      .catch(() => setNotifications([]))
      .finally(() => setNotifLoading(false));
  }, []);

  useEffect(() => {
    setReviewsLoading(true);
    api.get('/reviews/seller-orders')
      .then(res => setReviews(res.data))
      .catch(() => setReviewsError('Failed to load reviews'))
      .finally(() => setReviewsLoading(false));
  }, []);

  // Filter to only one review per order (the first one found)
  const uniqueOrderReviews = [];
  const seenOrders = new Set();
  for (const review of reviews) {
    const orderId = review.order?._id;
    if (orderId && !seenOrders.has(orderId)) {
      uniqueOrderReviews.push(review);
      seenOrders.add(orderId);
    }
  }

  // Mark individual notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications =>
        notifications.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      // Optionally handle error
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(notifications => notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleLogout = () => {
    // Implement logout logic here if needed
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-row w-full">
      {/* Sidebar */}
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-gray-100 p-6 border-r min-h-screen fixed left-0 top-0 z-30 flex-col justify-between">
        <nav className="flex flex-col space-y-4">
          <Link to="/dashboard/seller" className="text-blue-700">Dashboard Home</Link>
          <Link to="/cakes/my" className="text-blue-600">My Cakes</Link>
          <Link to="/orders/seller" className="text-blue-600">Orders</Link>
          <Link to="/profile" className="text-blue-600">Profile</Link>
        </nav>
        <button onClick={handleLogout} className="text-red-600 text-left mt-8">Logout</button>
      </aside>
      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-64 bg-gray-100 p-6 border-r min-h-screen flex flex-col justify-between">
            <nav className="flex flex-col space-y-4">
              <Link to="/dashboard/seller" className="text-blue-700" onClick={() => setSidebarOpen(false)}>Dashboard Home</Link>
              <Link to="/cakes/my" className="text-blue-600" onClick={() => setSidebarOpen(false)}>My Cakes</Link>
              <Link to="/orders/seller" className="text-blue-600" onClick={() => setSidebarOpen(false)}>Orders</Link>
              <Link to="/profile" className="text-blue-600" onClick={() => setSidebarOpen(false)}>Profile</Link>
            </nav>
            <button onClick={handleLogout} className="text-red-600 text-left mt-8">Logout</button>
          </div>
          {/* Overlay */}
          <div className="flex-1 bg-black bg-opacity-30" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}
      {/* Hamburger for mobile */}
      <button className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow" onClick={() => setSidebarOpen(true)}>
        <Menu size={28} />
      </button>
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 flex flex-col items-start md:ml-64">
        {/* Hero and Stats Card Side by Side */}
        <div className="flex flex-col lg:flex-row gap-8 w-full mb-10">
          {/* Hero Section */}
          <div className="flex flex-col py-6 md:py-10 bg-blue-50 rounded-xl w-full lg:w-2/3 pl-4 md:pl-8 shadow mb-4 lg:mb-0">
            <div className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center text-4xl font-bold mb-3">
              {seller?.name?.[0] || "S"}
            </div>
            <h1 className="text-4xl font-bold mb-2 text-blue-900 text-left">Welcome back, {seller?.name || "Seller"}! 🎉</h1>
            <p className="text-lg text-gray-700 mb-1 text-left">{seller?.email}</p>
            <p className="text-gray-500 text-base mb-2 text-left">Joined: {seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString() : ""}</p>
            <p className="italic text-blue-600 text-lg text-left">"A little progress each day adds up to big results!"</p>
          </div>
          {/* Stats Card */}
          <div className="flex flex-col justify-center py-6 md:py-10 bg-green-50 rounded-xl w-full lg:w-1/3 pl-4 md:pl-8 shadow min-w-[180px]">
            <div className="mb-6">
              <div className="text-2xl font-bold text-green-800">${stats.deliveredRevenue?.toLocaleString() ?? 0}</div>
              <div className="text-gray-600">Revenue (Delivered)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-800">{stats.deliveredCakesSold ?? 0}</div>
              <div className="text-gray-600">Cakes Sold (Delivered)</div>
            </div>
          </div>
        </div>
        {loading ? (
          <p>Loading sales overview...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : null}
        <div className="flex flex-col lg:flex-row gap-8 w-full">
          <div className="w-full lg:w-1/2 min-w-[220px] py-4 h-[100%] mt-0">
            <SalesOverview
              totalOrders={stats.totalOrders}
              totalRevenue={stats.totalRevenue}
              totalCakesSold={stats.totalCakesSold}
              chartData={stats.chartData}
              deliveredOrders={stats.deliveredOrders}
              deliveredRevenue={stats.deliveredRevenue}
              deliveredCakesSold={stats.deliveredCakesSold}
              deliveredChartData={stats.deliveredChartData}
            />
          </div>
          <section className="w-full lg:w-1/2 min-w-[180px] py-4 h-[400px] mt-0">
            <h2 className="text-2xl font-bold mb-4">Order Reviews</h2>
            {reviewsLoading ? (
              <p>Loading reviews...</p>
            ) : reviewsError ? (
              <p className="text-red-600">{reviewsError}</p>
            ) : uniqueOrderReviews.length === 0 ? (
              <p>No order reviews yet for your cakes.</p>
            ) : (
              <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2 bg-white rounded shadow border w-full">
                {uniqueOrderReviews.map((review, idx) => (
                  <div
                    key={review._id || idx}
                    className="border rounded p-2 shadow bg-white cursor-pointer hover:bg-blue-50 transition text-sm"
                    onClick={() => setSelectedReview(review)}
                  >
                    <div className="flex items-center mb-1">
                      <span className="font-semibold mr-2">{review.user?.name || 'Customer'}</span>
                      <span className="text-yellow-500 flex items-center">{[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="#facc15" stroke="#facc15" />)}</span>
                    </div>
                    <div className="mb-1 text-gray-700 text-xs">{review.comment}</div>
                    <div className="text-xs text-gray-500">Order #{review.order?._id?.slice(-6).toUpperCase() || ''} | {new Date(review.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
            {/* Review Details Modal */}
            {selectedReview && (
              <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                    <DialogDescription>
                      Review by <span className="font-semibold">{selectedReview.user?.name || 'Customer'}</span> on {new Date(selectedReview.createdAt).toLocaleDateString()}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mb-2">
                    <div className="mb-1 font-semibold">Review:</div>
                    <div className="mb-2 text-gray-700">{selectedReview.comment}</div>
                    <div className="mb-1 font-semibold">Rating:</div>
                    <div className="text-yellow-500 flex items-center mb-2">{[...Array(selectedReview.rating)].map((_, i) => <Star key={i} size={16} fill="#facc15" stroke="#facc15" />)}</div>
                  </div>
                  <div className="mb-2">
                    <div className="mb-1 font-semibold">Order Items:</div>
                    <ul className="list-disc ml-6">
                      {selectedReview.order?.items?.map((item, idx) => (
                        <li key={idx}>
                          {item.cake?.name || 'Cake'} x {item.quantity} <span className="text-gray-500">(${item.cake?.price?.toFixed(2) || '-'})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mb-2">
                    <div className="font-semibold">Order Total:</div>
                    <div>${selectedReview.order?.totalAmount?.toFixed(2) || '-'}</div>
                  </div>
                  <div className="mb-2">
                    <div className="font-semibold">Delivery Address:</div>
                    <div>{selectedReview.order?.address || '-'}</div>
                  </div>
                  <DialogFooter>
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                      onClick={() => setSelectedReview(null)}
                    >
                      Close
                    </button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </section>
        </div>
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
  );
} 