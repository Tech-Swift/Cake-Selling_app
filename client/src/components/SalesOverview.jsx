import React, { useState } from "react";
import { ChartContainer } from "./ui/chart";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer
} from "recharts";

export default function SalesOverview({ totalOrders, totalRevenue, totalCakesSold, chart, chartData, deliveredOrders, deliveredRevenue, deliveredCakesSold, deliveredChartData }) {
  const [dateRange, setDateRange] = useState("Last 14 Days");
  const [exportOpen, setExportOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);

  // Map real chartData to chart format: [{ name: cakeName, sold }]
  const data = (chartData && chartData.length > 0)
    ? chartData.map(item => ({ name: item.cakeName, sold: item.sold }))
    : [];

  return (
    <div className="w-full mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">{totalOrders ?? '--'}<span className="text-base text-gray-400">{deliveredOrders !== undefined ? ` (${deliveredOrders} Delivered)` : ''}</span></div>
          <div className="text-gray-600">Total Orders</div>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">${typeof deliveredRevenue === 'number' ? deliveredRevenue.toLocaleString() : 0}</div>
          <div className="text-gray-600">Revenue (Delivered)</div>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">{typeof deliveredCakesSold === 'number' ? deliveredCakesSold : 0}</div>
          <div className="text-gray-600">Cakes Sold (Delivered)</div>
        </div>
      </div>
      {/* Modern Sales Performance Chart */}
      <div className="bg-[#fafbfc] rounded-2xl p-6 shadow flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between mb-2">
          <h3 className="text-xl font-semibold">Sales Performance</h3>
          <div className="flex flex-row gap-2">
            <div className="relative">
              <button
                className="bg-white border border-gray-200 rounded-lg px-4 py-1.5 text-sm font-medium flex items-center gap-2 shadow-sm hover:bg-gray-50"
                onClick={() => setExportOpen((v) => !v)}
              >
                Export data
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              {exportOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">CSV</button>
                  <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Excel</button>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                className="bg-white border border-gray-200 rounded-lg px-4 py-1.5 text-sm font-medium flex items-center gap-2 shadow-sm hover:bg-gray-50"
                onClick={() => setRangeOpen((v) => !v)}
              >
                {dateRange}
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              {rangeOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => { setDateRange("Last 7 Days"); setRangeOpen(false); }}>Last 7 Days</button>
                  <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => { setDateRange("Last 14 Days"); setRangeOpen(false); }}>Last 14 Days</button>
                  <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => { setDateRange("Last 30 Days"); setRangeOpen(false); }}>Last 30 Days</button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full h-[320px]">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-lg font-semibold">Coming soon</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#888' }} allowDecimals={false} />
                <Tooltip />
                <Legend
                  iconType="circle"
                  formatter={() => (
                    <span style={{ color: '#222', fontWeight: 500 }}>Cakes Sold</span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="sold"
                  name="Cakes Sold"
                  stroke="#222"
                  strokeWidth={2.5}
                  dot={{ r: 4, stroke: "#222", strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
} 