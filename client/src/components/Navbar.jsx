import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-100 shadow">
      <div className="font-bold text-lg">
        <Link to="/">Cake Shop</Link>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link to="/profile" className="text-blue-600">{user.name || "Profile"}</Link>
            <button onClick={handleLogout} className="text-red-600">Logout</button>
          </>
        ) : (
          <>
            <a href="/auth?mode=login" className="mr-4 text-blue-600">Login</a>
            <a href="/auth?mode=signup" className="text-blue-600">Sign Up</a>
          </>
        )}
      </div>
    </nav>
  );
} 