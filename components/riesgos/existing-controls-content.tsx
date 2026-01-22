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
import { Plus, Pencil, Trash2, Lock, Search } from "lucide-react"
import type { ExistingControl } from "@/lib/types/database"

const CONTROL_TYPES = [
  { value: "preventivo", label: "Preventivo" },
  { value: "detectivo", label: "Detectivo" },
  { value: "correctivo", label: "Correctivo" },
  { value: "disuasivo", label: "Disuasivo" },
]

const EFFECTIVENESS_OPTIONS = [
  { value: "alto", label: "Alto", color: "bg-green-500" },
  { value: "medio", label: "Medio", color: "bg-yellow-500" },
  { value: "bajo", label: "Bajo", color: "bg-orange-500" },
  { value: "nulo", label: "Nulo", color: "bg-red-500" },
]

export function ExistingControlsContent() {
  const [controls, setControls] = useState<ExistingControl[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingControl, setEditingControl] = useState<ExistingControl | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    control_type: "preventivo",
    effectiveness: "medio",
    implementation_status: "",
  })

  async function fetchControls() {
    const supabase = createClient()
    const { data } = await supabase.from("existing_controls").select("*").order("name")
    setControls(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchControls()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    if (editingControl) {
      await supabase.from("existing_controls").update(formData).eq("id", editingControl.id)
    } else {
      await supabase.from("existing_controls").insert(formData)
    }

    setIsDialogOpen(false)
    setEditingControl(null)
    resetForm()
    fetchControls()
  }

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      control_type: "preventivo",
      effectiveness: "medio",
      implementation_status: "",
    })
  }

  async function handleDelete(id: string) {
    if (!confirm("Esta seguro de eliminar este control?")) return
    const supabase = createClient()
    await supabase.from("existing_controls").delete().eq("id", id)
    fetchControls()
  }

  function openEditDialog(control: ExistingControl) {
    setEditingControl(control)
    setFormData({
      name: control.name,
      description: control.description || "",
      control_type: control.control_type || "preventivo",
      effectiveness: control.effectiveness || "medio",
      implementation_status: control.implementation_status || "",
    })
    setIsDialogOpen(true)
  }

  function openNewDialog() {
    setEditingControl(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const filteredControls = controls.filter((control) =>
    control.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function getEffectivenessBadge(effectiveness: string | null) {
    const option = EFFECTIVENESS_OPTIONS.find((o) => o.value === effectiveness)
    if (!option) return <Badge variant="secondary">-</Badge>
    return <Badge className={`${option.color} text-white`}>{option.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Controles Existentes</CardTitle>
            <CardDescription>
              Documenta los controles de seguridad actualmente implementados
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Control
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingControl ? "Editar Control" : "Nuevo Control"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingControl
                      ? "Modifica los datos del control"
                      : "Documenta un control de seguridad existente"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nombre del control"
                      required
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="control_type">Tipo de Control</Label>
                      <Select
                        value={formData.control_type}
                        onValueChange={(value) => setFormData({ ...formData, control_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTROL_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="effectiveness">Efectividad</Label>
                      <Select
                        value={formData.effectiveness}
                        onValueChange={(value) => setFormData({ ...formData, effectiveness: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EFFECTIVENESS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="implementation_status">Estado de Implementacion</Label>
                    <Input
                      id="implementation_status"
                      value={formData.implementation_status}
                      onChange={(e) => setFormData({ ...formData, implementation_status: e.target.value })}
                      placeholder="Ej: Implementado, Parcial, En proceso..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripcion</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripcion del control..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingControl ? "Guardar Cambios" : "Crear Control"}
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
                placeholder="Buscar controles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse text-muted-foreground">Cargando controles...</div>
            </div>
          ) : filteredControls.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Lock className="h-8 w-8 mb-2 opacity-50" />
              <p>No hay controles registrados</p>
              <p className="text-sm">Documenta los controles existentes</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Efectividad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredControls.map((control) => (
                  <TableRow key={control.id}>
                    <TableCell className="font-medium">{control.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CONTROL_TYPES.find((t) => t.value === control.control_type)?.label || control.control_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{getEffectivenessBadge(control.effectiveness)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {control.implementation_status || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(control)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(control.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
