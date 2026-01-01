"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, XCircle, CalendarIcon } from "lucide-react"

interface Service {
  id: number
  nombre: string
  precio: number
  duracion_minutos: number
}

interface User {
  id: number
  name: string
  email: string
}

interface Appointment {
  id: number
  client_id: number
  stylist_id: number
  service_id: number
  fecha: string
  hora: string
  status: "pendiente" | "confirmada" | "cancelada" | "completada"
  notas?: string
  client?: {
    id: number
    user: User
  }
  stylist?: {
    id: number
    user: User
  }
  service?: Service
}

interface AppointmentsListProps {
  appointments: Appointment[]
  loading: boolean
  userRole: string
  updatingAppointment: number | null
  onStatusUpdate: (appointmentId: number, newStatus: string) => void
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "confirmada":
      return (
        <Badge className="bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          Confirmada
        </Badge>
      )
    case "pendiente":
      return (
        <Badge className="bg-amber-100 text-amber-700">
          <AlertCircle className="h-3 w-3 mr-1" />
          Pendiente
        </Badge>
      )
    case "cancelada":
      return (
        <Badge className="bg-red-100 text-red-700">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelada
        </Badge>
      )
    case "completada":
      return (
        <Badge className="bg-blue-100 text-blue-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completada
        </Badge>
      )
  }
}

export function AppointmentsList({
  appointments,
  loading,
  userRole,
  updatingAppointment,
  onStatusUpdate,
}: AppointmentsListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No tienes citas programadas</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-lg gap-4">
          <div className="flex-1">
            <h4 className="font-medium">{appointment.service?.nombre}</h4>
            <p className="text-sm text-muted-foreground">
              {userRole === "stylist" ? "Cliente" : "Estilista"}: {userRole === "stylist" ? appointment.client?.user?.name : appointment.stylist?.user?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {appointment.fecha} a las {appointment.hora}
            </p>
            {appointment.notas && (
              <p className="text-xs text-muted-foreground mt-1">
                Notas: {appointment.notas}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(appointment.status)}
            {userRole === "stylist" && appointment.status === "pendiente" && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => onStatusUpdate(appointment.id, "confirmada")}
                  disabled={updatingAppointment === appointment.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onStatusUpdate(appointment.id, "cancelada")}
                  disabled={updatingAppointment === appointment.id}
                >
                  <XCircle className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}