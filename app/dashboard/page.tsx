"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Calendar, Users, Clock, Edit2, Trash2, Plus, Search, Shield
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Appointment {
  id: number
  fecha: string
  hora: string
  status: "pendiente" | "confirmada" | "cancelada" | "completada"
  client?: { user?: { name: string; email: string } }
  stylist?: { user?: { name: string } }
  service?: { nombre: string; precio: number | string }
}

interface Service {
  id: number
  nombre: string
  precio: number | string
  duracion_minutos: number
}

interface UserItem {
  id: string | number
  name: string
  email: string
  role: "admin" | "stylist" | "client"
  phone?: string
  createdAt: string | Date
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [users, setUsers] = useState<UserItem[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formRole, setFormRole] = useState<"admin" | "stylist" | "client">("client")

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user || user.role !== "admin") return

    const fetchData = async () => {
      try {
        setStatsLoading(true)
        const token = localStorage.getItem("beautyroom_auth")
          ? JSON.parse(localStorage.getItem("beautyroom_auth") || "{}").token
          : null

        const [appointmentsRes, servicesRes, usersRes] = await Promise.all([
          fetch(`${API_BASE}/api/appointments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/services`),
          fetch(`${API_BASE}/api/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (appointmentsRes.ok) {
          const data = await appointmentsRes.json()
          setAppointments(Array.isArray(data) ? data : data.data || [])
        }

        if (servicesRes.ok) {
          const data = await servicesRes.json()
          setServices(Array.isArray(data) ? data : data.data || [])
        }

        if (usersRes.ok) {
          const data = await usersRes.json()
          const usersList = Array.isArray(data) ? data : data.data || []
          setUsers(usersList.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role || "client",
            phone: u.phone || u.telefono || "",
            createdAt: u.created_at || new Date(),
          })))
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Error al cargar los datos")
      } finally {
        setStatsLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (user.role !== "admin") return null

  const todayDate = new Date().toISOString().split("T")[0]
  const todayAppointments = appointments.filter((a) => a.fecha === todayDate)
  const pendingAppointments = appointments.filter((a) => a.status === "pendiente")

  // Solo estadísticas esenciales
  const allStats = [
    {
      title: "Citas de Hoy",
      value: todayAppointments.length.toString(),
      icon: Calendar,
      description: "Programadas para hoy",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Citas Pendientes",
      value: pendingAppointments.length.toString(),
      icon: Clock,
      description: "Por confirmar",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Total de Usuarios",
      value: users.length.toString(),
      icon: Users,
      description: "Registrados",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === "all" || u.role === filterRole
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-primary/10 text-primary">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        )
      case "stylist":
        return <Badge variant="secondary">Estilista</Badge>
      case "client":
        return <Badge variant="outline">Cliente</Badge>
    }
  }

  const handleCreateUser = async () => {
    if (!formName || !formEmail || !formPassword) {
      toast.error("Por favor completa nombre, email y contraseña")
      return
    }

    try {
      const token = localStorage.getItem("beautyroom_auth")
        ? JSON.parse(localStorage.getItem("beautyroom_auth") || "{}").token
        : null

      const res = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          phone: formPhone,
          role: formRole,
          password: formPassword,
        }),
      })

      if (res.ok) {
        const newUser = await res.json()
        setUsers((prev) => [...prev, {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone || "",
          createdAt: new Date(),
        }])
        resetForm()
        setIsCreateDialogOpen(false)
        toast.success("Usuario creado exitosamente")
      } else {
        toast.error("Error al crear el usuario")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de conexión")
    }
  }

  const handleEditUser = async () => {
    if (!editingUser || !formName || !formEmail) {
      toast.error("Por favor completa todos los campos")
      return
    }

    try {
      const token = localStorage.getItem("beautyroom_auth")
        ? JSON.parse(localStorage.getItem("beautyroom_auth") || "{}").token
        : null

      const body: any = {
        name: formName,
        email: formEmail,
        phone: formPhone,
        role: formRole,
      }

      // Solo incluir password si se especificó uno nuevo
      if (formPassword) {
        body.password = formPassword
      }

      const res = await fetch(`${API_BASE}/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? { ...u, name: formName, email: formEmail, phone: formPhone, role: formRole }
              : u,
          ),
        )
        resetForm()
        setIsEditDialogOpen(false)
        setEditingUser(null)
        toast.success("Usuario actualizado exitosamente")
      } else {
        toast.error("Error al actualizar el usuario")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de conexión")
    }
  }

  const handleDeleteUser = async (userId: string | number) => {
    try {
      const token = localStorage.getItem("beautyroom_auth")
        ? JSON.parse(localStorage.getItem("beautyroom_auth") || "{}").token
        : null

      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        toast.success("Usuario eliminado exitosamente")
      } else {
        toast.error("Error al eliminar el usuario")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de conexión")
    }
  }

  const openEditDialog = (userToEdit: UserItem) => {
    setEditingUser(userToEdit)
    setFormName(userToEdit.name)
    setFormEmail(userToEdit.email)
    setFormPhone(userToEdit.phone || "")
    setFormPassword("")
    setFormRole(userToEdit.role)
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormName("")
    setFormEmail("")
    setFormPhone("")
    setFormPassword("")
    setFormRole("client")
  }

  const deleteAppointment = async (id: number) => {
    if (!confirm("¿Eliminar esta cita?")) return

    try {
      setDeletingId(id)
      const token = localStorage.getItem("beautyroom_auth")
        ? JSON.parse(localStorage.getItem("beautyroom_auth") || "{}").token
        : null

      const res = await fetch(`${API_BASE}/api/appointments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setAppointments(appointments.filter((a) => a.id !== id))
        toast.success("Cita eliminada")
      } else {
        toast.error("Error al eliminar la cita")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de conexión")
    } finally {
      setDeletingId(null)
    }
  }

  const updateAppointmentStatus = async (id: number, newStatus: "pendiente" | "confirmada" | "cancelada" | "completada") => {
    try {
      const token = localStorage.getItem("beautyroom_auth")
        ? JSON.parse(localStorage.getItem("beautyroom_auth") || "{}").token
        : null

      const res = await fetch(`${API_BASE}/api/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setAppointments(
          appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        )
        toast.success("Cita actualizada")
      } else {
        toast.error("Error al actualizar")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de conexión")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      confirmada: { color: "bg-green-100 text-green-800", label: "Confirmada" },
      pendiente: { color: "bg-amber-100 text-amber-800", label: "Pendiente" },
      cancelada: { color: "bg-red-100 text-red-800", label: "Cancelada" },
      completada: { color: "bg-blue-100 text-blue-800", label: "Completada" },
    }
    const config = statusConfig[status] || { color: "bg-gray-100", label: status }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">
              Bienvenido, {user.name}. Gestiona tu salón de belleza desde aquí
            </p>
          </div>

          {/* Estadísticas simplificadas */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {allStats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-full`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="appointments" className="space-y-4">
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="appointments">Citas</TabsTrigger>
              <TabsTrigger value="users">Usuarios</TabsTrigger>
            </TabsList>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Gestión de Citas</CardTitle>
                    <CardDescription>Todas las citas programadas</CardDescription>
                  </div>
                  <Link href="/citas">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Nueva Cita
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {appointments.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No hay citas</p>
                    ) : (
                      appointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">
                                {appointment.service?.nombre || "Servicio"}
                              </p>
                              {getStatusBadge(appointment.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {appointment.client?.user?.name || "Cliente"} →{" "}
                              {appointment.stylist?.user?.name || "Estilista"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {appointment.fecha} a las {appointment.hora}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={appointment.status}
                              onChange={(e) =>
                                updateAppointmentStatus(appointment.id, e.target.value as "pendiente" | "confirmada" | "cancelada" | "completada")
                              }
                              className="text-xs px-2 py-1 border rounded"
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="confirmada">Confirmada</option>
                              <option value="completada">Completada</option>
                              <option value="cancelada">Cancelada</option>
                            </select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAppointment(appointment.id)}
                              disabled={deletingId === appointment.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-4 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar usuarios..."
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filtrar por rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="stylist">Estilista</SelectItem>
                          <SelectItem value="client">Cliente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          Nuevo Usuario
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                          <DialogDescription>Ingresa los datos del nuevo usuario</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Nombre completo *</Label>
                            <Input
                              value={formName}
                              onChange={(e) => setFormName(e.target.value)}
                              placeholder="Nombre del usuario"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Correo electrónico *</Label>
                            <Input
                              type="email"
                              value={formEmail}
                              onChange={(e) => setFormEmail(e.target.value)}
                              placeholder="email@ejemplo.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Contraseña *</Label>
                            <Input
                              type="password"
                              value={formPassword}
                              onChange={(e) => setFormPassword(e.target.value)}
                              placeholder="Mínimo 6 caracteres"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Teléfono</Label>
                            <Input
                              value={formPhone}
                              onChange={(e) => setFormPhone(e.target.value)}
                              placeholder="+52 555 123 4567"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Rol</Label>
                            <Select
                              value={formRole}
                              onValueChange={(v) => setFormRole(v as "admin" | "stylist" | "client")}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="stylist">Estilista</SelectItem>
                                <SelectItem value="client">Cliente</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleCreateUser}>Crear Usuario</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lista de Usuarios</CardTitle>
                  <CardDescription>{filteredUsers.length} usuarios encontrados</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Registro</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((userItem) => (
                        <TableRow key={userItem.id}>
                          <TableCell className="font-medium">{userItem.name}</TableCell>
                          <TableCell>{userItem.email}</TableCell>
                          <TableCell>{userItem.phone || "-"}</TableCell>
                          <TableCell>{getRoleBadge(userItem.role)}</TableCell>
                          <TableCell>
                            {new Date(userItem.createdAt).toLocaleDateString("es-MX")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(userItem)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    disabled={userItem.id === user.id}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. El usuario {userItem.name} será eliminado
                                      permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUser(userItem.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No se encontraron usuarios</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Usuario</DialogTitle>
                    <DialogDescription>Modifica los datos del usuario</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Nombre completo</Label>
                      <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Correo electrónico</Label>
                      <Input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nueva contraseña (dejar vacío para no cambiar)</Label>
                      <Input
                        type="password"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="Solo si quieres cambiarla"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Rol</Label>
                      <Select
                        value={formRole}
                        onValueChange={(v) => setFormRole(v as "admin" | "stylist" | "client")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="stylist">Estilista</SelectItem>
                          <SelectItem value="client">Cliente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleEditUser}>Guardar Cambios</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}