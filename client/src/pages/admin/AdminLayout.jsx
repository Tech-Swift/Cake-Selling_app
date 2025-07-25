import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

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
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col py-8 px-4 shadow-lg">
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
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
} 