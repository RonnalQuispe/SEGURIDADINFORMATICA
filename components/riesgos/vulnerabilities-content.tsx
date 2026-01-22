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
import { Plus, Pencil, Trash2, Database, Search } from "lucide-react"
import type { Vulnerability } from "@/lib/types/database"

const SEVERITY_OPTIONS = [
  { value: "critica", label: "Critica", color: "bg-red-500" },
  { value: "alta", label: "Alta", color: "bg-orange-500" },
  { value: "media", label: "Media", color: "bg-yellow-500" },
  { value: "baja", label: "Baja", color: "bg-green-500" },
]

export function VulnerabilitiesContent() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVuln, setEditingVuln] = useState<Vulnerability | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    severity: "media",
    cve_id: "",
    affected_component: "",
  })

  async function fetchVulnerabilities() {
    const supabase = createClient()
    const { data } = await supabase.from("vulnerabilities").select("*").order("name")
    setVulnerabilities(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchVulnerabilities()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    if (editingVuln) {
      await supabase.from("vulnerabilities").update(formData).eq("id", editingVuln.id)
    } else {
      await supabase.from("vulnerabilities").insert(formData)
    }

    setIsDialogOpen(false)
    setEditingVuln(null)
    resetForm()
    fetchVulnerabilities()
  }

  function resetForm() {
    setFormData({ name: "", description: "", severity: "media", cve_id: "", affected_component: "" })
  }

  async function handleDelete(id: string) {
    if (!confirm("Esta seguro de eliminar esta vulnerabilidad?")) return
    const supabase = createClient()
    await supabase.from("vulnerabilities").delete().eq("id", id)
    fetchVulnerabilities()
  }

  function openEditDialog(vuln: Vulnerability) {
    setEditingVuln(vuln)
    setFormData({
      name: vuln.name,
      description: vuln.description || "",
      severity: vuln.severity || "media",
      cve_id: vuln.cve_id || "",
      affected_component: vuln.affected_component || "",
    })
    setIsDialogOpen(true)
  }

  function openNewDialog() {
    setEditingVuln(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const filteredVulnerabilities = vulnerabilities.filter(
    (vuln) =>
      vuln.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.cve_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function getSeverityBadge(severity: string | null) {
    const option = SEVERITY_OPTIONS.find((o) => o.value === severity)
    if (!option) return <Badge variant="secondary">-</Badge>
    return <Badge className={`${option.color} text-white`}>{option.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Catalogo de Vulnerabilidades</CardTitle>
            <CardDescription>
              Identifica y registra las vulnerabilidades que pueden ser explotadas
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Vulnerabilidad
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingVuln ? "Editar Vulnerabilidad" : "Nueva Vulnerabilidad"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingVuln
                      ? "Modifica los datos de la vulnerabilidad"
                      : "Agrega una nueva vulnerabilidad al catalogo"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nombre de la vulnerabilidad"
                      required
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="severity">Severidad</Label>
                      <Select
                        value={formData.severity}
                        onValueChange={(value) => setFormData({ ...formData, severity: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SEVERITY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cve_id">CVE ID</Label>
                      <Input
                        id="cve_id"
                        value={formData.cve_id}
                        onChange={(e) => setFormData({ ...formData, cve_id: e.target.value })}
                        placeholder="CVE-XXXX-XXXXX"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="affected_component">Componente Afectado</Label>
                    <Input
                      id="affected_component"
                      value={formData.affected_component}
                      onChange={(e) => setFormData({ ...formData, affected_component: e.target.value })}
                      placeholder="Sistema o componente afectado"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripcion</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripcion de la vulnerabilidad..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingVuln ? "Guardar Cambios" : "Crear Vulnerabilidad"}
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
                placeholder="Buscar por nombre o CVE..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse text-muted-foreground">Cargando vulnerabilidades...</div>
            </div>
          ) : filteredVulnerabilities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Database className="h-8 w-8 mb-2 opacity-50" />
              <p>No hay vulnerabilidades registradas</p>
              <p className="text-sm">Crea la primera vulnerabilidad para comenzar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Severidad</TableHead>
                  <TableHead>CVE</TableHead>
                  <TableHead>Componente</TableHead>
                  <TableHead className="w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVulnerabilities.map((vuln) => (
                  <TableRow key={vuln.id}>
                    <TableCell className="font-medium">{vuln.name}</TableCell>
                    <TableCell>{getSeverityBadge(vuln.severity)}</TableCell>
                    <TableCell className="font-mono text-sm">{vuln.cve_id || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {vuln.affected_component || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(vuln)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(vuln.id)}>
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
