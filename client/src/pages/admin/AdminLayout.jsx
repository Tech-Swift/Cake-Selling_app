import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu } from 'lucide-react';

const navItems = [
  { to: "/dashboard/admin", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/cakes", label: "Cakes" },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/notifications", label: "Notifications" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r flex-col py-8 px-4 shadow-lg fixed left-0 top-0 min-h-screen z-30">
        <div className="mb-8 text-2xl font-bold text-blue-700 tracking-tight">Admin Panel</div>
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-medium transition-colors ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`
              }
              end
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 text-xs text-gray-400">&copy; {new Date().getFullYear()} Cake Admin</div>
      </aside>
      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-64 bg-white border-r flex flex-col py-8 px-4 shadow-lg min-h-screen">
            <div className="mb-8 text-2xl font-bold text-blue-700 tracking-tight">Admin Panel</div>
            <nav className="flex flex-col gap-2 flex-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium transition-colors ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`
                  }
                  end
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-8 text-xs text-gray-400">&copy; {new Date().getFullYear()} Cake Admin</div>
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
      <main className="flex-1 p-4 md:p-8 overflow-y-auto md:ml-64">
        <Outlet />
      </main>
    </div>
  );
} 