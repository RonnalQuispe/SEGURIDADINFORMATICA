"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Server,
  AlertTriangle,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { RiskMatrixChart } from "@/components/dashboard/risk-matrix-chart"
import { RiskDistributionChart } from "@/components/dashboard/risk-distribution-chart"
import { RecentActivityList } from "@/components/dashboard/recent-activity-list"

interface DashboardStats {
  totalAssets: number
  totalRisks: number
  highRisks: number
  treatedRisks: number
  pendingTreatments: number
}

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    totalRisks: 0,
    highRisks: 0,
    treatedRisks: 0,
    pendingTreatments: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()

      const [assetsRes, risksRes, treatmentsRes] = await Promise.all([
        supabase.from("assets").select("id", { count: "exact" }),
        supabase.from("risks").select("id, inherent_risk_category"),
        supabase.from("risk_treatments").select("id, status"),
      ])

      const risks = risksRes.data || []
      const treatments = treatmentsRes.data || []

      setStats({
        totalAssets: assetsRes.count || 0,
        totalRisks: risks.length,
        highRisks: risks.filter(r =>
          ["Crítico", "Alto"].includes(r.inherent_risk_category)
        ).length,
        treatedRisks: treatments.filter(t =>
          ["Implementado", "Verificado"].includes(t.status)
        ).length,
        pendingTreatments: treatments.filter(t =>
          ["Planificado", "En Progreso"].includes(t.status)
        ).length,
      })

      setLoading(false)
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Activos Registrados",
      value: stats.totalAssets,
      description: "Total de activos en el inventario",
      icon: Server,
      trend: null,
    },
    {
      title: "Riesgos Identificados",
      value: stats.totalRisks,
      description: "Riesgos registrados en el sistema",
      icon: AlertTriangle,
      trend: null,
    },
    {
      title: "Riesgos Críticos / Altos",
      value: stats.highRisks,
      description: "Requieren atención inmediata",
      icon: Activity,
      trend: stats.highRisks > 0 ? "up" : null,
    },
    {
      title: "Tratamientos Completados",
      value: stats.treatedRisks,
      description: `${stats.pendingTreatments} pendientes`,
      icon: Shield,
      trend: stats.treatedRisks > 0 ? "down" : null,
    },
  ]

  return (
    <div className="space-y-6">
      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(stat => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold">
                  {loading ? "-" : stat.value}
                </div>
                {stat.trend && (
                  stat.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-destructive" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-success" />
                  )
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Matriz de Riesgos</CardTitle>
            <CardDescription>
              Probabilidad vs Impacto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiskMatrixChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Nivel</CardTitle>
            <CardDescription>
              Clasificación de riesgos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiskDistributionChart />
          </CardContent>
        </Card>
      </div>

      {/* ACTIVIDAD RECIENTE */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimos cambios en riesgos y tratamientos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentActivityList />
        </CardContent>
      </Card>
    </div>
  )
}
