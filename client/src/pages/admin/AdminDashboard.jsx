import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "sonner";
import { Check, X, Clock, Users, ShoppingBag, DollarSign, Star, TrendingUp, Eye, Shield } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCakes: 0,
    pendingOrders: 0,
    activeSellers: 0
  });
  const [roleRequests, setRoleRequests] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRoleRequests();
    fetchRecentOrders();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, ordersRes, cakesRes] = await Promise.all([
        api.get("/users"),
        api.get("/orders"),
        api.get("/cakes")
      ]);

      const users = usersRes.data;
      const orders = ordersRes.data;
      const cakes = cakesRes.data;

      setStats({
        totalUsers: users.length,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        totalCakes: cakes.length,
        pendingOrders: orders.filter(order => order.status === 'pending').length,
        activeSellers: users.filter(user => user.role === 'seller').length
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleRequests = async () => {
    try {
      const response = await api.get("/users/role-requests/pending");
      setRoleRequests(response.data);
    } catch (error) {
      console.error("Error fetching role requests:", error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await api.get("/orders?limit=5&sort=-createdAt");
      setRecentOrders(response.data);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    }
  };

  const handleRoleRequest = async (userId, action, adminNotes = "") => {
    try {
      await api.put(`/users/${userId}/role-request`, {
        action,
        adminNotes
      });

      toast.success(`Role request ${action}ed successfully`);
      fetchRoleRequests(); // Refresh the list
    } catch (error) {
      console.error("Error handling role request:", error);
      toast.error(error.response?.data?.message || "Failed to handle role request");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your CakeHouse.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cakes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCakes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Sellers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeSellers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Requests */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Pending Role Requests</h2>
          </div>
          
          <div className="p-6">
            {requestsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : roleRequests.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending role requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {roleRequests.slice(0, 3).map((user) => (
                  <div key={user._id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {user.name?.[0]?.toUpperCase() || "U"}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                Current: {user.role}
                              </span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Requesting: {user.roleRequest?.requestedRole}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRoleRequest(user._id, 'approve')}
                          className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition"
                        >
                          <Check className="h-4 w-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleRoleRequest(user._id, 'reject')}
                          className="flex items-center space-x-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {roleRequests.length > 3 && (
                  <Link
                    to="/admin/role-requests"
                    className="block text-center text-purple-600 hover:text-purple-700 font-medium"
                  >
                    View all {roleRequests.length} requests
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          </div>
          
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent orders</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Order #{order._id.slice(-6)}</p>
                        <p className="text-sm text-gray-600">${order.totalAmount?.toFixed(2)}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">View</span>
                      </Link>
                    </div>
                  </div>
                ))}
                <Link
                  to="/admin/orders"
                  className="block text-center text-purple-600 hover:text-purple-700 font-medium"
                >
                  View all orders
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/admin/users"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition border border-gray-200"
        >
          <Users className="h-8 w-8 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h3>
          <p className="text-gray-600">View and manage all user accounts</p>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition border border-gray-200"
        >
          <ShoppingBag className="h-8 w-8 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">View Orders</h3>
          <p className="text-gray-600">Monitor all orders and transactions</p>
        </Link>

        <Link
          to="/admin/cakes"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition border border-gray-200"
        >
          <Star className="h-8 w-8 text-purple-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Cakes</h3>
          <p className="text-gray-600">Review and manage cake listings</p>
        </Link>

        <Link
          to="/admin/analytics"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition border border-gray-200"
        >
          <TrendingUp className="h-8 w-8 text-indigo-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
          <p className="text-gray-600">View detailed analytics and reports</p>
        </Link>
      </div>
    </div>
  );
} 