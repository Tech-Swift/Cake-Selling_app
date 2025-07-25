import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";

export default function OrdersSeller() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [nextStatus, setNextStatus] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get("/orders/seller/all")
      .then(res => setOrders(res.data))
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      if (selectedOrder.status === 'pending') setNextStatus('confirmed');
      else if (selectedOrder.status === 'confirmed') setNextStatus('delivered');
      else setNextStatus('');
    }
  }, [selectedOrder]);

  const handleAcceptOrder = async (orderId, status = 'confirmed') => {
    setStatusLoading(true);
    setStatusError(null);
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status });
      setSelectedOrder({ ...selectedOrder, status });
      // Optionally, refresh the orders list here
    } catch (err) {
      setStatusError('Failed to update order status');
    } finally {
      setStatusLoading(false);
    }
  };

  // Split orders into current and delivered
  const currentOrders = orders.filter(order => order.status !== 'delivered');
  const deliveredOrders = orders.filter(order => order.status === 'delivered');

  // Status options and transitions
  const statusOptions = [
    'pending',
    'accepted',
    'on_progress',
    'ready',
    'picked',
    'delivered',
  ];
  const getNextStatuses = (status) => {
    switch (status) {
      case 'pending': return ['accepted'];
      case 'accepted': return ['on_progress'];
      case 'on_progress': return ['ready'];
      case 'ready': return ['picked'];
      case 'picked': return ['delivered'];
      default: return [];
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Current Orders</h2>
      {/* Current Orders Table */}
      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : currentOrders.length === 0 ? (
        <p className="text-gray-600">No current orders found.</p>
      ) : (
        <div className="overflow-x-auto mb-10">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Order ID</th>
                <th className="p-2 text-left">Customer</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(order => (
                  <tr key={order._id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <td className="p-2">{order._id}</td>
                    <td className="p-2">{order.user?.name || order.customerName || "Unknown"}</td>
                    <td className="p-2">
                      {order.status !== 'delivered' ? (
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <select
                            className="border rounded px-2 py-1 text-sm"
                            value={order.status}
                            onChange={e => {
                              const newStatus = e.target.value;
                              setOrders(orders => orders.map(o =>
                                o._id === order._id ? { ...o, _pendingStatus: newStatus } : o
                              ));
                            }}
                          >
                            <option value={order.status}>{order.status.replace('_', ' ')}</option>
                            {getNextStatuses(order.status).map(s => (
                              <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                          </select>
                          {order._pendingStatus && order._pendingStatus !== order.status && (
                            <Button
                              className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                              onClick={async () => {
                                try {
                                  console.log('Updating order', order._id, 'to status', order._pendingStatus);
                                  await api.patch(`/orders/${order._id}/status`, { status: order._pendingStatus });
                                  setOrders(orders => orders.map(o =>
                                    o._id === order._id ? { ...o, status: o._pendingStatus, _pendingStatus: undefined } : o
                                  ));
                                } catch {}
                              }}
                            >
                              Update
                            </Button>
                          )}
                        </div>
                      ) : (
                        order.status.replace('_', ' ')
                      )}
                    </td>
                    <td className="p-2">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="p-2">
                      <Button className="bg-blue-600 text-white px-3 py-1 rounded text-sm" onClick={e => { e.stopPropagation(); setSelectedOrder(order); }}>View Details</Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6">Delivered Orders</h2>
      {/* Delivered Orders Table */}
      {deliveredOrders.length === 0 ? (
        <p className="text-gray-600">No delivered orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Order ID</th>
                <th className="p-2 text-left">Customer</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveredOrders
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(order => (
                  <tr key={order._id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <td className="p-2">{order._id}</td>
                    <td className="p-2">{order.user?.name || order.customerName || "Unknown"}</td>
                    <td className="p-2">{order.status.replace('_', ' ')}</td>
                    <td className="p-2">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="p-2">
                      <Button className="bg-blue-600 text-white px-3 py-1 rounded text-sm" onClick={e => { e.stopPropagation(); setSelectedOrder(order); }}>View Details</Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={() => setSelectedOrder(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Order Details</h3>
            <div className="mb-2"><span className="font-semibold">Order ID:</span> {selectedOrder._id}</div>
            <div className="mb-4 flex items-center gap-4">
              {selectedOrder.user?.image && (
                <img src={selectedOrder.user.image} alt={selectedOrder.user.name} className="w-12 h-12 rounded-full object-cover border" />
              )}
              <div>
                <div><span className="font-semibold">Customer:</span> {selectedOrder.user?.name || "Unknown"}</div>
                <div className="text-xs text-gray-500">{selectedOrder.user?.email}</div>
                {selectedOrder.user?.address && <div className="text-xs text-gray-500">Address: {selectedOrder.user.address}</div>}
              </div>
            </div>
            <div className="mb-2"><span className="font-semibold">Status:</span> {selectedOrder.status}</div>
            {/* Status change UI in modal */}
            {selectedOrder.status !== 'delivered' && (
              <div className="mb-4 flex items-center gap-2">
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={nextStatus}
                  onChange={e => setNextStatus(e.target.value)}
                  disabled={statusLoading}
                >
                  <option value={selectedOrder.status}>{selectedOrder.status.replace('_', ' ')}</option>
                  {getNextStatuses(selectedOrder.status).map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
                <Button
                  className="bg-green-600 text-white px-4 py-2 rounded"
                  onClick={() => handleAcceptOrder(selectedOrder._id, nextStatus)}
                  disabled={statusLoading || !nextStatus}
                >
                  {statusLoading ? 'Updating...' : 'Update Status'}
                </Button>
                {statusError && <div className="text-red-600 mt-2">{statusError}</div>}
              </div>
            )}
            <div className="mb-2"><span className="font-semibold">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
            <div className="mb-2"><span className="font-semibold">Order Address:</span> {selectedOrder.address}</div>
            <div className="mb-2"><span className="font-semibold">Payment:</span> {selectedOrder.paymentMethod}</div>
            <div className="mb-4"><span className="font-semibold">Items:</span>
              <ul className="list-disc pl-6">
                {selectedOrder.items?.map(item => (
                  <li key={item._id} className="mb-1">
                    {item.cake?.name || "Cake"} x {item.quantity} (${item.cake?.price})
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-2"><span className="font-semibold">Total Amount:</span> ${selectedOrder.totalAmount?.toFixed(2) ?? '-'}</div>

            {/* Add more details as needed */}
          </div>
        </div>
      )}
    </div>
  );
} 