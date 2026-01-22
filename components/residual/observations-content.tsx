"use client"

import React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, MessageSquare, Search, User, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { Observation, Risk } from "@/lib/types/database"

type ObservationWithRelations = Observation & {
  risks: Risk | null
}

const STATUS_OPTIONS = [
  { value: "abierta", label: "Abierta", color: "bg-blue-500" },
  { value: "en_revision", label: "En Revision", color: "bg-yellow-500" },
  { value: "resuelta", label: "Resuelta", color: "bg-green-500" },
  { value: "cerrada", label: "Cerrada", color: "bg-slate-500" },
]

const PRIORITY_OPTIONS = [
  { value: "alta", label: "Alta", color: "bg-red-500" },
  { value: "media", label: "Media", color: "bg-yellow-500" },
  { value: "baja", label: "Baja", color: "bg-green-500" },
]

export function ObservationsContent() {
  const [observations, setObservations] = useState<ObservationWithRelations[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingObs, setEditingObs] = useState<Observation | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    risk_id: "",
    title: "",
    description: "",
    status: "abierta",
    priority: "media",
    assigned_to: "",
    due_date: "",
    resolution: "",
  })

  async function fetchData() {
    const supabase = createClient()
    const [obsRes, risksRes] = await Promise.all([
      supabase.from("observations").select("*, risks(*)").order("created_at", { ascending: false }),
      supabase.from("risks").select("*").order("name"),
    ])

    setObservations((obsRes.data as ObservationWithRelations[]) || [])
    setRisks(risksRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    const obsData = {
      risk_id: formData.risk_id || null,
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      assigned_to: formData.assigned_to,
      due_date: formData.due_date || null,
      resolution: formData.resolution,
    }

    if (editingObs) {
      await supabase.from("observations").update(obsData).eq("id", editingObs.id)
    } else {
      await supabase.from("observations").insert(obsData)
    }

    setIsDialogOpen(false)
    setEditingObs(null)
    resetForm()
    fetchData()
  }

  function resetForm() {
    setFormData({
      risk_id: "",
      title: "",
      description: "",
      status: "abierta",
      priority: "media",
      assigned_to: "",
      due_date: "",
      resolution: "",
    })
  }

  async function handleDelete(id: string) {
    if (!confirm("Esta seguro de eliminar esta observacion?")) return
    const supabase = createClient()
    await supabase.from("observations").delete().eq("id", id)
    fetchData()
  }

  function openEditDialog(obs: ObservationWithRelations) {
    setEditingObs(obs)
    setFormData({
      risk_id: obs.risk_id || "",
      title: obs.title,
      description: obs.description || "",
      status: obs.status || "abierta",
      priority: obs.priority || "media",
      assigned_to: obs.assigned_to || "",
      due_date: obs.due_date || "",
      resolution: obs.resolution || "",
    })
    setIsDialogOpen(true)
  }

  function openNewDialog() {
    setEditingObs(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const filteredObs = observations.filter(
    (obs) =>
      obs.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.risks?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function getStatusBadge(status: string | null) {
    const option = STATUS_OPTIONS.find((o) => o.value === status)
    if (!option) return <Badge variant="secondary">-</Badge>
    return <Badge className={`${option.color} text-white`}>{option.label}</Badge>
  }

  function getPriorityBadge(priority: string | null) {
    const option = PRIORITY_OPTIONS.find((o) => o.value === priority)
    if (!option) return <Badge variant="secondary">-</Badge>
    return <Badge variant="outline" className={`border-2 ${option.value === "alta" ? "border-red-500 text-red-500" : option.value === "media" ? "border-yellow-500 text-yellow-500" : "border-green-500 text-green-500"}`}>{option.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Observaciones y Hallazgos
            </CardTitle>
            <CardDescription>
              Registra observaciones, hallazgos y acciones correctivas
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Observacion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingObs ? "Editar Observacion" : "Nueva Observacion"}
                  </DialogTitle>
                  <DialogDescription>
                    Documenta una observacion o hallazgo relacionado con riesgos
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Titulo *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Titulo de la observacion"
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Riesgo Relacionado</Label>
                      <Select
                        value={formData.risk_id}
                        onValueChange={(value) => setFormData({ ...formData, risk_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar riesgo..." />
                        </SelectTrigger>
                        <SelectContent>
                          {risks.map((risk) => (
                            <SelectItem key={risk.id} value={risk.id}>
                              {risk.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Prioridad</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Asignado A</Label>
                      <Input
                        value={formData.assigned_to}
                        onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                        placeholder="Responsable"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha Limite</Label>
                      <Input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descripcion</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripcion de la observacion..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Resolucion</Label>
                    <Textarea
                      value={formData.resolution}
                      onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                      placeholder="Acciones tomadas para resolver..."
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingObs ? "Guardar Cambios" : "Crear Observacion"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar observaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse text-muted-foreground">Cargando observaciones...</div>
            </div>
          ) : filteredObs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
              <p>No hay observaciones registradas</p>
              <p className="text-sm">Crea la primera observacion</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredObs.map((obs) => (
                <Card key={obs.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{obs.title}</CardTitle>
                        {obs.risks && (
                          <CardDescription className="text-xs">
                            Riesgo: {obs.risks.name}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(obs)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(obs.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {obs.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {obs.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {getStatusBadge(obs.status)}
                      {getPriorityBadge(obs.priority)}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        {obs.assigned_to && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {obs.assigned_to}
                          </span>
                        )}
                        {obs.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(obs.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <span>
                        {formatDistanceToNow(new Date(obs.created_at), { addSuffix: true, locale: es })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
