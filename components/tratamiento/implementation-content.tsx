"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Clock, PlayCircle, Target, Loader2, AlertCircle } from "lucide-react"

import type { RiskTreatment, Risk, ISOControl } from "@/lib/types/database"

// Adaptamos el tipo a las columnas reales de tu SQL: strategy, proposed_control, responsible, implementation_date
interface TreatmentWithRelations extends RiskTreatment {
  risks: { name: string } | null
  iso_controls: { control_id: string; name: string } | null
}

const STATUS_CONFIG = {
  "Planificado": { label: "Planificado", color: "bg-slate-500", icon: Clock, estimatedProgress: 10 },
  "En Progreso": { label: "En Progreso", color: "bg-blue-500", icon: PlayCircle, estimatedProgress: 50 },
  "Implementado": { label: "Implementado", color: "bg-green-500", icon: CheckCircle2, estimatedProgress: 90 },
  "Verificado": { label: "Verificado", color: "bg-emerald-600", icon: Target, estimatedProgress: 100 },
} as const;

export function ImplementationContent() {
  const [treatments, setTreatments] = useState<TreatmentWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("risk_treatments")
      .select("*, risks(name), iso_controls(control_id, name)")
      .order("priority", { ascending: false })

    if (!error) setTreatments((data as any) || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // Agrupación por estado real de tu DB
  const groupedByStatus = {
    "Planificado": treatments.filter(t => t.status === "Planificado"),
    "En Progreso": treatments.filter(t => t.status === "En Progreso"),
    "Implementado": treatments.filter(t => t.status === "Implementado"),
    "Verificado": treatments.filter(t => t.status === "Verificado"),
  }

  // Cálculo de progreso basado en el peso del estado
  const overallProgress = treatments.length > 0
    ? Math.round(
        treatments.reduce((sum, t) => {
          const statusKey = t.status as keyof typeof STATUS_CONFIG;
          return sum + (STATUS_CONFIG[statusKey]?.estimatedProgress || 0);
        }, 0) / treatments.length
      )
    : 0

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Sincronizando con Plan de Tratamiento...</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Resumen Ejecutivo */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Estado Global de Mitigación
          </CardTitle>
          <CardDescription>Basado en {treatments.length} estrategias definidas en el plan de riesgos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Cumplimiento del Plan</span>
            <span className="text-3xl font-bold">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <div key={key} className="p-3 rounded-xl border bg-muted/30">
                <p className="text-xs text-muted-foreground font-semibold uppercase">{config.label}</p>
                <p className="text-2xl font-bold">{groupedByStatus[key as keyof typeof groupedByStatus].length}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Kanban de Implementación */}
      <div className="grid gap-6 lg:grid-cols-4">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const items = groupedByStatus[status as keyof typeof groupedByStatus]
          const Icon = config.icon
          
          return (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <Badge className={`${config.color} text-white border-none`}>{config.label}</Badge>
                <span className="text-xs font-mono text-muted-foreground">{items.length}</span>
              </div>

              <div className="flex flex-col gap-3">
                {items.length === 0 ? (
                  <div className="border-2 border-dashed rounded-xl p-8 text-center text-muted-foreground text-xs">
                    Sin tareas
                  </div>
                ) : (
                  items.map((t) => (
                    <Card key={t.id} className="shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-bold text-sm leading-tight text-primary">{t.strategy}</p>
                          <Badge variant={t.priority === 'Crítica' ? 'destructive' : 'outline'} className="text-[9px] px-1 h-4">
                            {t.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-xs font-medium text-foreground/80 line-clamp-2">
                          {t.proposed_control}
                        </p>

                        <div className="pt-2 border-t space-y-2">
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <AlertCircle className="h-3 w-3" />
                            <span className="truncate">Riesgo: {t.risks?.name}</span>
                          </div>
                          
                          {t.iso_controls && (
                            <div className="bg-muted p-1.5 rounded text-[10px] font-mono">
                              Ref: {t.iso_controls.control_id}
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center pt-1 text-[10px]">
                            <span className="text-muted-foreground">Resp: {t.responsible}</span>
                            <span className="font-semibold italic">
                              {t.implementation_date ? new Date(t.implementation_date).toLocaleDateString() : 'S/D'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}