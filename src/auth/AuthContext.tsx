// src/auth/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

type User = {
  email?: string;
  nombreCompleto?: string;
  rol?: string; // "ADMIN", "SOCIO", "CLIENTE", etc.
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, userData?: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 👇 leemos localStorage, pero si el rol es CLIENTE, lo ignoramos
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    if (!storedUser) return null;

    try {
      const parsed: User = JSON.parse(storedUser);
      const rol = parsed.rol?.toUpperCase();

      // ❌ si era cliente, arrancamos como NO logueado
      if (rol === "CLIENTE" || rol === "ROLE_CLIENTE") {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        return null;
      }

      return parsed;
    } catch {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    if (!storedUser) return null;

    try {
      const parsed: User = JSON.parse(storedUser);
      const rol = parsed.rol?.toUpperCase();

      if (rol === "CLIENTE" || rol === "ROLE_CLIENTE") {
        // igual que arriba: no persistimos cliente
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        return null;
      }

      return localStorage.getItem(TOKEN_KEY);
    } catch {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  });

  const login = (newToken: string, userData?: User) => {
    setToken(newToken);
    if (userData) setUser(userData);

    const rol = userData?.rol?.toUpperCase();

    // 👉 Solo persistimos si NO es cliente
    const shouldPersist =
      rol !== "CLIENTE" && rol !== "ROLE_CLIENTE" && !!userData;

    if (shouldPersist && userData) {
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } else {
      // si es cliente, nos aseguramos de no dejar nada guardado
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  }
  return ctx;
};
