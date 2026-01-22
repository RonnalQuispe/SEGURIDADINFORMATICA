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
import { Plus, Pencil, Trash2, Calculator, ArrowRight, Search } from "lucide-react"
import type { ResidualRisk, Risk, RiskTreatment } from "@/lib/types/database"

type ResidualRiskWithRelations = ResidualRisk & {
  risks: Risk | null
  risk_treatments: RiskTreatment | null
}

const RISK_LEVELS = [
  { value: "critico", label: "Critico", color: "bg-red-500" },
  { value: "alto", label: "Alto", color: "bg-orange-500" },
  { value: "medio", label: "Medio", color: "bg-yellow-500" },
  { value: "bajo", label: "Bajo", color: "bg-green-500" },
]

const ACCEPTANCE_OPTIONS = [
  { value: "aceptado", label: "Aceptado", color: "bg-green-500" },
  { value: "no_aceptado", label: "No Aceptado", color: "bg-red-500" },
  { value: "requiere_revision", label: "Requiere Revision", color: "bg-yellow-500" },
]

function calculateResidualLevel(probability: number, impact: number): string {
  const score = probability * impact
  if (score >= 20) return "critico"
  if (score >= 12) return "alto"
  if (score >= 6) return "medio"
  return "bajo"
}

export function ResidualCalculationContent() {
  const [residualRisks, setResidualRisks] = useState<ResidualRiskWithRelations[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [treatments, setTreatments] = useState<RiskTreatment[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingResidual, setEditingResidual] = useState<ResidualRisk | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    risk_id: "",
    treatment_id: "",
    residual_probability: 2,
    residual_impact: 2,
    residual_level: "bajo",
    acceptance_status: "requiere_revision",
    justification: "",
    accepted_by: "",
  })

  async function fetchData() {
    const supabase = createClient()
    const [residualRes, risksRes, treatmentsRes] = await Promise.all([
      supabase.from("residual_risks").select("*, risks(*), risk_treatments(*)").order("created_at", { ascending: false }),
      supabase.from("risks").select("*").order("name"),
      supabase.from("risk_treatments").select("*").order("name"),
    ])

    setResidualRisks((residualRes.data as ResidualRiskWithRelations[]) || [])
    setRisks(risksRes.data || [])
    setTreatments(treatmentsRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const level = calculateResidualLevel(formData.residual_probability, formData.residual_impact)
    setFormData((prev) => ({ ...prev, residual_level: level }))
  }, [formData.residual_probability, formData.residual_impact])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    const residualData = {
      risk_id: formData.risk_id || null,
      treatment_id: formData.treatment_id || null,
      residual_probability: formData.residual_probability,
      residual_impact: formData.residual_impact,
      residual_level: formData.residual_level,
      acceptance_status: formData.acceptance_status,
      justification: formData.justification,
      accepted_by: formData.accepted_by,
    }

    if (editingResidual) {
      await supabase.from("residual_risks").update(residualData).eq("id", editingResidual.id)
    } else {
      await supabase.from("residual_risks").insert(residualData)
    }

    setIsDialogOpen(false)
    setEditingResidual(null)
    resetForm()
    fetchData()
  }

  function resetForm() {
    setFormData({
      risk_id: "",
      treatment_id: "",
      residual_probability: 2,
      residual_impact: 2,
      residual_level: "bajo",
      acceptance_status: "requiere_revision",
      justification: "",
      accepted_by: "",
    })
  }

  async function handleDelete(id: string) {
    if (!confirm("Esta seguro de eliminar este riesgo residual?")) return
    const supabase = createClient()
    await supabase.from("residual_risks").delete().eq("id", id)
    fetchData()
  }

  function openEditDialog(residual: ResidualRiskWithRelations) {
    setEditingResidual(residual)
    setFormData({
      risk_id: residual.risk_id || "",
      treatment_id: residual.treatment_id || "",
      residual_probability: residual.residual_probability || 2,
      residual_impact: residual.residual_impact || 2,
      residual_level: residual.residual_level || "bajo",
      acceptance_status: residual.acceptance_status || "requiere_revision",
      justification: residual.justification || "",
      accepted_by: residual.accepted_by || "",
    })
    setIsDialogOpen(true)
  }

  function openNewDialog() {
    setEditingResidual(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const filteredResidual = residualRisks.filter((r) =>
    r.risks?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function getRiskLevelBadge(level: string | null) {
    const option = RISK_LEVELS.find((o) => o.value === level)
    if (!option) return <Badge variant="secondary">-</Badge>
    return <Badge className={`${option.color} text-white`}>{option.label}</Badge>
  }

  function getAcceptanceBadge(status: string | null) {
    const option = ACCEPTANCE_OPTIONS.find((o) => o.value === status)
    if (!option) return <Badge variant="secondary">-</Badge>
    return <Badge className={`${option.color} text-white`}>{option.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculo de Riesgo Residual
            </CardTitle>
            <CardDescription>
              Evalua el riesgo que permanece despues de aplicar los controles
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Calculo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingResidual ? "Editar Riesgo Residual" : "Nuevo Calculo de Riesgo Residual"}
                  </DialogTitle>
                  <DialogDescription>
                    Calcula el riesgo que permanece despues del tratamiento
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Riesgo Original</Label>
                      <Select
                        value={formData.risk_id}
                        onValueChange={(value) => setFormData({ ...formData, risk_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar riesgo..." />
                        </SelectTrigger>
                        <SelectContent>
                          {risks.map((risk) => (
                            <SelectItem key={risk.id} value={risk.id}>
                              {risk.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tratamiento Aplicado</Label>
                      <Select
                        value={formData.treatment_id}
                        onValueChange={(value) => setFormData({ ...formData, treatment_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tratamiento..." />
                        </SelectTrigger>
                        <SelectContent>
                          {treatments.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Probabilidad Residual (1-5)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={formData.residual_probability}
                        onChange={(e) => setFormData({ ...formData, residual_probability: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Impacto Residual (1-5)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={formData.residual_impact}
                        onChange={(e) => setFormData({ ...formData, residual_impact: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nivel Residual</Label>
                      <div className="h-10 flex items-center">
                        {getRiskLevelBadge(formData.residual_level)}
                        <span className="ml-2 text-sm text-muted-foreground">
                          (Score: {formData.residual_probability * formData.residual_impact})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Estado de Aceptacion</Label>
                      <Select
                        value={formData.acceptance_status}
                        onValueChange={(value) => setFormData({ ...formData, acceptance_status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACCEPTANCE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Aceptado Por</Label>
                      <Input
                        value={formData.accepted_by}
                        onChange={(e) => setFormData({ ...formData, accepted_by: e.target.value })}
                        placeholder="Nombre del responsable"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Justificacion</Label>
                    <Textarea
                      value={formData.justification}
                      onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                      placeholder="Justificacion de la decision de aceptacion..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingResidual ? "Guardar Cambios" : "Calcular Residual"}
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
                placeholder="Buscar por riesgo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse text-muted-foreground">Cargando calculos...</div>
            </div>
          ) : filteredResidual.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Calculator className="h-8 w-8 mb-2 opacity-50" />
              <p>No hay calculos de riesgo residual</p>
              <p className="text-sm">Realiza el primer calculo</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Riesgo</TableHead>
                    <TableHead>Original</TableHead>
                    <TableHead></TableHead>
                    <TableHead>Residual</TableHead>
                    <TableHead className="text-center">P x I</TableHead>
                    <TableHead>Aceptacion</TableHead>
                    <TableHead className="w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResidual.map((residual) => (
                    <TableRow key={residual.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {residual.risks?.name || "-"}
                      </TableCell>
                      <TableCell>
                        {getRiskLevelBadge(residual.risks?.risk_level || null)}
                      </TableCell>
                      <TableCell>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell>
                        {getRiskLevelBadge(residual.residual_level)}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {residual.residual_probability} x {residual.residual_impact} = {(residual.residual_probability || 0) * (residual.residual_impact || 0)}
                      </TableCell>
                      <TableCell>{getAcceptanceBadge(residual.acceptance_status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(residual)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(residual.id)}>
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
