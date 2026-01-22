"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface MatrixCell {
  probability: number
  impact: number
  count: number
  level: "bajo" | "medio" | "alto" | "critico"
}

function getRiskLevel(p: number, i: number): MatrixCell["level"] {
  const score = p * i
  if (score >= 20) return "critico"
  if (score >= 12) return "alto"
  if (score >= 6) return "medio"
  return "bajo"
}

export function RiskMatrixChart() {
  const [matrixData, setMatrixData] = useState<MatrixCell[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  async function fetchRisks() {
    const { data: risks } = await supabase.from("risks").select("probability, impact")
    const matrix: MatrixCell[] = []
    for (let p = 5; p >= 1; p--) {
      for (let i = 1; i <= 5; i++) {
        const count = risks?.filter(r => Number(r.probability) === p && Number(r.impact) === i).length || 0
        matrix.push({ probability: p, impact: i, count, level: getRiskLevel(p, i) })
      }
    }
    setMatrixData(matrix)
    setLoading(false)
  }

  useEffect(() => {
    fetchRisks()
    const channel = supabase.channel("matrix-db").on("postgres_changes", 
      { event: "*", schema: "public", table: "risks" }, fetchRisks).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  if (loading) return <div className="h-64 flex items-center justify-center">Cargando...</div>

  return (
    <div className="grid grid-cols-5 gap-1 w-full max-w-[400px] mx-auto">
      {matrixData.map((cell, idx) => {
        const colors = { critico: "bg-red-500", alto: "bg-orange-500", medio: "bg-yellow-500", bajo: "bg-green-500" }
        return (
          <div key={idx} className={`aspect-square flex items-center justify-center text-white font-bold rounded-sm ${colors[cell.level]} ${cell.count === 0 ? "opacity-20" : "opacity-100"}`}>
            {cell.count > 0 ? cell.count : ""}
          </div>
        )
      })}
    </div>
  )
}