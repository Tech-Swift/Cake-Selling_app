import React from "react";

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-blue-700">--</div>
          <div className="text-gray-600 mt-2">Users</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-green-700">--</div>
          <div className="text-gray-600 mt-2">Orders</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-yellow-600">--</div>
          <div className="text-gray-600 mt-2">Cakes</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-pink-600">--</div>
          <div className="text-gray-600 mt-2">Reviews</div>
        </div>
      </div>
      {/* Top Sellers & Cakes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Top 5 Sellers</h2>
          <ul className="list-decimal ml-6 text-gray-700">
            <li>Coming soon</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Top 5 Cakes</h2>
          <ul className="list-decimal ml-6 text-gray-700">
            <li>Coming soon</li>
          </ul>
        </div>
      </div>
      {/* Analytics Preview */}
      <div className="bg-white rounded-xl shadow p-6 mt-4">
        <h2 className="text-lg font-semibold mb-4">Analytics Overview</h2>
        <div className="text-gray-400 text-center py-8">Charts coming soon</div>
      </div>
    </div>
  );
} 