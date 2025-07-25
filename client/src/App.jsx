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
import { Toaster } from "sonner";

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        {/* Protected routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/customer" element={<CustomerDashboard />} />
        <Route path="/dashboard/seller" element={<SellerDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/cakes/:id" element={<CakeDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/seller" element={<OrdersSeller />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cakes/my" element={<CakesMy />} />
      </Routes>
    </Router>
  );
}

