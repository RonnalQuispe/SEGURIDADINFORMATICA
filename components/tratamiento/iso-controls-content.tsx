"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Pencil, Trash2, ClipboardList, Search, Loader2 } from "lucide-react"

import type { RiskTreatment, Risk, ISOControl } from "@/lib/types/database"

type TreatmentWithRelations = RiskTreatment & {
  name: string
  description?: string | null
  treatment_option: string
  due_date?: string | null
  progress: number
  status: "Planificado" | "En Progreso" | "Implementado" | "Verificado"
  risks?: Risk | null
  iso_controls?: ISOControl | null
}

const STATUS_OPTIONS = [
  { value: "Planificado", label: "Planificado", color: "bg-slate-500" },
  { value: "En Progreso", label: "En Progreso", color: "bg-blue-500" },
  { value: "Implementado", label: "Implementado", color: "bg-green-500" },
  { value: "Verificado", label: "Verificado", color: "bg-emerald-600" },
] as const

// ✅ NOMBRE CORREGIDO: Ahora coincide con lo que la página intenta importar
export function IsoControlsContent() {
  const [treatments, setTreatments] = useState<TreatmentWithRelations[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [isoControls, setIsoControls] = useState<ISOControl[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState<TreatmentWithRelations | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    risk_id: "",
    iso_control_id: "",
    treatment_option: "mitigar",
    responsible: "",
    due_date: "",
    status: "Planificado" as TreatmentWithRelations["status"], 
    progress: 0,
  })

  async function fetchData() {
    try {
      const supabase = createClient()
      const [treatmentsRes, risksRes, controlsRes] = await Promise.all([
        supabase.from("risk_treatments").select("*, risks(*), iso_controls(*)").order("created_at", { ascending: false }),
        supabase.from("risks").select("*").order("name"),
        supabase.from("iso_controls").select("*").order("control_id"),
      ])

      setTreatments((treatmentsRes.data as unknown as TreatmentWithRelations[]) || [])
      setRisks(risksRes.data || [])
      setIsoControls(controlsRes.data || [])
    } catch (error) {
      console.error("Error al obtener datos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filteredTreatments = treatments.filter((t) =>
    (t.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  function getStatusBadge(status: string | null) {
    const option = STATUS_OPTIONS.find((o) => o.value === status)
    return option ? (
      <Badge className={`${option.color} text-white`}>{option.label}</Badge>
    ) : (
      <Badge variant="secondary">-</Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar plan de tratamiento..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => { setEditingTreatment(null); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Nuevo Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planes de Tratamiento e ISO 27002</CardTitle>
          <CardDescription>Gestión de controles aplicados a riesgos identificados.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan / Control</TableHead>
                    <TableHead>Riesgo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Progreso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTreatments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        No se encontraron planes.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTreatments.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{t.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {t.iso_controls?.control_id} - {t.iso_controls?.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{t.risks?.name || "-"}</TableCell>
                        <TableCell>{getStatusBadge(t.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={t.progress} className="w-[60px] h-2" />
                            <span className="text-xs">{t.progress}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}