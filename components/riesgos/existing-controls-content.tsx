"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Search } from "lucide-react"

// Importamos tipos basados en tu SQL
import type { ExistingControl, ISOControl } from "@/lib/types/database"

export function ExistingControlsContent() {
  const [controls, setControls] = useState<ExistingControl[]>([])
  // Usamos un tipo parcial o Pick para la lista de selección si no necesitamos todo el objeto ISO
  const [isoList, setIsoList] = useState<ISOControl[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingControl, setEditingControl] = useState<ExistingControl | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const initialFormState = {
    name: "",
    description: "",
    iso_control_id: "" as string | null,
    effectiveness: 3,
    implementation_status: "Implementado",
  }

  const [formData, setFormData] = useState(initialFormState)

  async function fetchData() {
    setLoading(true)
    const supabase = createClient()
    
    // CORRECCIÓN: Seleccionamos "*" para cumplir con el tipo ISOControl 
    // o aseguramos que el estado acepte el subconjunto de datos.
    const [existingRes, isoRes] = await Promise.all([
      supabase.from("existing_controls").select("*").order("name"),
      supabase.from("iso_controls").select("*").order("control_id") 
    ])

    if (existingRes.data) setControls(existingRes.data)
    if (isoRes.data) setIsoList(isoRes.data)
    
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    
    const payload = {
      ...formData,
      iso_control_id: formData.iso_control_id === "" ? null : formData.iso_control_id
    }

    if (editingControl) {
      await supabase.from("existing_controls").update(payload).eq("id", editingControl.id)
    } else {
      await supabase.from("existing_controls").insert([payload])
    }

    setIsDialogOpen(false)
    setFormData(initialFormState)
    fetchData()
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este control?")) return
    const supabase = createClient()
    await supabase.from("existing_controls").delete().eq("id", id)
    fetchData()
  }

  const filteredControls = controls.filter((c) =>
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar control..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => { 
          setEditingControl(null); 
          setFormData(initialFormState); 
          setIsDialogOpen(true); 
        }}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Control
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Efectividad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Cargando...</TableCell></TableRow>
            ) : filteredControls.map((control) => (
              <TableRow key={control.id}>
                <TableCell className="font-medium">{control.name}</TableCell>
                <TableCell>
                  <Badge variant={(control.effectiveness || 0) >= 4 ? "default" : "secondary"}>
                    Nivel {control.effectiveness}/5
                  </Badge>
                </TableCell>
                <TableCell>{control.implementation_status}</TableCell>
                <TableCell className="text-right">
                   <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditingControl(control)
                      setFormData({
                        name: control.name,
                        description: control.description || "",
                        iso_control_id: control.iso_control_id,
                        effectiveness: control.effectiveness || 3,
                        implementation_status: control.implementation_status || "Implementado"
                      })
                      setIsDialogOpen(true)
                    }}>
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
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editingControl ? "Editar" : "Nuevo"} Control</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del Control</Label>
              <Input 
                id="name"
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>

            <div className="grid gap-2">
              <Label>Referencia ISO 27002</Label>
              <Select 
                value={formData.iso_control_id || "none"} 
                onValueChange={v => setFormData({...formData, iso_control_id: v === "none" ? null : v})}
              >
                <SelectTrigger><SelectValue placeholder="Seleccionar Control ISO" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin referencia ISO</SelectItem>
                  {isoList.map(iso => (
                    <SelectItem key={iso.id} value={iso.id}>
                      {iso.control_id} - {iso.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="effectiveness">Efectividad (1-5)</Label>
              <Input 
                id="effectiveness"
                type="number" 
                min="1" 
                max="5" 
                value={formData.effectiveness} 
                onChange={e => setFormData({...formData, effectiveness: parseInt(e.target.value) || 1})} 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea 
                id="description"
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}