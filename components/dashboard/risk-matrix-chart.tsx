"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface MatrixCell {
  probability: number
  impact: number
  count: number
  level: string
}

const PROBABILITY_LABELS = ["Muy Baja", "Baja", "Media", "Alta", "Muy Alta"]
const IMPACT_LABELS = ["Muy Bajo", "Bajo", "Medio", "Alto", "Muy Alto"]

function getRiskLevel(probability: number, impact: number): string {
  const score = probability * impact
  if (score >= 20) return "critico"
  if (score >= 12) return "alto"
  if (score >= 6) return "medio"
  return "bajo"
}

function getCellColor(level: string): string {
  switch (level) {
    case "critico": return "bg-red-500"
    case "alto": return "bg-orange-500"
    case "medio": return "bg-yellow-500"
    case "bajo": return "bg-green-500"
    default: return "bg-muted"
  }
}

export function RiskMatrixChart() {
  const [matrixData, setMatrixData] = useState<MatrixCell[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRisks() {
      const supabase = createClient()
      const { data: risks } = await supabase
        .from("risks")
        .select("probability, impact")

      const matrix: MatrixCell[] = []
      
      for (let p = 1; p <= 5; p++) {
        for (let i = 1; i <= 5; i++) {
          const count = risks?.filter(r => r.probability === p && r.impact === i).length || 0
          matrix.push({
            probability: p,
            impact: i,
            count,
            level: getRiskLevel(p, i),
          })
        }
      }

      setMatrixData(matrix)
      setLoading(false)
    }

    fetchRisks()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Cargando matriz...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {/* Y-axis label */}
        <div className="flex flex-col justify-center items-center w-8">
          <span className="text-xs text-muted-foreground -rotate-90 whitespace-nowrap">
            Probabilidad
          </span>
        </div>
        
        <div className="flex-1">
          {/* Matrix Grid */}
          <div className="grid grid-cols-5 gap-1">
            {[5, 4, 3, 2, 1].map((prob) => (
              [1, 2, 3, 4, 5].map((imp) => {
                const cell = matrixData.find(c => c.probability === prob && c.impact === imp)
                return (
                  <div
                    key={`${prob}-${imp}`}
                    className={`aspect-square rounded flex items-center justify-center text-sm font-medium ${getCellColor(cell?.level || "bajo")} ${cell?.count ? "text-white" : "opacity-30"}`}
                    title={`P: ${PROBABILITY_LABELS[prob - 1]}, I: ${IMPACT_LABELS[imp - 1]}`}
                  >
                    {cell?.count || 0}
                  </div>
                )
              })
            ))}
          </div>
          
          {/* X-axis label */}
          <div className="text-center mt-2">
            <span className="text-xs text-muted-foreground">Impacto</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Bajo</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>Medio</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-500" />
          <span>Alto</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Critico</span>
        </div>
      </div>
    </div>
  )
}
