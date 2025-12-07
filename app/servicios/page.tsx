"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Service {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_minutos: number;
  imagen_url?: string;
  categoria?: string;
}

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortType, setSortType] = useState("none");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  useEffect(() => {
    let isMounted = true;

    const fetchServices = async () => {
      try {
        setLoading(true);

        const response = await fetch("http://localhost:8000/api/services", {
          headers: {
            "Cache-Control": "max-age=3600",
          },
        });

        if (!response.ok) throw new Error("Error al cargar servicios");
        const data = await response.json();

        if (isMounted) {
          setServices(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Error desconocido");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchServices();
    return () => {
      isMounted = false;
    };
  }, []);

  let filteredServices = services.filter((service) => {
    const matchesSearch = service.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      service.categoria?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesMinPrice =
      minPrice === "" || service.precio >= Number(minPrice);
    const matchesMaxPrice =
      maxPrice === "" || service.precio <= Number(maxPrice);

    return (
      matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice
    );
  });

  if (sortType === "price-asc") {
    filteredServices.sort((a, b) => a.precio - b.precio);
  } else if (sortType === "price-desc") {
    filteredServices.sort((a, b) => b.precio - a.precio);
  }

  const categories: string[] = [
    "all",
    ...Array.from(
      new Set(services.map((s) => s.categoria).filter(Boolean) as string[])
    ),
  ];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Nuestros Servicios
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre todos los servicios que tenemos para realzar tu belleza
            natural
          </p>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar servicios..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={String(cat)} value={String(cat)}>
                  {cat === "all" ? "Todos" : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortType} onValueChange={setSortType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin ordenar</SelectItem>
              <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
              <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Mín $"
            className="w-24"
            value={minPrice}
            onChange={(e) =>
              setMinPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
          />

          <Input
            type="number"
            placeholder="Máx $"
            className="w-24"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando servicios...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {!loading && !error && filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No se encontraron servicios con esos criterios.
            </p>
          </div>
        )}

        {!loading && !error && filteredServices.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                className="group overflow-hidden transition-all hover:shadow-lg"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={
                      service.imagen_url ||
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3C/svg%3E"
                    }
                    alt={service.nombre}
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      if (!img.dataset.fallbackApplied) {
                        img.dataset.fallbackApplied = "true";
                        img.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
                      }
                    }}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold">{service.nombre}</h3>

                  <p className="mt-2 text-muted-foreground">
                    {service.descripcion}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ${service.precio}
                    </span>

                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {service.duracion_minutos} min
                    </span>
                  </div>

                  <Link href={`/citas?servicio=${service.id}`}>
                    <Button className="w-full mt-4 gap-2 text-white ">
                      <Calendar className="h-4 w-4 " />
                      Agendar Cita
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
