import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "sonner";
import { Check, X, Clock, Users, ShoppingBag, DollarSign, Star } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCakes: 0
  });
  const [roleRequests, setRoleRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRoleRequests();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, ordersRes, cakesRes] = await Promise.all([
        api.get("/users"),
        api.get("/orders"),
        api.get("/cakes")
      ]);

      setStats({
        totalUsers: usersRes.data.length,
        totalOrders: ordersRes.data.length,
        totalRevenue: ordersRes.data.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        totalCakes: cakesRes.data.length
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
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
    return <div className="p-8">Loading admin dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cakes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCakes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Role Requests Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Pending Role Requests</h2>
          </div>
          
          <div className="p-6">
            {requestsLoading ? (
              <p className="text-gray-500">Loading role requests...</p>
            ) : roleRequests.length === 0 ? (
              <p className="text-gray-500">No pending role requests</p>
            ) : (
              <div className="space-y-4">
                {roleRequests.map((user) => (
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
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {new Date(user.roleRequest?.requestDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Requesting: {user.roleRequest?.requestedRole}
                          </span>
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
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/users"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h3>
            <p className="text-gray-600">View and manage all user accounts</p>
          </Link>

          <Link
            to="/orders"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Orders</h3>
            <p className="text-gray-600">Monitor all orders and transactions</p>
          </Link>

          <Link
            to="/cakes"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Cakes</h3>
            <p className="text-gray-600">Review and manage cake listings</p>
          </Link>
        </div>
      </div>
    </div>
  );
} 