"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Pencil, Trash2, ClipboardList, Search } from "lucide-react"

// ✅ ISOControl en mayúsculas según tu base de datos
import type { RiskTreatment, Risk, ISOControl } from "@/lib/types/database"

// ✅ Interfaz robusta con campos opcionales para evitar errores de undefined
type TreatmentWithRelations = RiskTreatment & {
  risks: Risk | null
  iso_controls: ISOControl | null
  name?: string 
  progress?: number | null
  status?: string | null
  due_date?: string | null
  responsible?: string | null
  treatment_option?: string | null
  description?: string | null
}

const STATUS_OPTIONS = [
  { value: "Planificado", label: "Planificado", color: "bg-slate-500" },
  { value: "En Progreso", label: "En Progreso", color: "bg-blue-500" },
  { value: "Implementado", label: "Implementado", color: "bg-green-500" },
  { value: "Verificado", label: "Verificado", color: "bg-emerald-600" },
]

export function TreatmentPlanContent() {
  const [treatments, setTreatments] = useState<TreatmentWithRelations[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [isoControls, setIsoControls] = useState<ISOControl[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState<RiskTreatment | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    risk_id: "",
    iso_control_id: "",
    treatment_option: "mitigar",
    responsible: "",
    due_date: "",
    status: "Planificado",
    progress: 0,
  })

  async function fetchData() {
    const supabase = createClient()
    const [treatmentsRes, risksRes, controlsRes] = await Promise.all([
      supabase.from("risk_treatments").select("*, risks(*), iso_controls(*)").order("created_at", { ascending: false }),
      supabase.from("risks").select("*").order("name"),
      supabase.from("iso_controls").select("*").order("control_id"),
    ])

    setTreatments((treatmentsRes.data as unknown as TreatmentWithRelations[]) || [])
    setRisks(risksRes.data || [])
    setIsoControls(controlsRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ... (handleSubmit, resetForm, handleDelete se mantienen igual)

  function openEditDialog(treatment: TreatmentWithRelations) {
    setEditingTreatment(treatment)
    setFormData({
      name: treatment.name || "",
      description: treatment.description || "",
      risk_id: (treatment as any).risk_id || "",
      iso_control_id: (treatment as any).iso_control_id || "",
      treatment_option: treatment.treatment_option || "mitigar",
      responsible: treatment.responsible || "",
      due_date: treatment.due_date || "",
      status: treatment.status || "Planificado",
      progress: treatment.progress || 0,
    })
    setIsDialogOpen(true)
  }

  // ✅ CORRECCIÓN CRÍTICA: Filtro seguro contra valores undefined o null
  const filteredTreatments = treatments.filter((t) => {
    const name = t.name?.toLowerCase() || ""; // Si name es undefined, usa string vacío
    const search = searchTerm.toLowerCase();
    return name.includes(search);
  });

  function getStatusBadge(status: string | null | undefined) {
    const option = STATUS_OPTIONS.find((o) => o.value === status)
    if (!option) return <Badge variant="secondary">-</Badge>
    return <Badge className={`${option.color} text-white`}>{option.label}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Resumen de estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{treatments.length}</div></CardContent>
        </Card>
        {/* ... demás cards ... */}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Plan de Tratamiento de Riesgos</CardTitle>
          <Button onClick={() => { setEditingTreatment(null); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Nuevo Plan
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar planes..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Riesgo</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTreatments.map((treatment) => (
                <TableRow key={treatment.id}>
                  <TableCell className="font-medium">{treatment.name || "Sin nombre"}</TableCell>
                  <TableCell>{treatment.risks?.name || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={treatment.progress || 0} className="w-12" />
                      <span>{treatment.progress || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(treatment.status)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(treatment)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}