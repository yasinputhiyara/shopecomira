import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check active session on initial app load
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.userMe();
        if (res && res.user) {
          setUser(res.user);
        }
      } catch (err) {
        // Not logged in or session expired
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const res = await api.userLogin(credentials);
    if (res && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const sendRegisterOtp = async (userData) => api.sendRegisterOtp(userData);

  const verifyRegisterOtp = async (data) => {
    const res = await api.verifyRegisterOtp(data);
    if (res && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const resendRegisterOtp = async (email) => api.resendRegisterOtp(email);

  const logout = async () => {
    try {
      await api.userLogout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (data) => {
    const res = await api.updateUserProfile(data);
    if (res && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const addAddress = async (addrData) => {
    const res = await api.addUserAddress(addrData);
    if (res && res.addresses) {
      setUser((prev) => (prev ? { ...prev, addresses: res.addresses } : prev));
    }
    return res;
  };

  const updateAddress = async (id, addrData) => {
    const res = await api.updateUserAddress(id, addrData);
    if (res && res.addresses) {
      setUser((prev) => (prev ? { ...prev, addresses: res.addresses } : prev));
    }
    return res;
  };

  const deleteAddress = async (id) => {
    const res = await api.deleteUserAddress(id);
    if (res && res.addresses) {
      setUser((prev) => (prev ? { ...prev, addresses: res.addresses } : prev));
    }
    return res;
  };

  const refreshUser = async () => {
    try {
      const res = await api.userMe();
      if (res && res.user) {
        setUser(res.user);
      }
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        sendRegisterOtp,
        verifyRegisterOtp,
        resendRegisterOtp,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
