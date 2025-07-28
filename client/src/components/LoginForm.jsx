import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext"; 

export default function LoginForm({ onSwitch }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      console.log("Login response:", res.data);
      console.log("User role:", res.data.role);
      
      login(res.data); // Store user in context and localStorage
      toast.success("Login successful! Redirecting...");
      
      setTimeout(() => {
        const role = res.data.role;
        console.log("Redirecting based on role:", role);
        
        if (role === "customer") {
          console.log("Redirecting to customer dashboard");
          navigate("/dashboard/customer", { replace: true });
        } else if (role === "seller") {
          console.log("Redirecting to seller dashboard");
          navigate("/dashboard/seller", { replace: true });
        } else if (role === "admin") {
          console.log("Redirecting to admin dashboard");
          navigate("/dashboard/admin", { replace: true });
        } else {
          console.log("Unknown role, redirecting to default dashboard");
          navigate("/dashboard", { replace: true });
        }
      }, 1200); // 1.2s delay to allow toast to show
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <Input name="email" type="email" placeholder="Email" onChange={handleChange} required />
      <Input name="password" type="password" placeholder="Password" onChange={handleChange} required />
      <Button className="w-full">Login</Button>
      <p className="text-center text-sm">
        Don’t have an account?{" "}
        <button type="button" onClick={onSwitch} className="text-blue-600 underline">
          Sign Up
        </button>
      </p>
    </form>
  );
}
