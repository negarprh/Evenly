import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "../api/endpoints";
import { apiErrorMessage } from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("evenly_token"));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    const loadMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authApi.me();
        setUser(data.data.user);
      } catch {
        localStorage.removeItem("evenly_token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadMe();
  }, [token]);

  const login = async (payload) => {
    try {
      const { data } = await authApi.login(payload);
      localStorage.setItem("evenly_token", data.data.token);
      setToken(data.data.token);
      setUser(data.data.user);
      toast.success("Logged in");
      return true;
    } catch (error) {
      toast.error(apiErrorMessage(error));
      return false;
    }
  };

  const signup = async (payload) => {
    try {
      const { data } = await authApi.signup(payload);
      localStorage.setItem("evenly_token", data.data.token);
      setToken(data.data.token);
      setUser(data.data.user);
      toast.success("Account created");
      return true;
    } catch (error) {
      toast.error(apiErrorMessage(error));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("evenly_token");
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (payload) => {
    try {
      const { data } = await authApi.updateMe(payload);
      setUser(data.data.user);
      toast.success("Profile updated");
      return true;
    } catch (error) {
      toast.error(apiErrorMessage(error));
      return false;
    }
  };

  const value = useMemo(
    () => ({ user, token, loading, login, signup, logout, updateProfile, isAuthenticated: Boolean(user && token) }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
