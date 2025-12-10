"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scissors, Eye, EyeOff } from "lucide-react";

function saveAuthToStorage(payload: any) {
  const token =
    payload?.token ||
    payload?.access_token ||
    payload?.accessToken ||
    payload?.data?.token ||
    payload?.token?.plainTextToken;
  const user = payload?.user || payload?.data?.user || payload?.data || null;

  const authObj = { token, user, raw: payload };
  try {
    localStorage.setItem("beautyroom_auth", JSON.stringify(authObj));
  } catch {
    // ignore
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      let payload: any = null;
      try {
        payload = await res.json();
      } catch {

      }

      if (res.ok) {
        const msg = payload?.message || "Inicio de sesión exitoso";
        setSuccessMessage(msg);
        setErrorMessage(null);

        saveAuthToStorage(payload);

        router.push("/");
        setTimeout(() => window.location.reload(), 200);
      } else {
        const err = payload?.message || `Error: ${res.status} ${res.statusText}`;
        setErrorMessage(err);
        setSuccessMessage(null);
      }
    } catch (err) {
      setErrorMessage("No se pudo conectar al servidor. Verifica que el backend esté en ejecución.");
      setSuccessMessage(null);
      console.error("Login fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Scissors className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">BeautyRoom</CardTitle>
            <CardDescription>Inicia sesión para continuar</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" aria-live="polite">
              {successMessage && (
                <div className="rounded-md bg-green-100 border border-green-200 p-3 text-sm text-green-800">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="rounded-md bg-red-100 border border-red-200 p-3 text-sm text-red-800">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email">Correo electrónico</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="placeholder:text-gray"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="placeholder:text-gray"

                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#9E6034] text-white transition-all duration-150 hover:brightness-95"
                disabled={isLoading}
                aria-disabled={isLoading}
              >
                {isLoading ? "Ingresando..." : "Iniciar Sesión"}
              </Button>

              <div className="text-center mt-3 text-sm">
                <span>¿No tienes cuenta? </span>
                <Link href="/register" className="text-[#9E6034] font-medium underline">
                  Regístrate aquí
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}