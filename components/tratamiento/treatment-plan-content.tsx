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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Pencil, Trash2, ClipboardList, Search } from "lucide-react"
import type { RiskTreatment, Risk, IsoControl } from "@/lib/types/database"

type TreatmentWithRelations = RiskTreatment & {
  risks: Risk | null
  iso_controls: IsoControl | null
}

const TREATMENT_OPTIONS = [
  { value: "mitigar", label: "Mitigar" },
  { value: "transferir", label: "Transferir" },
  { value: "aceptar", label: "Aceptar" },
  { value: "evitar", label: "Evitar" },
]

const STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendiente", color: "bg-slate-500" },
  { value: "en_progreso", label: "En Progreso", color: "bg-blue-500" },
  { value: "completado", label: "Completado", color: "bg-green-500" },
  { value: "cancelado", label: "Cancelado", color: "bg-red-500" },
]

export function TreatmentPlanContent() {
  const [treatments, setTreatments] = useState<TreatmentWithRelations[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [isoControls, setIsoControls] = useState<IsoControl[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState<RiskTreatment | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    risk_id: "",
    iso_control_id: "",
    treatment_option: "mitigar",
    responsible: "",
    due_date: "",
    status: "pendiente",
    progress: 0,
  })

  async function fetchData() {
    const supabase = createClient()
    const [treatmentsRes, risksRes, controlsRes] = await Promise.all([
      supabase.from("risk_treatments").select("*, risks(*), iso_controls(*)").order("created_at", { ascending: false }),
      supabase.from("risks").select("*").order("name"),
      supabase.from("iso_controls").select("*").order("control_id"),
    ])

    setTreatments((treatmentsRes.data as TreatmentWithRelations[]) || [])
    setRisks(risksRes.data || [])
    setIsoControls(controlsRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    const treatmentData = {
      name: formData.name,
      description: formData.description,
      risk_id: formData.risk_id || null,
      iso_control_id: formData.iso_control_id || null,
      treatment_option: formData.treatment_option,
      responsible: formData.responsible,
      due_date: formData.due_date || null,
      status: formData.status,
      progress: formData.progress,
    }

    if (editingTreatment) {
      await supabase.from("risk_treatments").update(treatmentData).eq("id", editingTreatment.id)
    } else {
      await supabase.from("risk_treatments").insert(treatmentData)
    }

    setIsDialogOpen(false)
    setEditingTreatment(null)
    resetForm()
    fetchData()
  }

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      risk_id: "",
      iso_control_id: "",
      treatment_option: "mitigar",
      responsible: "",
      due_date: "",
      status: "pendiente",
      progress: 0,
    })
  }

  async function handleDelete(id: string) {
    if (!confirm("Esta seguro de eliminar este plan de tratamiento?")) return
    const supabase = createClient()
    await supabase.from("risk_treatments").delete().eq("id", id)
    fetchData()
  }

  function openEditDialog(treatment: TreatmentWithRelations) {
    setEditingTreatment(treatment)
    setFormData({
      name: treatment.name,
      description: treatment.description || "",
      risk_id: treatment.risk_id || "",
      iso_control_id: treatment.iso_control_id || "",
      treatment_option: treatment.treatment_option || "mitigar",
      responsible: treatment.responsible || "",
      due_date: treatment.due_date || "",
      status: treatment.status || "pendiente",
      progress: treatment.progress || 0,
    })
    setIsDialogOpen(true)
  }

  function openNewDialog() {
    setEditingTreatment(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const filteredTreatments = treatments.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function getStatusBadge(status: string | null) {
    const option = STATUS_OPTIONS.find((o) => o.value === status)
    if (!option) return <Badge variant="secondary">-</Badge>
    return <Badge className={`${option.color} text-white`}>{option.label}</Badge>
  }

  // Stats
  const completedCount = treatments.filter(t => t.status === "completado").length
  const inProgressCount = treatments.filter(t => t.status === "en_progreso").length
  const avgProgress = treatments.length > 0
    ? Math.round(treatments.reduce((sum, t) => sum + (t.progress || 0), 0) / treatments.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{treatments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{inProgressCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{completedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progreso Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
            <Progress value={avgProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Plan de Tratamiento de Riesgos</CardTitle>
            <CardDescription>
              Define y gestiona los planes para tratar cada riesgo identificado
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingTreatment ? "Editar Plan" : "Nuevo Plan de Tratamiento"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingTreatment
                      ? "Modifica los datos del plan"
                      : "Crea un plan para tratar un riesgo identificado"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Plan *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nombre descriptivo del plan"
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Riesgo Asociado</Label>
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
                      <Label>Control ISO</Label>
                      <Select
                        value={formData.iso_control_id}
                        onValueChange={(value) => setFormData({ ...formData, iso_control_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar control..." />
                        </SelectTrigger>
                        <SelectContent>
                          {isoControls.map((control) => (
                            <SelectItem key={control.id} value={control.id}>
                              {control.control_id} - {control.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Opcion de Tratamiento</Label>
                      <Select
                        value={formData.treatment_option}
                        onValueChange={(value) => setFormData({ ...formData, treatment_option: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TREATMENT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Responsable</Label>
                      <Input
                        value={formData.responsible}
                        onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                        placeholder="Persona responsable"
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
                    <div className="space-y-2">
                      <Label>Progreso (%)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={formData.progress}
                        onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descripcion</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripcion del plan de tratamiento..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingTreatment ? "Guardar Cambios" : "Crear Plan"}
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
                placeholder="Buscar planes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse text-muted-foreground">Cargando planes...</div>
            </div>
          ) : filteredTreatments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <ClipboardList className="h-8 w-8 mb-2 opacity-50" />
              <p>No hay planes de tratamiento</p>
              <p className="text-sm">Crea el primer plan para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Riesgo</TableHead>
                    <TableHead>Opcion</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTreatments.map((treatment) => (
                    <TableRow key={treatment.id}>
                      <TableCell className="font-medium max-w-xs truncate">{treatment.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {treatment.risks?.name || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {TREATMENT_OPTIONS.find(o => o.value === treatment.treatment_option)?.label || treatment.treatment_option}
                        </Badge>
                      </TableCell>
                      <TableCell>{treatment.responsible || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={treatment.progress || 0} className="w-16" />
                          <span className="text-sm">{treatment.progress || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(treatment.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(treatment)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(treatment.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
