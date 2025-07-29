import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Cake, 
  Settings, 
  BarChart3, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  Home,
  Shield,
  MessageSquare,
  Package
} from "lucide-react";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      logout();
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
      current: location.pathname === "/dashboard/admin"
    },
    {
      name: "Users Management",
      href: "/admin/users",
      icon: Users,
      current: location.pathname.startsWith("/admin/users")
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      current: location.pathname.startsWith("/admin/orders")
    },
    {
      name: "Cakes",
      href: "/admin/cakes",
      icon: Cake,
      current: location.pathname.startsWith("/admin/cakes")
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      current: location.pathname.startsWith("/admin/analytics")
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: FileText,
      current: location.pathname.startsWith("/admin/reports")
    },
    {
      name: "Role Requests",
      href: "/admin/role-requests",
      icon: Shield,
      current: location.pathname.startsWith("/admin/role-requests")
    },
    {
      name: "Messages",
      href: "/admin/messages",
      icon: MessageSquare,
      current: location.pathname.startsWith("/admin/messages")
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      current: location.pathname.startsWith("/admin/settings")
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`w-64 bg-white shadow-lg flex-shrink-0 ${
        sidebarOpen ? 'fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0' : 
        'fixed inset-y-0 left-0 z-50 -translate-x-full lg:relative lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">👑</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Admin Panel
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.name || "Admin"}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Administrator
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  item.current
                    ? "bg-purple-100 text-purple-700 border-r-2 border-purple-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200">
            <Link
              to="/"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              <Home className="h-5 w-5" />
              <span>Back to Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 w-full text-left"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <span>Welcome back,</span>
                <span className="font-medium text-gray-900">{user?.name}</span>
              </div>
              
              {/* Notifications */}
              <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <div className="relative">
                  <Package className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 