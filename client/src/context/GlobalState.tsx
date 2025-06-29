"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

interface GlobalContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
  isLoggedIn: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const refreshCart = async () => {
    try {
      const res = await axios.get("http://localhost:9000/api/cart/get", {
        withCredentials: true,
      });
      if (res.data.status && Array.isArray(res.data.items)) {
        const total = res.data.items.reduce(
          (sum: number, item: any) => sum + Number(item.quantity),
          0
        );
        setCartCount(total);
      } else {
        setCartCount(0);
      }
    } catch {
      setCartCount(0);
    }
  };

  const refreshAuth = async () => {
    try {
      const res = await fetch("http://localhost:9000/api/auth/check", {
        credentials: "include",
      });
      const data = await res.json();
      setIsLoggedIn(!!data.loggedIn);
    } catch {
      setIsLoggedIn(false);
    }
  };

  const logout = async () => {
    console.log("logout")
    try {
      await fetch("http://localhost:9000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      await refreshAuth();
      setCartCount(0);
    }
  };

  useEffect(() => {
    refreshCart();
    refreshAuth();
  }, []);

  return (
    <GlobalContext.Provider
      value={{ cartCount, refreshCart, isLoggedIn, refreshAuth, logout }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const ctx = useContext(GlobalContext);
  if (!ctx)
    throw new Error("useGlobal must be used within a GlobalProvider");
  return ctx;
};
