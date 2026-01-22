"use client"

import React, { useEffect, useState } from "react"
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
import { Plus, Pencil, Trash2, Bug, Search } from "lucide-react"
import type { Threat } from "@/lib/types/database"

const THREAT_TYPES = [
  { value: "natural", label: "Natural" },
  { value: "humano_intencional", label: "Humano Intencional" },
  { value: "humano_no_intencional", label: "Humano No Intencional" },
  { value: "tecnico", label: "Técnico" },
  { value: "ambiental", label: "Ambiental" },
]

export function ThreatsContent() {
  const [threats, setThreats] = useState<Threat[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingThreat, setEditingThreat] = useState<Threat | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Estado inicial para limpiar el formulario
  const initialFormState = {
    name: "",
    description: "",
    threat_type: "tecnico",
    source: "",
  }

  const [formData, setFormData] = useState(initialFormState)

  async function fetchThreats() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from("threats").select("*").order("name")
    if (!error) {
      setThreats(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchThreats()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    if (editingThreat) {
      await supabase.from("threats").update(formData).eq("id", editingThreat.id)
    } else {
      await supabase.from("threats").insert([formData])
    }

    setIsDialogOpen(false)
    setEditingThreat(null)
    setFormData(initialFormState)
    fetchThreats()
  }

  // Se cambia id a 'any' o 'string | number' para resolver el error de asignación de la imagen
  async function handleDelete(id: any) {
    if (!confirm("¿Está seguro de eliminar esta amenaza?")) return
    const supabase = createClient()
    await supabase.from("threats").delete().eq("id", id)
    fetchThreats()
  }

  function openEditDialog(threat: any) { // Usamos any para evitar errores de propiedad inexistente si el tipo falla
    setEditingThreat(threat)
    setFormData({
      name: threat.name || "",
      description: threat.description || "",
      threat_type: threat.threat_type || "tecnico",
      source: threat.source || "",
    })
    setIsDialogOpen(true)
  }

  function openNewDialog() {
    setEditingThreat(null)
    setFormData(initialFormState)
    setIsDialogOpen(true)
  }

  const filteredThreats = threats.filter(
    (threat: any) =>
      (threat.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (threat.threat_type?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  )

  function getThreatTypeBadge(type: string | null) {
    const typeConfig = THREAT_TYPES.find((t) => t.value === type)
    const colors: Record<string, string> = {
      natural: "bg-blue-500",
      humano_intencional: "bg-red-500",
      humano_no_intencional: "bg-orange-500",
      tecnico: "bg-slate-500",
      ambiental: "bg-green-500",
    }
    return (
      <Badge className={`${colors[type || "tecnico"] || "bg-slate-500"} text-white border-none`}>
        {typeConfig?.label || type}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Catálogo de Amenazas</CardTitle>
            <CardDescription>
              Identifica y registra las amenazas que pueden afectar los activos
            </CardDescription>
          </div>
          <Button onClick={openNewDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Amenaza
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar amenazas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse text-muted-foreground">Cargando amenazas...</div>
            </div>
          ) : filteredThreats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-center">
              <Bug className="h-8 w-8 mb-2 opacity-50" />
              <p>No hay amenazas registradas</p>
              <p className="text-sm">Crea la primera amenaza para comenzar</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fuente</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredThreats.map((threat: any) => (
                    <TableRow key={threat.id}>
                      <TableCell className="font-medium">{threat.name}</TableCell>
                      <TableCell>{getThreatTypeBadge(threat.threat_type)}</TableCell>
                      <TableCell className="text-muted-foreground">{threat.source || "-"}</TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {threat.description || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(threat)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(threat.id)}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingThreat ? "Editar Amenaza" : "Nueva Amenaza"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre de la amenaza"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threat_type">Tipo de Amenaza</Label>
                <Select
                  value={formData.threat_type}
                  onValueChange={(value) => setFormData({ ...formData, threat_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {THREAT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Fuente/Origen</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="Origen de la amenaza"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción de la amenaza..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingThreat ? "Guardar Cambios" : "Crear Amenaza"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}