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
import { Plus, Pencil, Trash2, AlertTriangle, Search } from "lucide-react"
import type { Risk, Asset, Threat, Vulnerability } from "@/lib/types/database"

type RiskWithRelations = Risk & {
  assets: Asset | null
  threats: Threat | null
  vulnerabilities: Vulnerability | null
}

const RISK_LEVELS = [
  { value: "critico", label: "Critico", color: "bg-red-500" },
  { value: "alto", label: "Alto", color: "bg-orange-500" },
  { value: "medio", label: "Medio", color: "bg-yellow-500" },
  { value: "bajo", label: "Bajo", color: "bg-green-500" },
]

function calculateRiskLevel(probability: number, impact: number): string {
  const score = probability * impact
  if (score >= 20) return "critico"
  if (score >= 12) return "alto"
  if (score >= 6) return "medio"
  return "bajo"
}

export function RiskMatrixContent() {
  const [risks, setRisks] = useState<RiskWithRelations[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [threats, setThreats] = useState<Threat[]>([])
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    asset_id: "",
    threat_id: "",
    vulnerability_id: "",
    probability: 3,
    impact: 3,
    risk_level: "medio",
  })

  async function fetchData() {
    const supabase = createClient()
    const [risksRes, assetsRes, threatsRes, vulnsRes] = await Promise.all([
      supabase.from("risks").select("*, assets(*), threats(*), vulnerabilities(*)").order("created_at", { ascending: false }),
      supabase.from("assets").select("*").order("name"),
      supabase.from("threats").select("*").order("name"),
      supabase.from("vulnerabilities").select("*").order("name"),
    ])

    setRisks((risksRes.data as RiskWithRelations[]) || [])
    setAssets(assetsRes.data || [])
    setThreats(threatsRes.data || [])
    setVulnerabilities(vulnsRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const level = calculateRiskLevel(formData.probability, formData.impact)
    setFormData((prev) => ({ ...prev, risk_level: level }))
  }, [formData.probability, formData.impact])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    const riskData = {
      name: formData.name,
      description: formData.description,
      asset_id: formData.asset_id || null,
      threat_id: formData.threat_id || null,
      vulnerability_id: formData.vulnerability_id || null,
      probability: formData.probability,
      impact: formData.impact,
      risk_level: formData.risk_level,
    }

    if (editingRisk) {
      await supabase.from("risks").update(riskData).eq("id", editingRisk.id)
    } else {
      await supabase.from("risks").insert(riskData)
    }

    setIsDialogOpen(false)
    setEditingRisk(null)
    resetForm()
    fetchData()
  }

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      asset_id: "",
      threat_id: "",
      vulnerability_id: "",
      probability: 3,
      impact: 3,
      risk_level: "medio",
    })
  }

  async function handleDelete(id: string) {
    if (!confirm("Esta seguro de eliminar este riesgo?")) return
    const supabase = createClient()
    await supabase.from("risks").delete().eq("id", id)
    fetchData()
  }

  function openEditDialog(risk: RiskWithRelations) {
    setEditingRisk(risk)
    setFormData({
      name: risk.name,
      description: risk.description || "",
      asset_id: risk.asset_id || "",
      threat_id: risk.threat_id || "",
      vulnerability_id: risk.vulnerability_id || "",
      probability: risk.probability || 3,
      impact: risk.impact || 3,
      risk_level: risk.risk_level || "medio",
    })
    setIsDialogOpen(true)
  }

  function openNewDialog() {
    setEditingRisk(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const filteredRisks = risks.filter((risk) =>
    risk.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function getRiskLevelBadge(level: string | null) {
    const option = RISK_LEVELS.find((o) => o.value === level)
    if (!option) return <Badge variant="secondary">-</Badge>
    return <Badge className={`${option.color} text-white`}>{option.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Matriz de Riesgos</CardTitle>
            <CardDescription>
              Identifica y evalua los riesgos asociando activos, amenazas y vulnerabilidades
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Riesgo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingRisk ? "Editar Riesgo" : "Nuevo Riesgo"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingRisk
                      ? "Modifica los datos del riesgo"
                      : "Identifica un nuevo riesgo en la matriz"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Riesgo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Descripcion breve del riesgo"
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Activo Afectado</Label>
                      <Select
                        value={formData.asset_id}
                        onValueChange={(value) => setFormData({ ...formData, asset_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {assets.map((asset) => (
                            <SelectItem key={asset.id} value={asset.id}>
                              {asset.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Amenaza</Label>
                      <Select
                        value={formData.threat_id}
                        onValueChange={(value) => setFormData({ ...formData, threat_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {threats.map((threat) => (
                            <SelectItem key={threat.id} value={threat.id}>
                              {threat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Vulnerabilidad</Label>
                      <Select
                        value={formData.vulnerability_id}
                        onValueChange={(value) => setFormData({ ...formData, vulnerability_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {vulnerabilities.map((vuln) => (
                            <SelectItem key={vuln.id} value={vuln.id}>
                              {vuln.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Probabilidad (1-5)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={formData.probability}
                        onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Impacto (1-5)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={formData.impact}
                        onChange={(e) => setFormData({ ...formData, impact: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nivel de Riesgo</Label>
                      <div className="h-10 flex items-center">
                        {getRiskLevelBadge(formData.risk_level)}
                        <span className="ml-2 text-sm text-muted-foreground">
                          (Score: {formData.probability * formData.impact})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripcion</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripcion detallada del riesgo..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingRisk ? "Guardar Cambios" : "Crear Riesgo"}
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
                placeholder="Buscar riesgos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse text-muted-foreground">Cargando riesgos...</div>
            </div>
          ) : filteredRisks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
              <p>No hay riesgos identificados</p>
              <p className="text-sm">Crea el primer riesgo para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Riesgo</TableHead>
                    <TableHead>Activo</TableHead>
                    <TableHead>Amenaza</TableHead>
                    <TableHead>Vulnerabilidad</TableHead>
                    <TableHead className="text-center">P x I</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead className="w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRisks.map((risk) => (
                    <TableRow key={risk.id}>
                      <TableCell className="font-medium max-w-xs truncate">{risk.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {risk.assets?.name || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {risk.threats?.name || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {risk.vulnerabilities?.name || "-"}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {risk.probability} x {risk.impact} = {(risk.probability || 0) * (risk.impact || 0)}
                      </TableCell>
                      <TableCell>{getRiskLevelBadge(risk.risk_level)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(risk)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(risk.id)}>
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
