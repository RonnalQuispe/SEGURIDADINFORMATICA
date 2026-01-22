"use client"

import React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Activity, Search, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { MonitoringLog, Risk } from "@/lib/types/database"

type MonitoringLogWithRelations = MonitoringLog & {
  risks: Risk | null
}

const LOG_TYPES = [
  { value: "revision", label: "Revision", color: "bg-blue-500" },
  { value: "actualizacion", label: "Actualizacion", color: "bg-green-500" },
  { value: "incidente", label: "Incidente", color: "bg-red-500" },
  { value: "auditoria", label: "Auditoria", color: "bg-purple-500" },
]

export function MonitoringContent() {
  const [logs, setLogs] = useState<MonitoringLogWithRelations[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    risk_id: "",
    log_type: "revision",
    action: "",
    performed_by: "",
    notes: "",
  })

  async function fetchData() {
    const supabase = createClient()
    const [logsRes, risksRes] = await Promise.all([
      supabase.from("monitoring_logs").select("*, risks(*)").order("created_at", { ascending: false }),
      supabase.from("risks").select("*").order("name"),
    ])

    setLogs((logsRes.data as MonitoringLogWithRelations[]) || [])
    setRisks(risksRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    await supabase.from("monitoring_logs").insert({
      risk_id: formData.risk_id || null,
      log_type: formData.log_type,
      action: formData.action,
      performed_by: formData.performed_by,
      notes: formData.notes,
    })

    setIsDialogOpen(false)
    resetForm()
    fetchData()
  }

  function resetForm() {
    setFormData({
      risk_id: "",
      log_type: "revision",
      action: "",
      performed_by: "",
      notes: "",
    })
  }

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.risks?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function getLogTypeBadge(type: string | null) {
    const option = LOG_TYPES.find((o) => o.value === type)
    if (!option) return <Badge variant="secondary">-</Badge>
    return <Badge className={`${option.color} text-white`}>{option.label}</Badge>
  }

  // Stats
  const todayLogs = logs.filter(
    (l) => new Date(l.created_at).toDateString() === new Date().toDateString()
  ).length
  const weekLogs = logs.filter((l) => {
    const logDate = new Date(l.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return logDate >= weekAgo
  }).length
  const incidentCount = logs.filter((l) => l.log_type === "incidente").length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{todayLogs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Esta Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{weekLogs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Incidentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{incidentCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Registro de Monitoreo
            </CardTitle>
            <CardDescription>
              Historial de actividades de monitoreo y revision de riesgos
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Registro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Nuevo Registro de Monitoreo</DialogTitle>
                  <DialogDescription>
                    Documenta una actividad de monitoreo o revision
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Riesgo Relacionado</Label>
                      <Select
                        value={formData.risk_id}
                        onValueChange={(value) => setFormData({ ...formData, risk_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar riesgo..." />
                        </SelectTrigger>
                        <SelectContent>
                          {risks.map((risk) => (
                            <SelectItem key={risk.id} value={risk.id}>
                              {risk.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Registro</Label>
                      <Select
                        value={formData.log_type}
                        onValueChange={(value) => setFormData({ ...formData, log_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LOG_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Accion Realizada *</Label>
                    <Input
                      value={formData.action}
                      onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                      placeholder="Descripcion de la accion..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Realizado Por</Label>
                    <Input
                      value={formData.performed_by}
                      onChange={(e) => setFormData({ ...formData, performed_by: e.target.value })}
                      placeholder="Nombre del responsable"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notas</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Notas adicionales..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Registrar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar registros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse text-muted-foreground">Cargando registros...</div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Activity className="h-8 w-8 mb-2 opacity-50" />
              <p>No hay registros de monitoreo</p>
              <p className="text-sm">Crea el primer registro</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Accion</TableHead>
                  <TableHead>Riesgo</TableHead>
                  <TableHead>Responsable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getLogTypeBadge(log.log_type)}</TableCell>
                    <TableCell className="max-w-xs truncate">{log.action}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.risks?.name || "-"}
                    </TableCell>
                    <TableCell>{log.performed_by || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
