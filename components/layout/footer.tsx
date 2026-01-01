import Link from "next/link";
import {
  Scissors,
  Instagram,
  Facebook,
  Twitter,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Label } from "../ui/label";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 transition-transform duration-200 hover:scale-105 w-fit"
            >
              <Scissors className="h-6 w-6 text-primary" />
              <Label className="text-xl font-semibold">BeautyRoom</Label>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tu destino de belleza y bienestar. Ofrecemos servicios de
              estilismo, cuidado capilar y tratamientos de belleza de la más
              alta calidad.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>

          <div className="space-y-4 md:pl-6 lg:pl-8">
            <h3 className="font-semibold">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/servicios"
                  className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  Servicios
                </Link>
              </li>
              <li>
                
              </li>
              <li>
                <Link
                  href="/citas"
                  className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  Agendar Cita
                </Link>
              </li>
              <li>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">Terminos y condiciones</li>
              <li className="text-muted-foreground">Política de privacidad</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>Av. Principal 123, Col. Centro, Ciudad de México</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>809 234 567</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>info@beautyroom.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2025 BeautyRoom. Todos los derechos reservados.
            </p>
            <p className="text-sm text-muted-foreground">
              Desarrollado con amor para tu belleza
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
