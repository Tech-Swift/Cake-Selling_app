import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/utils/api"; // Axios instance

export default function SignupForm({ onSwitch }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", form);
      toast.success("Signup successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/auth?mode=login", { replace: true });
      }, 1200); // 1.2s delay to allow toast to show
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <Input name="name" placeholder="Name" onChange={handleChange} required />
      <Input name="email" type="email" placeholder="Email" onChange={handleChange} required />
      <Input name="password" type="password" placeholder="Password" onChange={handleChange} required />
      <Button className="w-full">Sign Up</Button>
      <p className="text-center text-sm">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="text-blue-600 underline">
          Login
        </button>
      </p>
    </form>
  );
}
