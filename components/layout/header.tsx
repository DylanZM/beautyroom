"use client";

import Link from "next/link";
import locales from "@/locales/header.json";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import { Scissors, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
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
              <Label className="text-xl font-semibold tracking-tight">
                BeautyRoom
              </Label>
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
                <li
                  key={item.href}
                  className="relative flex items-center gap-0"
                >
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
                        <Link href="/acerca-de/mision-vision">
                          Misión y visión
                        </Link>
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
            <Link href="/login">
            <Button className="bg-[#9E6034] text-white px-4 py-2 rounded-md transition-transform duration-200 hover:scale-105 hover:shadow-lg hover:bg-[#A67C52]">
              Iniciar sesión
            </Button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
