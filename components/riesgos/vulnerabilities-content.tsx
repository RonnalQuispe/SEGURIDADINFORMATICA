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
import { Plus, Pencil, Trash2, Search, AlertTriangle } from "lucide-react"
import type { Vulnerability } from "@/lib/types/database"

// Mapeo según tu SQL: severity es INTEGER del 1 al 5
const SEVERITY_OPTIONS = [
  { value: "5", label: "Crítica (5)", color: "bg-red-600" },
  { value: "4", label: "Alta (4)", color: "bg-orange-500" },
  { value: "3", label: "Media (3)", color: "bg-yellow-500" },
  { value: "2", label: "Baja (2)", color: "bg-blue-400" },
  { value: "1", label: "Muy Baja (1)", color: "bg-slate-400" },
]

// Mapeo para las categorías definidas en el CHECK del SQL
const CATEGORY_OPTIONS = ["Técnica", "Organizacional", "Física", "Humana"]

export function VulnerabilitiesContent() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVuln, setEditingVuln] = useState<Vulnerability | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const initialForm = {
    name: "",
    description: "",
    category: "Técnica", // Obligatorio en tu SQL
    severity: 3,         // INTEGER en tu SQL
  }

  const [formData, setFormData] = useState(initialForm)

  async function fetchVulnerabilities() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from("vulnerabilities").select("*").order("severity", { ascending: false })
    if (!error) setVulnerabilities(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchVulnerabilities()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    // Preparar datos para SQL (asegurar que severity sea número)
    const dataToSave = {
      ...formData,
      severity: Number(formData.severity)
    }

    if (editingVuln) {
      await supabase.from("vulnerabilities").update(dataToSave).eq("id", editingVuln.id)
    } else {
      await supabase.from("vulnerabilities").insert([dataToSave])
    }

    setIsDialogOpen(false)
    setEditingVuln(null)
    setFormData(initialForm)
    fetchVulnerabilities()
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta vulnerabilidad?")) return
    const supabase = createClient()
    await supabase.from("vulnerabilities").delete().eq("id", id)
    fetchVulnerabilities()
  }

  function openEditDialog(vuln: Vulnerability) {
    setEditingVuln(vuln)
    setFormData({
      name: vuln.name,
      description: vuln.description || "",
      category: vuln.category,
      severity: vuln.severity,
    })
    setIsDialogOpen(true)
  }

  const filteredVulnerabilities = vulnerabilities.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function getSeverityBadge(severity: number) {
    const option = SEVERITY_OPTIONS.find(o => Number(o.value) === severity)
    return <Badge className={`${option?.color || "bg-slate-500"} text-white border-none`}>
      {option?.label || severity}
    </Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Catálogo de Vulnerabilidades
            </CardTitle>
            <CardDescription>Gestión según esquema SQL (Nombre, Categoría, Severidad)</CardDescription>
          </div>
          <Button onClick={() => { setEditingVuln(null); setFormData(initialForm); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Nueva Vulnerabilidad
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input 
              placeholder="Buscar por nombre o categoría..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Severidad (1-5)</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-10">Cargando...</TableCell></TableRow>
                ) : filteredVulnerabilities.map((vuln) => (
                  <TableRow key={vuln.id}>
                    <TableCell className="font-medium">{vuln.name}</TableCell>
                    <TableCell><Badge variant="outline">{vuln.category}</Badge></TableCell>
                    <TableCell>{getSeverityBadge(vuln.severity)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(vuln)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(vuln.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
            <DialogHeader><DialogTitle>{editingVuln ? "Editar" : "Nueva"} Vulnerabilidad</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nombre de la Vulnerabilidad *</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Severidad (SQL Integer)</Label>
                  <Select value={String(formData.severity)} onValueChange={v => setFormData({...formData, severity: Number(v)})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SEVERITY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>
            <DialogFooter><Button type="submit" className="w-full">Guardar en Base de Datos</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}