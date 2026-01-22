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
import { Plus, Pencil, Trash2, AlertTriangle, Search } from "lucide-react"

// Tipos basados estrictamente en tu SQL
import type { Risk, Asset, Threat, Vulnerability } from "@/lib/types/database"

type RiskWithRelations = Risk & {
  assets: Asset | null
  threats: Threat | null
  vulnerabilities: Vulnerability | null
}

const RISK_LEVELS = [
  { value: "Crítico", label: "Crítico", color: "bg-red-600" },
  { value: "Alto", label: "Alto", color: "bg-orange-500" },
  { value: "Medio", label: "Medio", color: "bg-yellow-500" },
  { value: "Bajo", label: "Bajo", color: "bg-green-500" },
  { value: "Muy Bajo", label: "Muy Bajo", color: "bg-blue-500" },
]

// Función alineada con los CASE del SQL
function calculateRiskCategory(probability: number, impact: number): string {
  const score = probability * impact
  if (score >= 20) return "Crítico"
  if (score >= 15) return "Alto"
  if (score >= 10) return "Medio"
  if (score >= 5) return "Bajo"
  return "Muy Bajo"
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
  })

  async function fetchData() {
    const supabase = createClient()
    const [risksRes, assetsRes, threatsRes, vulnsRes] = await Promise.all([
      supabase.from("risks").select("*, assets(*), threats(*), vulnerabilities(*)").order("created_at", { ascending: false }),
      supabase.from("assets").select("*").order("name"),
      supabase.from("threats").select("*").order("name"),
      supabase.from("vulnerabilities").select("*").order("name"),
    ])

    setRisks((risksRes.data as unknown as RiskWithRelations[]) || [])
    setAssets(assetsRes.data || [])
    setThreats(threatsRes.data || [])
    setVulnerabilities(vulnsRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    const riskData = {
      name: formData.name,
      description: formData.description,
      asset_id: formData.asset_id,
      threat_id: formData.threat_id,
      vulnerability_id: formData.vulnerability_id,
      probability: formData.probability,
      impact: formData.impact,
      // inherent_risk_level y category son GENERATED en SQL, no se envían
    }

    if (editingRisk) {
      await supabase.from("risks").update(riskData).eq("id", editingRisk.id)
    } else {
      await supabase.from("risks").insert([riskData])
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
    })
  }

  async function handleDelete(id: string | number) {
    if (!confirm("¿Está seguro de eliminar este riesgo?")) return
    const supabase = createClient()
    await supabase.from("risks").delete().eq("id", String(id))
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
      probability: risk.probability,
      impact: risk.impact,
    })
    setIsDialogOpen(true)
  }

  const filteredRisks = risks.filter((risk) =>
    risk.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function getRiskLevelBadge(category: string | undefined) {
    const option = RISK_LEVELS.find((o) => o.value === category)
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
              Gestión de riesgos basada en Probabilidad x Impacto
            </CardDescription>
          </div>
          <Button onClick={() => { resetForm(); setEditingRisk(null); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Nuevo Riesgo
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar riesgos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Riesgo</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="text-center">P x I</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Cargando...</TableCell></TableRow>
              ) : filteredRisks.map((risk) => (
                <TableRow key={risk.id}>
                  <TableCell className="font-medium">{risk.name}</TableCell>
                  <TableCell>{risk.assets?.name || "-"}</TableCell>
                  <TableCell className="text-center">
                    {risk.probability} x {risk.impact} = {Number(risk.probability) * Number(risk.impact)}
                  </TableCell>
                  <TableCell>
                    {/* Nota: Usamos la propiedad generada por la DB */}
                    {getRiskLevelBadge((risk as any).inherent_risk_category)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
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
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingRisk ? "Editar Riesgo" : "Nuevo Riesgo"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Activo</Label>
                  <Select value={formData.asset_id} onValueChange={v => setFormData({...formData, asset_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Activo" /></SelectTrigger>
                    <SelectContent>
                      {assets.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {/* Repetir estructura para Amenaza y Vulnerabilidad... */}
              </div>
              <div className="grid grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label>Probabilidad (1-5)</Label>
                  <Input type="number" min={1} max={5} value={formData.probability} onChange={e => setFormData({...formData, probability: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Impacto (1-5)</Label>
                  <Input type="number" min={1} max={5} value={formData.impact} onChange={e => setFormData({...formData, impact: parseInt(e.target.value)})} />
                </div>
                <div className="pb-2">
                   {getRiskLevelBadge(calculateRiskCategory(formData.probability, formData.impact))}
                </div>
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