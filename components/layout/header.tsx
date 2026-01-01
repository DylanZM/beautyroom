"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import locales from "@/locales/header.json";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import { Scissors, ChevronDown, LogOut, CircleUserRound, LayoutDashboard } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("beautyroom_auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed?.user ?? parsed);
      }
    } catch (e) {
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "beautyroom_auth") {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            setUser(parsed?.user ?? parsed);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("beautyroom_auth");
    setUser(null);
    router.push("/");
  };

  const userLabel = user?.name || user?.nombre || user?.email || "Mi cuenta";
  const isAdmin = user?.role === "admin";

  return (
    <header className="border-b border-transparent bg-white/5 backdrop-blur-md border-b border-white/5 shadow-sm fixed top-0 w-full h-20 flex items-center justify-center z-50 transition-all duration-300">
  {/* old style<header className="sticky top-0 z-50 w-full border-b border-border bg-background/100 transition-all duration-300" style={{ backdropFilter: "none", WebkitBackdropFilter: "none" }}> */}
      <nav
        aria-label="Main navigation"
        className="text-lg text-muted-foreground transition-all duration-200 hover:text-foreground hover:translate-x-1"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-3 items-center p-5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 transition-transform duration-200 hover:scale-105"
            >
              <Scissors className="h-6 w-6 text-primary" />
              <Label className="text-xl font-semibold tracking-tight">BeautyRoom</Label>
            </Link>
          </div>

          <ul className="flex justify-center gap-6 items-center">
            {locales.nav.map((item) => {
              if (item.label !== "Acerca de") {
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="relative inline-flex items-center px-1 text-sm font-medium select-none text-[#2D2520]/70 hover:text-[#2D2520] transition-colors duration-500 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#A67C52] after:transition-all after:duration-700 hover:after:w-full"
                    >
                      <Label>{item.label}</Label>
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.href} className="relative flex items-center gap-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="Abrir menú Acerca de"
                        className="inline-flex items-center px-1 text-sm font-medium select-none text-[#2D2520]/70 whitespace-nowrap transition-transform duration-200 transform hover:scale-105 focus:outline-none"
                      >
                        <Label className="leading-none">{item.label}</Label>
                        <ChevronDown size={16} className="ml-1" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56">
                      <DropdownMenuItem asChild>
                        <Link href="/acerca-de/nosotros">Nosotros</Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/acerca-de/mision-vision">Misión y visión</Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/acerca-de/testimonios">Testimonios</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-end gap-4">
            {!user ? (
              <Link href="/login">
                <Button className="bg-[#9E6034] text-white px-4 py-2 rounded-md transition-transform duration-200 hover:scale-105 hover:shadow-lg hover:bg-[#A67C52]">
                  Iniciar sesión
                </Button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:scale-105 transition-transform"
                    aria-label="Menú de usuario"
                  >
                    <span className="truncate max-w-[140px]">{userLabel}</span>
                    <ChevronDown size={16} />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-44">
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center gap-2">
                          <LayoutDashboard size={16} />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="flex items-center gap-2">
                      <CircleUserRound size={16} />
                      Mi perfil
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem>
                    <button onClick={handleLogout} className="w-full text-left flex items-center gap-2">
                      <LogOut size={16} />
                      Cerrar sesión
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}