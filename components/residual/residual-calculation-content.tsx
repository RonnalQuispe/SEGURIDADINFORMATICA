"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Calculator, ArrowRight, Search, Loader2 } from "lucide-react"

// Tipos adaptados al esquema SQL proporcionado
import type { ResidualRisk, Risk, RiskTreatment } from "@/lib/types/database"

type RiskExtended = Risk & { inherent_risk_category?: string }
type TreatmentExtended = RiskTreatment & { proposed_control?: string }

type ResidualRiskWithRelations = ResidualRisk & {
  risks: RiskExtended | null
  risk_treatments: TreatmentExtended | null
  // Propiedades que TS reclama y que están en tu SQL
  residual_risk_category?: string
  is_acceptable?: boolean
  notes?: string
  evaluated_by?: string
}

const RISK_LEVELS = [
  { value: "Crítico", label: "Crítico", color: "bg-red-500" },
  { value: "Alto", label: "Alto", color: "bg-orange-500" },
  { value: "Medio", label: "Medio", color: "bg-yellow-500" },
  { value: "Bajo", label: "Bajo", color: "bg-green-500" },
  { value: "Muy Bajo", label: "Muy Bajo", color: "bg-blue-500" },
]

function calculateCategory(probability: number, impact: number): string {
  const score = probability * impact
  if (score >= 20) return "Crítico"
  if (score >= 15) return "Alto"
  if (score >= 10) return "Medio"
  if (score >= 5) return "Bajo"
  return "Muy Bajo"
}

export function ResidualCalculationContent() {
  const [residualRisks, setResidualRisks] = useState<ResidualRiskWithRelations[]>([])
  const [risks, setRisks] = useState<RiskExtended[]>([])
  const [treatments, setTreatments] = useState<TreatmentExtended[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingResidual, setEditingResidual] = useState<ResidualRiskWithRelations | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    risk_id: "",
    treatment_id: "",
    residual_probability: 2,
    residual_impact: 2,
    residual_risk_category: "Bajo",
    is_acceptable: false,
    notes: "",
    evaluated_by: "",
  })

  async function fetchData() {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const [residualRes, risksRes, treatmentsRes] = await Promise.all([
        supabase.from("residual_risks").select("*, risks(*), risk_treatments(*)").order("created_at", { ascending: false }),
        supabase.from("risks").select("*").order("name"),
        supabase.from("risk_treatments").select("*")
      ])

      setResidualRisks((residualRes.data as unknown as ResidualRiskWithRelations[]) || [])
      setRisks(risksRes.data || [])
      setTreatments(treatmentsRes.data || [])
    } catch (error: any) {
      console.error("Error:", error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    const category = calculateCategory(formData.residual_probability, formData.residual_impact)
    setFormData((prev) => ({ ...prev, residual_risk_category: category }))
  }, [formData.residual_probability, formData.residual_impact])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    const dataToSave = {
      risk_id: formData.risk_id,
      treatment_id: formData.treatment_id,
      residual_probability: formData.residual_probability,
      residual_impact: formData.residual_impact,
      residual_risk_category: formData.residual_risk_category,
      is_acceptable: formData.is_acceptable,
      notes: formData.notes,
      evaluated_by: formData.evaluated_by,
    }

    const { error } = editingResidual 
      ? await supabase.from("residual_risks").update(dataToSave).eq("id", editingResidual.id)
      : await supabase.from("residual_risks").insert([dataToSave])

    if (error) {
      alert(`Error: ${error.message}`)
    } else {
      setIsDialogOpen(false)
      resetForm()
      fetchData()
    }
  }

  function resetForm() {
    setEditingResidual(null)
    setFormData({
      risk_id: "",
      treatment_id: "",
      residual_probability: 2,
      residual_impact: 2,
      residual_risk_category: "Bajo",
      is_acceptable: false,
      notes: "",
      evaluated_by: "",
    })
  }

  function getBadge(value: string | undefined | null) {
    const option = RISK_LEVELS.find((o) => o.value === value)
    return <Badge className={`${option?.color || "bg-gray-400"} text-white`}>{value || "-"}</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" /> Cálculo de Riesgo Residual
            </CardTitle>
          </div>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Nuevo Cálculo
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por riesgo..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Riesgo</TableHead>
                  <TableHead>Original</TableHead>
                  <TableHead></TableHead>
                  <TableHead>Residual</TableHead>
                  <TableHead className="text-center">P x I</TableHead>
                  <TableHead>Aceptable</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {residualRisks.filter(r => r.risks?.name?.toLowerCase().includes(searchTerm.toLowerCase())).map((residual) => (
                  <TableRow key={residual.id}>
                    <TableCell className="font-medium">{residual.risks?.name}</TableCell>
                    <TableCell>{getBadge(residual.risks?.inherent_risk_category)}</TableCell>
                    <TableCell><ArrowRight className="h-4 w-4" /></TableCell>
                    <TableCell>{getBadge(residual.residual_risk_category)}</TableCell>
                    <TableCell className="text-center">{residual.residual_probability} x {residual.residual_impact}</TableCell>
                    <TableCell>
                        <Badge variant={residual.is_acceptable ? "default" : "destructive"}>
                            {residual.is_acceptable ? "Sí" : "No"}
                        </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingResidual(residual);
                          setFormData({
                            risk_id: residual.risk_id,
                            treatment_id: residual.treatment_id,
                            residual_probability: residual.residual_probability,
                            residual_impact: residual.residual_impact,
                            residual_risk_category: residual.residual_risk_category || "Bajo",
                            is_acceptable: !!residual.is_acceptable,
                            notes: residual.notes || "",
                            evaluated_by: residual.evaluated_by || "",
                          });
                          setIsDialogOpen(true);
                        }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={async () => {
                            if(confirm("¿Eliminar?")) {
                                await createClient().from("residual_risks").delete().eq("id", residual.id);
                                fetchData();
                            }
                        }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader><DialogTitle>Cálculo de Riesgo Residual</DialogTitle></DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Riesgo</Label>
                <Select value={formData.risk_id} onValueChange={(v) => setFormData({...formData, risk_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {risks.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tratamiento</Label>
                <Select value={formData.treatment_id} onValueChange={(v) => setFormData({...formData, treatment_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {treatments.map(t => <SelectItem key={t.id} value={t.id}>{t.proposed_control || "Sin nombre"}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg">
              <div className="space-y-2">
                <Label>Probabilidad (1-5)</Label>
                <Input type="number" min={1} max={5} value={formData.residual_probability} onChange={e => setFormData({...formData, residual_probability: parseInt(e.target.value)})}/>
              </div>
              <div className="space-y-2">
                <Label>Impacto (1-5)</Label>
                <Input type="number" min={1} max={5} value={formData.residual_impact} onChange={e => setFormData({...formData, residual_impact: parseInt(e.target.value)})}/>
              </div>
              <div className="space-y-2">
                <Label>Categoría Residual</Label>
                <div className="pt-2">{getBadge(formData.residual_risk_category)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>¿Es Aceptable?</Label>
                    <Select value={formData.is_acceptable ? "true" : "false"} onValueChange={(v) => setFormData({...formData, is_acceptable: v === "true"})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">Sí, aceptado</SelectItem>
                            <SelectItem value="false">No aceptado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Evaluado por</Label>
                    <Input value={formData.evaluated_by} onChange={e => setFormData({...formData, evaluated_by: e.target.value})}/>
                </div>
            </div>

            <div className="space-y-2">
              <Label>Notas / Justificación</Label>
              <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}/>
            </div>

            <DialogFooter>
              <Button type="submit">Guardar Registro</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}