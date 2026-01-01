import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Phone } from "lucide-react";

export function CtaSection() {
  return (
    <section className="bg-[#9E6034] py-20 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          ¿Lista para transformar tu look?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg opacity-90">
          Agenda tu cita hoy y déjate consentir por nuestros expertos. Primera
          cita con 20% de descuento.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/citas">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <Calendar className="h-5 w-5" />
              Agendar Ahora
            </Button>
          </Link>
          <Button
            size="lg"
            className="gap-2 bg-transparent border border-white text-white transition-all duration-200 hover:bg-white hover:text-[#9E6034] hover:scale-105 hover:shadow-lg"
          >
            <Phone className="h-5 w-5" />
            Llamar: 809 234 567
          </Button>
        </div>
      </div>
    </section>
  );
}
