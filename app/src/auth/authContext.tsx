import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Role = "client" | "pt";

export type AuthUser = {
  id: string;
  name: string;
  role: Role;
};

type AuthContextValue = {
  user: AuthUser | null;
  isHydrating: boolean; // mentre ripristina da storage
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "palestra_app_user_v1";

type MockAccount = {
  username: string;
  password: string;
  id: string;      // per client deve essere c1/c2/c3 (come i Client mock)
  name: string;
  role: Role;
};

const MOCK_ACCOUNTS: MockAccount[] = [
  { username: "pt", password: "pt123", id: "pt_1", name: "Cosimo PT", role: "pt" },

  // clienti (id = clientId del PtStore!)
  { username: "c1", password: "c1123", id: "c1", name: "Mario Rossi", role: "client" },
  { username: "c2", password: "c2123", id: "c2", name: "Luigi Bianchi", role: "client" },
  { username: "c3", password: "c3123", id: "c3", name: "Giulia Verdi", role: "client" },
  { username: "simone", password: "simone", id: "simone", name: "Simone Cliente", role: "client" },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  // 1) All'avvio: leggi da storage e ripristina user
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: AuthUser = JSON.parse(raw);
          setUser(parsed);
        }
      } catch (e) {
        // se storage corrotto, riparti pulito
        await AsyncStorage.removeItem(STORAGE_KEY);
        setUser(null);
      } finally {
        setIsHydrating(false);
      }
    })();
  }, []);

  // 2) Login: set user + salva
  const login = async (username: string, password: string) => {
    const account = MOCK_ACCOUNTS.find(
      (a) => a.username === username.trim() && a.password === password
    );

    if (!account) return false;

    const mockUser: AuthUser = {
      id: account.id,
      name: account.name,
      role: account.role,
    };

    setUser(mockUser);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    return true;
  };

  // 3) Logout: reset + cancella
  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(() => ({ user, isHydrating, login, logout }), [user, isHydrating]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}