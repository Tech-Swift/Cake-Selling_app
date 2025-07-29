import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      api.get("/users/me")
        .then(res => {
          setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
    setUser(userData);
  };

  const logout = () => {
    // Clear localStorage first
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // Clear sessionStorage as well (in case it was used)
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    
    // Clear state
    setUser(null);
    
    // Force a small delay to ensure state is cleared before any navigation
    setTimeout(() => {
      // State cleared
    }, 100);
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    userRole: user?.role
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
