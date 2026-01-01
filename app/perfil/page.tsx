"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Shield,
  Save,
  ArrowLeft,
  LogOut,
  MapPin,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

export default function PerfilPage() {
  const { user, isLoading, updateUser, logout } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    direccion: "",
    especialidad: "",
    status: "disponible",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isStylist = user?.role === "stylist";
  const isClient = user?.role === "client";

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        direccion: user.direccion || "",
        especialidad: user.especialidad || "",
        status: user.status || "disponible",
      });
    }
  }, [user, isLoading, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      const cleaned = { ...prev };
      delete cleaned[name];
      return cleaned;
    });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.name.trim()) next.name = "El nombre es requerido.";
    if (!formData.email.trim()) next.email = "El correo es requerido.";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      next.email = "Correo inválido.";

    if (isStylist && !formData.especialidad.trim()) {
      next.especialidad = "La especialidad es requerida.";
    }

    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const validation = validate();

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setIsSaving(true);
    try {
      const dataToSend: Record<string, any> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        direccion: formData.direccion,
      };

      if (isStylist) {
        dataToSend.especialidad = formData.especialidad;
        dataToSend.status = formData.status;
      }

      const ok = await updateUser(dataToSend);

      if (ok) {
        toast.success("Perfil actualizado correctamente");
      } else {
        toast.error("No se pudo actualizar el perfil");
      }
    } catch {
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "stylist":
        return "Estilista";
      case "client":
        return "Cliente";
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "stylist":
        return "bg-purple-100 text-purple-800";
      case "client":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponible":
        return "bg-green-100 text-green-800";
      case "ocupado":
        return "bg-yellow-100 text-yellow-800";
      case "descanso":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-secondary/30 py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Link>

          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            aria-label="Cerrar sesión"
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>

        <div className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <User className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>

              <div className="flex justify-center gap-2 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(
                    user.role
                  )}`}
                >
                  {getRoleName(user.role)}
                </span>

                {isStylist && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      user.status
                    )}`}
                  >
                    {user.status}
                  </span>
                )}
              </div>
            </CardHeader>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="text-lg">Información Personal</CardTitle>
              <CardDescription>
                Actualiza tu información personal.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Nombre Completo
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    required
                    disabled={isSaving}
                  />

                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    required
                    disabled={isSaving}
                  />

                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+52 555 123 4567"
                    disabled={isSaving}
                  />
                </div>

                {/* Dirección */}
                <div className="space-y-2">
                  <Label htmlFor="direccion" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Dirección
                  </Label>
                  <Input
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Tu dirección"
                    disabled={isSaving}
                  />
                </div>

                {/* Solo Stylist */}
                {isStylist && (
                  <>
                    <div className="space-y-2">
                      <Label
                        htmlFor="especialidad"
                        className="flex items-center gap-2"
                      >
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        Especialidad
                      </Label>
                      <Input
                        id="especialidad"
                        name="especialidad"
                        value={formData.especialidad}
                        onChange={handleChange}
                        placeholder="Ej: Cortes, Coloración, Styling"
                        required
                        disabled={isSaving}
                      />

                      {errors.especialidad && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.especialidad}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="status"
                        className="flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        Estado
                      </Label>

                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        disabled={isSaving}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="disponible">disponible</option>
                        <option value="ocupado">ocupado</option>
                        <option value="descanso">descanso</option>
                        <option value="inactivo">inactivo</option>
                      </select>
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full text-white" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
