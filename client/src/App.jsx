import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import CakeDetails from "./pages/CakeDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CustomerDashboard from "./pages/CustomerDashboard";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import SellerDashboard from "./pages/SellerDashboard";
import CakesMy from "./pages/CakesMy";
import OrdersSeller from "./pages/OrdersSeller";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import PlaceholderPage from "./components/PlaceholderPage";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { Toaster } from "sonner";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster position="top-right" richColors />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/cakes/:id" element={<CakeDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* General dashboard - redirects based on role */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Role-specific dashboard routes */}
              <Route path="/dashboard/customer" element={<CustomerDashboard />} />
              <Route path="/dashboard/seller" element={<SellerDashboard />} />
              
              {/* Admin routes with layout */}
              <Route path="/dashboard/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<PlaceholderPage title="Users Management" description="Manage user accounts, roles, and permissions." />} />
                <Route path="orders" element={<PlaceholderPage title="Orders Management" description="View and manage all customer orders." />} />
                <Route path="cakes" element={<PlaceholderPage title="Cakes Management" description="Manage cake inventory and listings." />} />
                <Route path="analytics" element={<PlaceholderPage title="Analytics" description="View detailed analytics and insights." />} />
                <Route path="reports" element={<PlaceholderPage title="Reports" description="Generate and view business reports." />} />
                <Route path="role-requests" element={<PlaceholderPage title="Role Requests" description="Review and approve role change requests." />} />
                <Route path="messages" element={<PlaceholderPage title="Messages" description="Manage customer and seller communications." />} />
                <Route path="settings" element={<PlaceholderPage title="Settings" description="Configure system settings and preferences." />} />
              </Route>
              
              {/* Customer-only routes */}
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              
              {/* Seller-only routes */}
              <Route path="/orders/seller" element={<OrdersSeller />} />
              <Route path="/cakes/my" element={<CakesMy />} />
              
              {/* Routes accessible by both customers and sellers */}
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

