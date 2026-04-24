// src/auth/AuthContext.tsx
import { createContext, useContext, useMemo, useState, ReactNode } from "react";

export type User = {
  email?: string;
  nombreCompleto?: string;
  rol?: string; // "ADMIN", "SOCIO", "CLIENTE", etc.
  fotoUrl?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, userData?: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_INTRANET_KEY = "token_intranet";
const USER_INTRANET_KEY = "user_intranet";

const TOKEN_CLIENTE_KEY = "token_cliente";
const USER_CLIENTE_KEY = "user_cliente";

function normalizeRole(rol?: string) {
  return String(rol ?? "").toUpperCase();
}

function isClienteRole(rol?: string) {
  const r = normalizeRole(rol);
  return r === "CLIENTE" || r === "ROLE_CLIENTE";
}

function safeParse<T>(v: string | null): T | null {
  if (!v) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [user, setUser] = useState<User | null>(() => {
    const intranet = safeParse<User>(localStorage.getItem(USER_INTRANET_KEY));
    if (intranet) return intranet;

    const cliente = safeParse<User>(localStorage.getItem(USER_CLIENTE_KEY));
    if (cliente) return cliente;

    // limpieza si hubo JSON malo
    localStorage.removeItem(USER_CLIENTE_KEY);
    localStorage.removeItem(TOKEN_CLIENTE_KEY);
    localStorage.removeItem(USER_INTRANET_KEY);
    localStorage.removeItem(TOKEN_INTRANET_KEY);
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {

    const hasIntranet = !!localStorage.getItem(USER_INTRANET_KEY);
    if (hasIntranet) return localStorage.getItem(TOKEN_INTRANET_KEY);

    const hasCliente = !!localStorage.getItem(USER_CLIENTE_KEY);
    if (hasCliente) return localStorage.getItem(TOKEN_CLIENTE_KEY);

    return null;
  });

  const login = (newToken: string, userData?: User) => {
    setToken(newToken);
    if (userData) setUser(userData);

    // si no mandan userData, lo tratamos como intranet token-only
    if (!userData) {
      localStorage.setItem(TOKEN_INTRANET_KEY, newToken);
      localStorage.removeItem(TOKEN_CLIENTE_KEY);
      localStorage.removeItem(USER_CLIENTE_KEY);
      return;
    }

    const rol = userData.rol;

    if (isClienteRole(rol)) {
      localStorage.setItem(TOKEN_CLIENTE_KEY, newToken);
      localStorage.setItem(USER_CLIENTE_KEY, JSON.stringify(userData));
      // evita mezcla
      localStorage.removeItem(TOKEN_INTRANET_KEY);
      localStorage.removeItem(USER_INTRANET_KEY);
      return;
    }

    // intranet
    localStorage.setItem(TOKEN_INTRANET_KEY, newToken);
    localStorage.setItem(USER_INTRANET_KEY, JSON.stringify(userData));
    localStorage.removeItem(TOKEN_CLIENTE_KEY);
    localStorage.removeItem(USER_CLIENTE_KEY);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_CLIENTE_KEY);
    localStorage.removeItem(USER_CLIENTE_KEY);
    localStorage.removeItem(TOKEN_INTRANET_KEY);
    localStorage.removeItem(USER_INTRANET_KEY);
  };

  const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  return ctx;
};