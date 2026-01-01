"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"
import { BookingForm } from "@/components/appointment/booking-form"
import { AppointmentsList } from "@/components/appointment/appointments-list"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Service {
  id: number
  nombre: string
  descripcion?: string
  precio: number
  duracion_minutos: number
  imagen_url?: string
}

interface Stylist {
  id: number
  user_id: number
  especialidad: string
  status: string
  telefono: string
  user: {
    id: number
    name: string
    email: string
  }
  services: Service[]
}

interface Client {
  id: number
  user_id: number
  telefono: string
  direccion: string
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
    user: {
      id: number
      name: string
      email: string
    }
  }
  stylist?: {
    id: number
    user: {
      id: number
      name: string
      email: string
    }
  }
  service?: Service
}

export default function CitasPage() {
  const { user, isLoading } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [stylists, setStylists] = useState<Stylist[]>([])
  const [filteredStylists, setFilteredStylists] = useState<Stylist[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])

  const [selectedService, setSelectedService] = useState<string>("")
  const [selectedStylist, setSelectedStylist] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [notes, setNotes] = useState<string>("")

  const [loadingServices, setLoadingServices] = useState(true)
  const [loadingStylists, setLoadingStylists] = useState(true)
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [updatingAppointment, setUpdatingAppointment] = useState<number | null>(null)

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/services`)
        if (res.ok) {
          const data = await res.json()
          setServices(data)
        }
      } catch (err) {
        console.error("Error fetching services:", err)
      } finally {
        setLoadingServices(false)
      }
    }
    fetchServices()
  }, [])

  // Fetch stylists
  useEffect(() => {
    const fetchStylists = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stylists`)
        if (res.ok) {
          const data = await res.json()
          setStylists(data)
        }
      } catch (err) {
        console.error("Error fetching stylists:", err)
      } finally {
        setLoadingStylists(false)
      }
    }
    fetchStylists()
  }, [])

  // Fetch appointments for stylist or client
  useEffect(() => {
    if (!isLoading && user) {
      const fetchAppointments = async () => {
        setLoadingAppointments(true)
        try {
          if (user.role === "stylist") {
            const stylistRes = await fetch(`${API_BASE}/api/stylists`)
            if (stylistRes.ok) {
              const stylistsData = await stylistRes.json()
              const currentStylist = stylistsData.find((s: Stylist) => s.user_id === user.id)

              if (currentStylist) {
                const appointmentsRes = await fetch(`${API_BASE}/api/stylists/${currentStylist.id}/appointments`)
                if (appointmentsRes.ok) {
                  const appointmentsData = await appointmentsRes.json()
                  setAppointments(appointmentsData)
                }
              }
            }
          } else if (user.role === "client") {
            const appointmentsRes = await fetch(`${API_BASE}/api/appointments`)
            if (appointmentsRes.ok) {
              const appointmentsData = await appointmentsRes.json()
              const clientAppointments = appointmentsData.filter(
                (apt: Appointment) => apt.client?.user?.id === user.id
              )
              setAppointments(clientAppointments)
            }
          }
        } catch (err) {
          console.error("Error fetching appointments:", err)
        } finally {
          setLoadingAppointments(false)
        }
      }
      fetchAppointments()
    }
  }, [user, isLoading])

  // Filter stylists when service is selected
  useEffect(() => {
    if (selectedService) {
      const serviceId = parseInt(selectedService)
      const filtered = stylists.filter((stylist) =>
        stylist.services.some((service) => service.id === serviceId)
      )
      setFilteredStylists(filtered)
      setSelectedStylist("")
    } else {
      setFilteredStylists(stylists)
    }
  }, [selectedService, stylists])

  const handleBookAppointment = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para agendar una cita")
      return
    }

    if (!selectedService || !selectedStylist || !selectedDate || !selectedTime) {
      toast.error("Por favor completa todos los campos")
      return
    }

    setIsBooking(true)

    try {
      const userRes = await fetch(`${API_BASE}/api/users/${user.id}`)
      if (!userRes.ok) {
        toast.error("Error al obtener datos del cliente")
        setIsBooking(false)
        return
      }

      const userData = await userRes.json()
      const userDataObj = userData?.user || userData?.data?.user || userData?.data || userData

      let clientId: number | null = null

      if (userDataObj.client?.id) {
        clientId = userDataObj.client.id
      } else {
        const clientsRes = await fetch(`${API_BASE}/api/clients`)
        if (clientsRes.ok) {
          const clients = await clientsRes.json()
          const foundClient = clients.find((c: Client) => c.user_id === user.id)
          clientId = foundClient?.id || null
        }
      }

      if (!clientId) {
        toast.error("No se encontró información del cliente")
        setIsBooking(false)
        return
      }

      const appointmentData = {
        client_id: clientId,
        stylist_id: parseInt(selectedStylist),
        service_id: parseInt(selectedService),
        fecha: selectedDate.toISOString().split("T")[0],
        hora: selectedTime,
        status: "pendiente",
        notas: notes || null,
      }

      const appointmentRes = await fetch(`${API_BASE}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      })

      if (!appointmentRes.ok) {
        toast.error("Error al crear la cita")
        setIsBooking(false)
        return
      }

      toast.success("¡Cita agendada exitosamente!")

      setSelectedService("")
      setSelectedStylist("")
      setSelectedDate(undefined)
      setSelectedTime("")
      setNotes("")

      // Recargar citas
      if (user.role === "client") {
        const appointmentsRes = await fetch(`${API_BASE}/api/appointments`)
        if (appointmentsRes.ok) {
          const appointmentsData = await appointmentsRes.json()
          const clientAppointments = appointmentsData.filter(
            (apt: Appointment) => apt.client?.user?.id === user.id
          )
          setAppointments(clientAppointments)
        }
      }
    } catch (err) {
      console.error("Error booking appointment:", err)
      toast.error("Error al agendar la cita")
    } finally {
      setIsBooking(false)
    }
  }

  const handleUpdateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    setUpdatingAppointment(appointmentId)
    try {
      const res = await fetch(`${API_BASE}/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId ? { ...apt, status: newStatus as any } : apt
          )
        )
        toast.success(`Cita ${newStatus === "confirmada" ? "confirmada" : "cancelada"}`)
      }
    } catch (err) {
      console.error("Error updating appointment:", err)
      toast.error("Error al actualizar la cita")
    } finally {
      setUpdatingAppointment(null)
    }
  }

  return (
    <div className="py-12 bg-muted/30 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Agenda tu Cita</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Selecciona el servicio, estilista y horario que prefieras
          </p>
        </div>

        <Tabs defaultValue="nueva" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nueva">Nueva Cita</TabsTrigger>
            {!isLoading && user && <TabsTrigger value="mis-citas">Mis Citas</TabsTrigger>}
          </TabsList>

          <TabsContent value="nueva">
            <Card>
              <CardHeader>
                <CardTitle>Agendar Nueva Cita</CardTitle>
                <CardDescription>Completa los siguientes campos para agendar tu cita</CardDescription>
              </CardHeader>
              <CardContent>
                <BookingForm
                  user={user}
                  services={services}
                  filteredStylists={filteredStylists}
                  selectedService={selectedService}
                  selectedStylist={selectedStylist}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  notes={notes}
                  isLoading={isLoading}
                  isBooking={isBooking}
                  loadingServices={loadingServices}
                  loadingStylists={loadingStylists}
                  onServiceChange={setSelectedService}
                  onStylistChange={setSelectedStylist}
                  onDateChange={setSelectedDate}
                  onTimeChange={setSelectedTime}
                  onNotesChange={setNotes}
                  onSubmit={handleBookAppointment}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {!isLoading && user && (
            <TabsContent value="mis-citas">
              <Card>
                <CardHeader>
                  <CardTitle>Mis Citas</CardTitle>
                  <CardDescription>
                    {user.role === "stylist" ? "Gestiona tus citas próximas" : "Historial y próximas citas"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AppointmentsList
                    appointments={appointments}
                    loading={loadingAppointments}
                    userRole={user.role}
                    updatingAppointment={updatingAppointment}
                    onStatusUpdate={handleUpdateAppointmentStatus}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}