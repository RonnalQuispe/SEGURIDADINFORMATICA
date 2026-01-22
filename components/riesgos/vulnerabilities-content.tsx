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
import { Plus, Pencil, Trash2, Database, Search } from "lucide-react"
import type { Vulnerability } from "@/lib/types/database"

const SEVERITY_OPTIONS = [
  { value: "critica", label: "Crítica", color: "bg-red-500" },
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

  // Estado inicial del formulario
  const initialForm = {
    name: "",
    description: "",
    severity: "media",
    // Asegúrate de que estos nombres existan en tu tabla 'vulnerabilities'
    cve_id: "", 
    affected_component: "",
  }

  const [formData, setFormData] = useState(initialForm)

  async function fetchVulnerabilities() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from("vulnerabilities").select("*").order("name")
    if (!error) setVulnerabilities(data || [])
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
      await supabase.from("vulnerabilities").insert([formData])
    }

    setIsDialogOpen(false)
    setEditingVuln(null)
    setFormData(initialForm)
    fetchVulnerabilities()
  }

  async function handleDelete(id: string | number) {
    if (!confirm("¿Está seguro de eliminar esta vulnerabilidad?")) return
    const supabase = createClient()
    // Convertimos a String para evitar el error de 'string | number'
    await supabase.from("vulnerabilities").delete().eq("id", String(id))
    fetchVulnerabilities()
  }

  function openEditDialog(vuln: any) { // Usamos any temporalmente si el tipo de la DB es inconsistente
    setEditingVuln(vuln)
    setFormData({
      name: vuln.name || "",
      description: vuln.description || "",
      severity: vuln.severity || "media",
      cve_id: vuln.cve_id || "",
      affected_component: vuln.affected_component || "",
    })
    setIsDialogOpen(true)
  }

  const filteredVulnerabilities = vulnerabilities.filter(
    (vuln: any) =>
      (vuln.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (vuln.cve_id?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  )

  function getSeverityBadge(severity: string | null) {
    const option = SEVERITY_OPTIONS.find((o) => o.value === severity)
    if (!option) return <Badge variant="secondary">-</Badge>
    return <Badge className={`${option.color} text-white border-none`}>{option.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Catálogo de Vulnerabilidades</CardTitle>
            <CardDescription>Registro de debilidades de seguridad.</CardDescription>
          </div>
          <Button onClick={() => { setEditingVuln(null); setFormData(initialForm); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Vulnerabilidad
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o CVE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="text-center py-10">Cargando...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Severidad</TableHead>
                    <TableHead>CVE</TableHead>
                    <TableHead>Componente</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVulnerabilities.map((vuln: any) => (
                    <TableRow key={vuln.id}>
                      <TableCell className="font-medium">{vuln.name}</TableCell>
                      <TableCell>{getSeverityBadge(vuln.severity)}</TableCell>
                      <TableCell className="font-mono text-xs">{vuln.cve_id || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{vuln.affected_component || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingVuln ? "Editar" : "Nueva"} Vulnerabilidad</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Severidad</Label>
                  <Select value={formData.severity} onValueChange={(v) => setFormData({ ...formData, severity: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SEVERITY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cve_id">CVE ID</Label>
                  <Input
                    id="cve_id"
                    value={formData.cve_id}
                    onChange={(e) => setFormData({ ...formData, cve_id: e.target.value })}
                    placeholder="CVE-202X-..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="affected_component">Componente Afectado</Label>
                <Input
                  id="affected_component"
                  value={formData.affected_component}
                  onChange={(e) => setFormData({ ...formData, affected_component: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}