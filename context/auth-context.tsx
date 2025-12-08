// /context/auth-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthPayload,
  AUTH_KEY,
  extractAuthFromPayload,
  loadAuthFromStorage,
  saveAuthToStorage,
  clearAuthFromStorage,
} from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type AuthContextValue = {
  auth: AuthPayload | null;
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuthFromPayload: (payload: any) => void;
  logout: () => void;
  updateUser: (data: Partial<any>) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchWithToken(url: string, token?: string | null, init?: RequestInit) {
  const headers = new Headers(init?.headers as HeadersInit | undefined);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(url, { ...init, headers });
}

/**
 * Normaliza la respuesta de Laravel para flatten los datos anidados
 * Convierte:
 * { id, name, email, role, client: { telefono, direccion }, stylist: { especialidad, status, telefono } }
 * En:
 * { id, name, email, role, phone/telefono, direccion, especialidad, status }
 */
function normalizeUser(data: any): any {
  if (!data) return null;

  const normalized: any = {
    id: data.id,
    name: data.name || data.nombre || "",
    email: data.email || "",
    role: data.role || "client",
    createdAt: data.created_at || data.createdAt,
  };

  // Si es cliente, extrae datos de la relación client
  if (data.role === "client" && data.client) {
    normalized.phone = data.client.telefono || "";
    normalized.telefono = data.client.telefono || "";
    normalized.direccion = data.client.direccion || "";
    normalized.notas = data.client.notas || "";
  } else if (data.role === "client") {
    normalized.phone = data.phone || data.telefono || "";
    normalized.telefono = data.phone || data.telefono || "";
    normalized.direccion = data.direccion || data.address || "";
    normalized.notas = data.notas || "";
  }

  // Si es estilista, extrae datos de la relación stylist
  if (data.role === "stylist" && data.stylist) {
    normalized.especialidad = data.stylist.especialidad || "";
    normalized.status = data.stylist.status || "disponible";
    normalized.phone = data.stylist.telefono || "";
    normalized.telefono = data.stylist.telefono || "";
  } else if (data.role === "stylist") {
    normalized.especialidad = data.especialidad || "";
    normalized.status = data.status || "disponible";
    normalized.phone = data.phone || data.telefono || "";
    normalized.telefono = data.phone || data.telefono || "";
  }

  return normalized;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthPayload | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = loadAuthFromStorage();
    if (stored) {
      const normalizedUser = normalizeUser(stored.user);
      setAuth(stored);
      setUser(normalizedUser);
    }

    (async () => {
      try {
        if (stored?.token && stored?.user?.id) {
          const res = await fetchWithToken(`${API_BASE}/api/users/${stored.user.id}`, stored.token);
          if (res && res.ok) {
            const payload = await res.json();
            const userData = payload?.user || payload?.data?.user || payload?.data || payload;
            const normalizedUser = normalizeUser(userData);
            const newAuth = { ...stored, user: normalizedUser };
            saveAuthToStorage(newAuth);
            setAuth(newAuth);
            setUser(normalizedUser);
          }
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      } finally {
        setIsLoading(false);
      }
    })();

    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_KEY) {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            const normalizedUser = normalizeUser(parsed.user);
            setAuth(parsed);
            setUser(normalizedUser);
          } catch {
            setAuth(null);
            setUser(null);
          }
        } else {
          setAuth(null);
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setAuthFromPayload = (payload: any) => {
    const extracted = extractAuthFromPayload(payload);
    const normalizedUser = normalizeUser(extracted.user);
    const normalizedAuth = { ...extracted, user: normalizedUser };
    saveAuthToStorage(normalizedAuth);
    setAuth(normalizedAuth);
    setUser(normalizedUser);
  };

  const logout = () => {
    clearAuthFromStorage();
    setAuth(null);
    setUser(null);
    try {
      router.push("/");
    } catch {
      // ignore
    }
  };

  const updateUser = async (data: Partial<any>): Promise<boolean> => {
    if (!auth?.token || !auth?.user?.id) return false;
    try {
      // Mapea los campos del formulario a lo que espera el backend
      const dataToSend: any = {};

      // Campos de User
      if ("name" in data) dataToSend.name = data.name;
      if ("email" in data) dataToSend.email = data.email;

      // Campos de Client según el rol
      if (user?.role === "client") {
        if ("phone" in data || "telefono" in data) {
          dataToSend.telefono = data.phone || data.telefono;
        }
        if ("direccion" in data) {
          dataToSend.direccion = data.direccion;
        }
        if ("notas" in data) {
          dataToSend.notas = data.notas;
        }
      }

      // Campos de Stylist según el rol
      if (user?.role === "stylist") {
        if ("phone" in data || "telefono" in data) {
          dataToSend.telefono_stylist = data.phone || data.telefono;
        }
        if ("especialidad" in data) {
          dataToSend.especialidad = data.especialidad;
        }
        if ("status" in data) {
          dataToSend.status = data.status;  // ← Envía status directamente
        }
      }

      console.log("Sending data to backend:", dataToSend);

      const res = await fetchWithToken(`${API_BASE}/api/users/${auth.user.id}`, auth.token, {
        method: "PATCH",
        body: JSON.stringify(dataToSend),
      });

      if (!res || !res.ok) {
        const errorData = await res?.json().catch(() => ({}));
        console.error("Update error:", errorData);
        return false;
      }

      const payload = await res.json();
      console.log("Backend response:", payload);
      
      const userData = payload?.user || payload?.data?.user || payload?.data || payload;
      const normalizedUser = normalizeUser(userData);
      const newAuth = { ...auth, user: normalizedUser };
      saveAuthToStorage(newAuth);
      setAuth(newAuth);
      setUser(normalizedUser);
      return true;
    } catch (err) {
      console.error("Error updating user:", err);
      return false;
    }
  };

  const value: AuthContextValue = {
    auth,
    user,
    isLoading,
    isAuthenticated: !!auth?.token || !!user,
    setAuthFromPayload,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}