"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Clock, XCircle, PlayCircle, Target } from "lucide-react"
// ✅ CORRECCIÓN 1: ISOControl con mayúsculas
import type { RiskTreatment, Risk, ISOControl } from "@/lib/types/database"

// ✅ CORRECCIÓN 2: Tipado extendido para asegurar que las propiedades existan
type TreatmentWithRelations = RiskTreatment & {
  risks: Risk | null
  iso_controls: ISOControl | null
  // Si RiskTreatment no incluye estas explícitamente en el tipo generado:
  name?: string
  progress?: number
  responsible?: string
  due_date?: string
}

// ✅ CORRECCIÓN 3: Configuración de estados alineada a los valores Reales de tu DB
// (Ajustado según los errores de la imagen: Planificado, En Progreso, Implementado, Verificado)
const STATUS_CONFIG = {
  "Planificado": { label: "Planificado", color: "bg-slate-500", icon: Clock },
  "En Progreso": { label: "En Progreso", color: "bg-blue-500", icon: PlayCircle },
  "Implementado": { label: "Implementado", color: "bg-green-500", icon: CheckCircle2 },
  "Verificado": { label: "Verificado", color: "bg-emerald-600", icon: Target },
} as const;

export function ImplementationContent() {
  const [treatments, setTreatments] = useState<TreatmentWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data } = await supabase
        .from("risk_treatments")
        .select("*, risks(*), iso_controls(*)")
        .order("status", { ascending: true })

      setTreatments((data as unknown as TreatmentWithRelations[]) || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  // ✅ CORRECCIÓN 4: Agrupación usando los nombres de estado correctos
  const groupedByStatus = {
    "Planificado": treatments.filter(t => t.status === "Planificado"),
    "En Progreso": treatments.filter(t => t.status === "En Progreso"),
    "Implementado": treatments.filter(t => t.status === "Implementado"),
    "Verificado": treatments.filter(t => t.status === "Verificado"),
  }

  const overallProgress = treatments.length > 0
    ? Math.round(treatments.reduce((sum, t) => sum + (Number(t.progress) || 0), 0) / treatments.length)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Cargando estado de implementación...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Progreso General de Implementación
          </CardTitle>
          <CardDescription>
            Estado consolidado de todos los planes de tratamiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Progreso total</span>
              <span className="text-2xl font-bold">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            
            <div className="grid gap-4 md:grid-cols-4 mt-6">
              {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                const count = groupedByStatus[status as keyof typeof groupedByStatus]?.length || 0
                const Icon = config.icon
                return (
                  <div key={status} className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm text-muted-foreground">{config.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const items = groupedByStatus[status as keyof typeof groupedByStatus] || []
          const Icon = config.icon
          
          return (
            <Card key={status}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${status === "Implementado" || status === "Verificado" ? "text-green-500" : status === "En Progreso" ? "text-blue-500" : "text-slate-500"}`} />
                    {config.label}
                  </span>
                  <Badge variant="secondary">{items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Sin elementos</p>
                ) : (
                  items.map((treatment) => (
                    <div key={treatment.id} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <p className="font-medium text-sm truncate">{treatment.name}</p>
                      {treatment.risks && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          Riesgo: {treatment.risks.name}
                        </p>
                      )}
                      {treatment.iso_controls && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {treatment.iso_controls.control_id}
                        </Badge>
                      )}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progreso</span>
                          <span>{treatment.progress || 0}%</span>
                        </div>
                        <Progress value={treatment.progress || 0} className="h-1" />
                      </div>
                      {treatment.responsible && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Responsable: {treatment.responsible}
                        </p>
                      )}
                      {treatment.due_date && (
                        <p className="text-xs text-muted-foreground">
                          Vence: {new Date(treatment.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}