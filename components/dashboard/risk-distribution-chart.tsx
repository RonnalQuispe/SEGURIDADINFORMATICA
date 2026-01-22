"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface RiskCount {
  level: string
  count: number
  color: string
}

// ✅ Añadimos esta interfaz para que TypeScript acepte la prop del Dashboard aunque no la use
interface RiskDistributionProps {
  data?: any 
}

const LEVEL_CONFIG: Record<string, { label: string; color: string }> = {
  "Crítico": { label: "Crítico", color: "#ef4444" },
  "Alto": { label: "Alto", color: "#f97316" },
  "Medio": { label: "Medio", color: "#eab308" },
  "Bajo": { label: "Bajo", color: "#22c55e" },
  "Muy Bajo": { label: "Muy Bajo", color: "#10b981" },
}

// ✅ Agregamos { data }: RiskDistributionProps para eliminar el error del Dashboard
export function RiskDistributionChart({ data: externalData }: RiskDistributionProps) {
  const [data, setData] = useState<RiskCount[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchRisks = async () => {
    const { data: risks } = await supabase
      .from("risks")
      .select("inherent_risk_category")

    const counts: Record<string, number> = {
      "Crítico": 0,
      "Alto": 0,
      "Medio": 0,
      "Bajo": 0,
      "Muy Bajo": 0,
    }

    risks?.forEach(risk => {
      const category = risk.inherent_risk_category
      if (category && counts[category] !== undefined) {
        counts[category]++
      }
    })

    const chartData: RiskCount[] = Object.entries(counts).map(
      ([level, count]) => ({
        level,
        count,
        color: LEVEL_CONFIG[level]?.color ?? "#94a3b8",
      })
    )

    setData(chartData)
    setLoading(false)
  }

  useEffect(() => {
    fetchRisks()

    const channel = supabase
      .channel("distribution-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "risks" },
        fetchRisks
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">
          Cargando datos...
        </div>
      </div>
    )
  }

  const hasData = data.some(d => d.count > 0)

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>No hay riesgos registrados</p>
        <p className="text-sm">
          Agrega riesgos en el módulo de Identificación
        </p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 30, right: 20 }}
      >
        <XAxis type="number" allowDecimals={false} hide />
        <YAxis 
            type="category" 
            dataKey="level" 
            width={80} 
            axisLine={false}
            tickLine={false}
            fontSize={12}
        />
        <Tooltip
          cursor={{fill: 'transparent'}}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}