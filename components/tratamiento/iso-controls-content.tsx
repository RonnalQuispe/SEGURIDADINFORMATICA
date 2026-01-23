"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Search, Loader2, ShieldCheck } from "lucide-react"

import type { RiskTreatment, Risk, ISOControl } from "@/lib/types/database"

// Definimos la interfaz basada exactamente en tu SQL
interface TreatmentWithRelations extends RiskTreatment {
  risks: { name: string } | null
  iso_controls: { control_id: string; name: string } | null
}

const STATUS_OPTIONS = [
  { value: "Planificado", label: "Planificado", color: "bg-slate-500", progress: 10 },
  { value: "En Progreso", label: "En Progreso", color: "bg-blue-500", progress: 50 },
  { value: "Implementado", label: "Implementado", color: "bg-green-500", progress: 90 },
  { value: "Verificado", label: "Verificado", color: "bg-emerald-600", progress: 100 },
] as const

export function IsoControlsContent() {
  const [treatments, setTreatments] = useState<TreatmentWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  async function fetchData() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("risk_treatments")
        .select("*, risks(name), iso_controls(control_id, name)")
        .order("created_at", { ascending: false })

      if (error) throw error
      setTreatments((data as any) || [])
    } catch (error) {
      console.error("Error al obtener datos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Filtramos por estrategia o por el nombre del riesgo vinculado
  const filteredTreatments = treatments.filter((t) =>
    (t.strategy ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.risks?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  function getStatusInfo(status: string | null) {
    const option = STATUS_OPTIONS.find((o) => o.value === status)
    return option || { label: status, color: "bg-slate-400", progress: 0 }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por riesgo o estrategia..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Nuevo Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle>Planes de Tratamiento e ISO 27002</CardTitle>
          </div>
          <CardDescription>Gestión de controles aplicados según la estrategia de riesgo definida.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[300px]">Estrategia / Control Propuesto</TableHead>
                    <TableHead>Riesgo Asociado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Avance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTreatments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No se encontraron planes registrados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTreatments.map((t) => {
                      const statusInfo = getStatusInfo(t.status)
                      return (
                        <TableRow key={t.id}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-primary">{t.strategy}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1">{t.proposed_control}</span>
                              {t.iso_controls && (
                                <span className="text-[10px] bg-muted w-fit px-1 rounded">
                                  ISO {t.iso_controls.control_id}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-medium">{t.risks?.name || "-"}</TableCell>
                          <TableCell>
                            <Badge className={`${statusInfo.color} text-white border-none text-[10px]`}>
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={t.priority === "Crítica" ? "destructive" : "outline"} className="text-[10px]">
                              {t.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={statusInfo.progress} className="w-[50px] h-1.5" />
                              <span className="text-[10px] font-mono">{statusInfo.progress}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
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