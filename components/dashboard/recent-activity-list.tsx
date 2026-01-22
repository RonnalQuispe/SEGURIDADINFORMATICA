"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Server, AlertTriangle, Shield, Activity, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface ActivityItem {
  id: string
  type: "asset" | "risk" | "treatment" | "monitoring"
  title: string
  description: string
  created_at: string
}

const typeConfig = {
  asset: { icon: Server, color: "text-chart-2", label: "Activo" },
  risk: { icon: AlertTriangle, color: "text-chart-3", label: "Riesgo" },
  treatment: { icon: Shield, color: "text-chart-1", label: "Tratamiento" },
  monitoring: { icon: Activity, color: "text-chart-4", label: "Monitoreo" },
}

export function RecentActivityList() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivities() {
      const supabase = createClient()
      
      const [assetsRes, risksRes, treatmentsRes, logsRes] = await Promise.all([
        supabase.from("assets").select("id, name, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("risks").select("id, name, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("risk_treatments").select("id, name, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("monitoring_logs").select("id, action, created_at").order("created_at", { ascending: false }).limit(3),
      ])

      const allActivities: ActivityItem[] = [
        ...(assetsRes.data || []).map(a => ({
          id: a.id,
          type: "asset" as const,
          title: a.name,
          description: "Activo agregado al inventario",
          created_at: a.created_at,
        })),
        ...(risksRes.data || []).map(r => ({
          id: r.id,
          type: "risk" as const,
          title: r.name,
          description: "Riesgo identificado",
          created_at: r.created_at,
        })),
        ...(treatmentsRes.data || []).map(t => ({
          id: t.id,
          type: "treatment" as const,
          title: t.name,
          description: "Plan de tratamiento creado",
          created_at: t.created_at,
        })),
        ...(logsRes.data || []).map(l => ({
          id: l.id,
          type: "monitoring" as const,
          title: "Actividad de Monitoreo",
          description: l.action,
          created_at: l.created_at,
        })),
      ]

      allActivities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      setActivities(allActivities.slice(0, 8))
      setLoading(false)
    }

    fetchActivities()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-pulse text-muted-foreground">Cargando actividad...</div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
        <Clock className="h-8 w-8 mb-2 opacity-50" />
        <p>No hay actividad reciente</p>
        <p className="text-sm">Comienza agregando activos o identificando riesgos</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const config = typeConfig[activity.type]
        const Icon = config.icon
        
        return (
          <div
            key={`${activity.type}-${activity.id}`}
            className="flex items-start gap-4 p-3 rounded-lg bg-muted/50"
          >
            <div className={`p-2 rounded-lg bg-background ${config.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {config.label}
                </span>
              </div>
              <p className="font-medium truncate">{activity.title}</p>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(activity.created_at), { 
                addSuffix: true, 
                locale: es 
              })}
            </span>
          </div>
        )
      })}
    </div>
  )
}
