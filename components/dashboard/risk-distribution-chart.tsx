"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface RiskCount {
  level: string
  count: number
  color: string
}

const LEVEL_CONFIG: Record<string, { label: string; color: string }> = {
  critico: { label: "Critico", color: "#ef4444" },
  alto: { label: "Alto", color: "#f97316" },
  medio: { label: "Medio", color: "#eab308" },
  bajo: { label: "Bajo", color: "#22c55e" },
}

export function RiskDistributionChart() {
  const [data, setData] = useState<RiskCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRisks() {
      const supabase = createClient()
      const { data: risks } = await supabase
        .from("risks")
        .select("risk_level")

      const counts = {
        critico: 0,
        alto: 0,
        medio: 0,
        bajo: 0,
      }

      risks?.forEach((risk) => {
        if (risk.risk_level && counts[risk.risk_level as keyof typeof counts] !== undefined) {
          counts[risk.risk_level as keyof typeof counts]++
        }
      })

      const chartData = Object.entries(counts).map(([level, count]) => ({
        level: LEVEL_CONFIG[level]?.label || level,
        count,
        color: LEVEL_CONFIG[level]?.color || "#94a3b8",
      }))

      setData(chartData)
      setLoading(false)
    }

    fetchRisks()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Cargando datos...</div>
      </div>
    )
  }

  const hasData = data.some(d => d.count > 0)

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>No hay riesgos registrados</p>
        <p className="text-sm">Agrega riesgos en el modulo de Identificacion</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="level" width={60} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
