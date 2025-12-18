// src/auth/AuthContext.tsx
import { createContext, useContext, useMemo, useState, ReactNode } from "react";

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

// ✅ Separamos llaves por tipo de sesión
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ✅ Al iniciar: si hay sesión de cliente, úsala; sino intranet.
  const [user, setUser] = useState<User | null>(() => {
    const storedCliente = localStorage.getItem(USER_CLIENTE_KEY);
    const storedIntranet = localStorage.getItem(USER_INTRANET_KEY);

    const pick = storedCliente ?? storedIntranet;
    if (!pick) return null;

    try {
      return JSON.parse(pick) as User;
    } catch {
      localStorage.removeItem(USER_CLIENTE_KEY);
      localStorage.removeItem(TOKEN_CLIENTE_KEY);
      localStorage.removeItem(USER_INTRANET_KEY);
      localStorage.removeItem(TOKEN_INTRANET_KEY);
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    // Si hay user cliente, tomamos token cliente; sino intranet.
    const storedCliente = localStorage.getItem(USER_CLIENTE_KEY);
    if (storedCliente) return localStorage.getItem(TOKEN_CLIENTE_KEY);

    const storedIntranet = localStorage.getItem(USER_INTRANET_KEY);
    if (storedIntranet) return localStorage.getItem(TOKEN_INTRANET_KEY);

    return null;
  });

  const login = (newToken: string, userData?: User) => {
  setToken(newToken);
  if (userData) setUser(userData);

  // ✅ Si todavía no llegó userData (muchos logins primero guardan token),
  // persistimos al menos el token como INTRANET para que el dashboard no muera.
  if (!userData) {
    localStorage.setItem(TOKEN_INTRANET_KEY, newToken);

    // evitamos mezclas con cliente
    localStorage.removeItem(TOKEN_CLIENTE_KEY);
    localStorage.removeItem(USER_CLIENTE_KEY);
    return;
  }

  const rol = userData.rol;

  // ✅ Si es cliente -> guardamos en keys de cliente
  if (isClienteRole(rol)) {
    localStorage.setItem(TOKEN_CLIENTE_KEY, newToken);
    localStorage.setItem(USER_CLIENTE_KEY, JSON.stringify(userData));

    // opcional: limpiamos intranet para evitar mezclas
    localStorage.removeItem(TOKEN_INTRANET_KEY);
    localStorage.removeItem(USER_INTRANET_KEY);
    return;
  }

  // ✅ Si es intranet (ADMIN/SUPERVISOR/SOCIO) -> guardamos en intranet
  localStorage.setItem(TOKEN_INTRANET_KEY, newToken);
  localStorage.setItem(USER_INTRANET_KEY, JSON.stringify(userData));

  // opcional: limpiamos cliente para evitar mezclas
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