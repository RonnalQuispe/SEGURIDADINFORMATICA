"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { BarChart3 } from "lucide-react"
import type { Asset, AssetCategory } from "@/lib/types/database"

type AssetWithCategory = Asset & { asset_categories: AssetCategory | null }

function calculateAssetValue(asset: Asset): number {
  const c = asset.confidentiality || 1
  const i = asset.integrity || 1
  const a = asset.availability || 1
  return Math.round(((c + i + a) / 15) * 100)
}

function getValueLevel(value: number): { label: string; color: string } {
  if (value >= 80) return { label: "Muy Alto", color: "bg-red-500" }
  if (value >= 60) return { label: "Alto", color: "bg-orange-500" }
  if (value >= 40) return { label: "Medio", color: "bg-yellow-500" }
  if (value >= 20) return { label: "Bajo", color: "bg-green-500" }
  return { label: "Muy Bajo", color: "bg-slate-500" }
}

export function ValuationContent() {
  const [assets, setAssets] = useState<AssetWithCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAssets() {
      const supabase = createClient()
      const { data } = await supabase
        .from("assets")
        .select("*, asset_categories(*)")
        .order("name")
      setAssets((data as AssetWithCategory[]) || [])
      setLoading(false)
    }
    fetchAssets()
  }, [])

  const sortedAssets = [...assets].sort(
    (a, b) => calculateAssetValue(b) - calculateAssetValue(a)
  )

  const avgValue = assets.length > 0
    ? Math.round(assets.reduce((sum, a) => sum + calculateAssetValue(a), 0) / assets.length)
    : 0

  const criticalAssets = assets.filter(a => calculateAssetValue(a) >= 80).length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{assets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgValue}%</div>
            <Progress value={avgValue} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Activos Criticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{criticalAssets}</div>
            <p className="text-xs text-muted-foreground mt-1">Valor mayor o igual a 80%</p>
          </CardContent>
        </Card>
      </div>

      {/* Valuation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Valoracion de Activos</CardTitle>
          <CardDescription>
            Calculo del valor basado en Confidencialidad, Integridad y Disponibilidad (CIA)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse text-muted-foreground">Cargando valoracion...</div>
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <BarChart3 className="h-8 w-8 mb-2 opacity-50" />
              <p>No hay activos para valorar</p>
              <p className="text-sm">Agrega activos en el inventario primero</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-center">C</TableHead>
                  <TableHead className="text-center">I</TableHead>
                  <TableHead className="text-center">D</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Nivel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAssets.map((asset) => {
                  const value = calculateAssetValue(asset)
                  const level = getValueLevel(value)
                  return (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {asset.asset_categories?.name || "-"}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {asset.confidentiality}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {asset.integrity}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {asset.availability}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={value} className="w-20" />
                          <span className="text-sm font-medium">{value}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${level.color} text-white`}>
                          {level.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
