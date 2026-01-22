"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, AlertTriangle, Shield, Activity, TrendingUp, TrendingDown } from "lucide-react"
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
        supabase.from("risks").select("id, risk_level", { count: "exact" }),
        supabase.from("risk_treatments").select("id, status", { count: "exact" }),
      ])

      const risks = risksRes.data || []
      const treatments = treatmentsRes.data || []

      setStats({
        totalAssets: assetsRes.count || 0,
        totalRisks: risksRes.count || 0,
        highRisks: risks.filter(r => r.risk_level === "critico" || r.risk_level === "alto").length,
        treatedRisks: treatments.filter(t => t.status === "completado").length,
        pendingTreatments: treatments.filter(t => t.status === "pendiente" || t.status === "en_progreso").length,
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
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Riesgos Identificados",
      value: stats.totalRisks,
      description: "Riesgos en la matriz",
      icon: AlertTriangle,
      trend: null,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Riesgos Criticos/Altos",
      value: stats.highRisks,
      description: "Requieren atencion inmediata",
      icon: Activity,
      trend: stats.highRisks > 0 ? "up" : null,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    {
      title: "Tratamientos Completados",
      value: stats.treatedRisks,
      description: `${stats.pendingTreatments} pendientes`,
      icon: Shield,
      trend: stats.treatedRisks > 0 ? "down" : null,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold">
                  {loading ? "-" : stat.value}
                </div>
                {stat.trend && (
                  <span className={stat.trend === "up" ? "text-destructive" : "text-success"}>
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Matriz de Riesgos</CardTitle>
            <CardDescription>
              Distribucion de riesgos por probabilidad e impacto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiskMatrixChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribucion por Nivel</CardTitle>
            <CardDescription>
              Clasificacion de riesgos por nivel de severidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiskDistributionChart />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Ultimas acciones en el sistema de gestion de riesgos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentActivityList />
        </CardContent>
      </Card>
    </div>
  )
}
