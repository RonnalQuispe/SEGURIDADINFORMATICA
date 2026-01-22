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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Shield, Search, BookOpen } from "lucide-react"
import type { IsoControl } from "@/lib/types/database"

const ISO_CATEGORIES = [
  { value: "5", label: "5 - Controles Organizacionales" },
  { value: "6", label: "6 - Controles de Personas" },
  { value: "7", label: "7 - Controles Fisicos" },
  { value: "8", label: "8 - Controles Tecnologicos" },
]

const CONTROL_TYPES = [
  { value: "preventivo", label: "Preventivo" },
  { value: "detectivo", label: "Detectivo" },
  { value: "correctivo", label: "Correctivo" },
]

export function IsoControlsContent() {
  const [controls, setControls] = useState<IsoControl[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingControl, setEditingControl] = useState<IsoControl | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    control_id: "",
    name: "",
    description: "",
    category: "5",
    control_type: "preventivo",
    objective: "",
  })

  async function fetchControls() {
    const supabase = createClient()
    const { data } = await supabase.from("iso_controls").select("*").order("control_id")
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
      await supabase.from("iso_controls").update(formData).eq("id", editingControl.id)
    } else {
      await supabase.from("iso_controls").insert(formData)
    }

    setIsDialogOpen(false)
    setEditingControl(null)
    resetForm()
    fetchControls()
  }

  function resetForm() {
    setFormData({
      control_id: "",
      name: "",
      description: "",
      category: "5",
      control_type: "preventivo",
      objective: "",
    })
  }

  async function handleDelete(id: string) {
    if (!confirm("Esta seguro de eliminar este control ISO?")) return
    const supabase = createClient()
    await supabase.from("iso_controls").delete().eq("id", id)
    fetchControls()
  }

  function openEditDialog(control: IsoControl) {
    setEditingControl(control)
    setFormData({
      control_id: control.control_id,
      name: control.name,
      description: control.description || "",
      category: control.category || "5",
      control_type: control.control_type || "preventivo",
      objective: control.objective || "",
    })
    setIsDialogOpen(true)
  }

  function openNewDialog() {
    setEditingControl(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const filteredControls = controls.filter(
    (control) =>
      control.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.control_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedControls = ISO_CATEGORIES.map((cat) => ({
    ...cat,
    controls: filteredControls.filter((c) => c.category === cat.value),
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Catalogo de Controles ISO 27002:2022
            </CardTitle>
            <CardDescription>
              Gestiona el catalogo de controles de seguridad segun la norma ISO 27002:2022
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Control ISO
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingControl ? "Editar Control ISO" : "Nuevo Control ISO"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingControl
                      ? "Modifica los datos del control"
                      : "Agrega un control de la norma ISO 27002:2022"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="control_id">ID del Control *</Label>
                      <Input
                        id="control_id"
                        value={formData.control_id}
                        onChange={(e) => setFormData({ ...formData, control_id: e.target.value })}
                        placeholder="Ej: 5.1, 6.2, 8.15..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ISO_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Control *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nombre del control"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Control</Label>
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
                    <Label htmlFor="objective">Objetivo</Label>
                    <Textarea
                      id="objective"
                      value={formData.objective}
                      onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                      placeholder="Objetivo del control..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripcion</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripcion detallada del control..."
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
                placeholder="Buscar por ID o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse text-muted-foreground">Cargando controles ISO...</div>
            </div>
          ) : controls.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Shield className="h-8 w-8 mb-2 opacity-50" />
              <p>No hay controles ISO registrados</p>
              <p className="text-sm">Agrega controles del estandar ISO 27002:2022</p>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {groupedControls.map((group) => (
                <AccordionItem key={group.value} value={group.value}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{group.controls.length}</Badge>
                      <span>{group.label}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {group.controls.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No hay controles en esta categoria
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-24">ID</TableHead>
                            <TableHead>Control</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="w-24">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.controls.map((control) => (
                            <TableRow key={control.id}>
                              <TableCell className="font-mono font-medium">
                                {control.control_id}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{control.name}</p>
                                  {control.objective && (
                                    <p className="text-sm text-muted-foreground truncate max-w-md">
                                      {control.objective}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{control.control_type}</Badge>
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
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
