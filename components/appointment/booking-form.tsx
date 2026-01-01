"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Clock } from "lucide-react"
import Link from "next/link"

interface Service {
  id: number
  nombre: string
  precio: number
  duracion_minutos: number
}

interface Stylist {
  id: number
  user_id: number
  especialidad: string
  status: string
  user: {
    id: number
    name: string
    email: string
  }
  services: Service[]
}

interface BookingFormProps {
  user: any
  services: Service[]
  filteredStylists: Stylist[]
  selectedService: string
  selectedStylist: string
  selectedDate: Date | undefined
  selectedTime: string
  notes: string
  isLoading: boolean
  isBooking: boolean
  loadingServices: boolean
  loadingStylists: boolean
  onServiceChange: (value: string) => void
  onStylistChange: (value: string) => void
  onDateChange: (date: Date | undefined) => void
  onTimeChange: (time: string) => void
  onNotesChange: (notes: string) => void
  onSubmit: () => void
}

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

export function BookingForm({
  user,
  services,
  filteredStylists,
  selectedService,
  selectedStylist,
  selectedDate,
  selectedTime,
  notes,
  isLoading,
  isBooking,
  loadingServices,
  loadingStylists,
  onServiceChange,
  onStylistChange,
  onDateChange,
  onTimeChange,
  onNotesChange,
  onSubmit,
}: BookingFormProps) {
  const selectedServiceData = services.find((s) => s.id === parseInt(selectedService))
  const selectedStylistData = filteredStylists.find((s) => s.id === parseInt(selectedStylist))

  return (
    <div className="space-y-6">
      {!user && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 text-sm">
            Para agendar una cita debes{" "}
            <Link href="/login" className="font-medium underline">
              iniciar sesión
            </Link>
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Servicio</Label>
          <Select value={selectedService} onValueChange={onServiceChange}>
            <SelectTrigger disabled={loadingServices || !user}>
              <SelectValue placeholder={loadingServices ? "Cargando..." : "Selecciona un servicio"} />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id.toString()}>
                  <div className="flex justify-between items-center gap-4">
                    <span>{service.nombre}</span>
                    <span className="text-muted-foreground ml-4">${service.precio}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedService && selectedServiceData && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Duración: {selectedServiceData.duracion_minutos} min
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Estilista</Label>
          <Select value={selectedStylist} onValueChange={onStylistChange} disabled={!selectedService || loadingStylists}>
            <SelectTrigger>
              <SelectValue
                placeholder={
                  loadingStylists
                    ? "Cargando..."
                    : !selectedService
                    ? "Selecciona un servicio primero"
                    : filteredStylists.length === 0
                    ? "No hay estilistas para este servicio"
                    : "Selecciona un estilista"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {filteredStylists.map((stylist) => (
                <SelectItem key={stylist.id} value={stylist.id.toString()}>
                  {stylist.user.name} - {stylist.especialidad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedStylist && selectedStylistData && (
            <p className="text-sm text-muted-foreground">
              Estado: <span className="font-medium capitalize">{selectedStylistData.status}</span>
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Fecha</Label>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            disabled={(date) => date < new Date() || date.getDay() === 0}
            className="rounded-md border"
          />
        </div>
      </div>

      {selectedDate && (
        <div className="space-y-2">
          <Label>Hora</Label>
          <div className="grid grid-cols-5 gap-2">
            {timeSlots.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                size="sm"
                onClick={() => onTimeChange(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notas adicionales (opcional)</Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Ej: Tengo alergia a ciertos productos..."
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
          disabled={isBooking}
        />
      </div>

      {selectedService && selectedStylist && selectedDate && selectedTime && selectedServiceData && selectedStylistData && (
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <h4 className="font-medium">Resumen de tu cita:</h4>
          <p>
            <strong>Servicio:</strong> {selectedServiceData.nombre}
          </p>
          <p>
            <strong>Estilista:</strong> {selectedStylistData.user.name}
          </p>
          <p>
            <strong>Fecha:</strong>{" "}
            {selectedDate.toLocaleDateString("es-MX", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p>
            <strong>Hora:</strong> {selectedTime}
          </p>
          <p className="text-lg font-bold text-primary">
            Total: ${selectedServiceData.precio.toLocaleString("es-MX")}
          </p>
        </div>
      )}

      <Button
        className="w-full text-white"
        size="lg"
        onClick={onSubmit}
        disabled={!user || isBooking || !selectedService || !selectedStylist || !selectedDate || !selectedTime}
      >
        {isBooking ? "Agendando..." : "Confirmar Cita"}
      </Button>
    </div>
  )
}