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

/**
 * IMPORTANTE: Los valores deben coincidir con el CHECK de tu SQL:
 * 'Natural', 'Humana Intencional', 'Humana No Intencional', 'Técnica', 'Ambiental'
 */
const THREAT_CATEGORIES = [
  { value: "Natural", label: "Natural", color: "bg-blue-500" },
  { value: "Humana Intencional", label: "Humana Intencional", color: "bg-red-500" },
  { value: "Humana No Intencional", label: "Humana No Intencional", color: "bg-orange-500" },
  { value: "Técnica", label: "Técnica", color: "bg-slate-500" },
  { value: "Ambiental", label: "Ambiental", color: "bg-green-500" },
]

export function ThreatsContent() {
  const [threats, setThreats] = useState<Threat[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingThreat, setEditingThreat] = useState<Threat | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  const initialFormState = {
    name: "",
    description: "",
    category: "Técnica", // En SQL se llama 'category', no 'threat_type'
    source: "",
  }

  const [formData, setFormData] = useState(initialFormState)

  async function fetchThreats() {
    setLoading(true)
    const supabase = createClient()
    // Consultamos la tabla 'threats'
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

  async function handleDelete(id: string) {
    if (!confirm("¿Está seguro de eliminar esta amenaza?")) return
    const supabase = createClient()
    await supabase.from("threats").delete().eq("id", id)
    fetchThreats()
  }

  function openEditDialog(threat: Threat) {
    setEditingThreat(threat)
    setFormData({
      name: threat.name,
      description: threat.description || "",
      category: threat.category, // Mapeo correcto
      source: threat.source || "",
    })
    setIsDialogOpen(true)
  }

  const filteredThreats = threats.filter(
    (threat) =>
      threat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      threat.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function getCategoryBadge(categoryName: string) {
    const config = THREAT_CATEGORIES.find((t) => t.value === categoryName)
    return (
      <Badge className={`${config?.color || "bg-slate-500"} text-white border-none`}>
        {config?.label || categoryName}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Catálogo de Amenazas</CardTitle>
            <CardDescription>Sincronizado con Base de Datos SQL</CardDescription>
          </div>
          <Button onClick={() => { setEditingThreat(null); setFormData(initialFormState); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Nueva Amenaza
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría (Tipo)</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Cargando...</TableCell></TableRow>
                ) : filteredThreats.map((threat) => (
                  <TableRow key={threat.id}>
                    <TableCell className="font-medium">{threat.name}</TableCell>
                    <TableCell>{getCategoryBadge(threat.category)}</TableCell>
                    <TableCell>{threat.source || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">{threat.description || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(threat)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(threat.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingThreat ? "Editar" : "Nueva"} Amenaza</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Categoría de Amenaza</Label>
                <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {THREAT_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fuente / Origen</Label>
                <Input value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} placeholder="Ej. Externa, Interna..." />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Guardar Amenaza</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}