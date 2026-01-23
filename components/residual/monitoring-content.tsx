"use client"

import React, { useEffect, useState } from "react"
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

/**
 * AJUSTE DE TIPOS:
 * Usamos los nombres exactos de tu tabla SQL:
 * action_type, description, performed_by.
 */
type MonitoringLogWithRelations = MonitoringLog & {
  risks: Risk | null;
}

const LOG_TYPES = [
  { value: "Revisión", label: "Revisión", color: "bg-blue-500" },
  { value: "Actualización", label: "Actualización", color: "bg-green-500" },
  { value: "Incidente", label: "Incidente", color: "bg-red-500" },
  { value: "Verificación", label: "Verificación", color: "bg-purple-500" },
]

export function MonitoringContent() {
  const [logs, setLogs] = useState<MonitoringLogWithRelations[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  const [formData, setFormData] = useState({
    risk_id: "",
    action_type: "Revisión", // Coincide con CHECK en SQL
    description: "",         // Coincide con SQL
    performed_by: "",        // Coincide con SQL
  })

  async function fetchData() {
    const supabase = createClient()
    const [logsRes, risksRes] = await Promise.all([
      supabase.from("monitoring_logs").select("*, risks(*)").order("created_at", { ascending: false }),
      supabase.from("risks").select("*").order("name"),
    ])

    setLogs((logsRes.data as unknown as MonitoringLogWithRelations[]) || [])
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
      action_type: formData.action_type,
      description: formData.description,
      performed_by: formData.performed_by,
    })

    setIsDialogOpen(false)
    resetForm()
    fetchData()
  }

  function resetForm() {
    setFormData({
      risk_id: "",
      action_type: "Revisión",
      description: "",
      performed_by: "",
    })
  }

  const filteredLogs = logs.filter(
    (log) =>
      (log.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.risks?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  function getLogTypeBadge(type: string | null) {
    const option = LOG_TYPES.find((o) => o.value === type)
    if (!option) return <Badge variant="secondary">-</Badge>
    return <Badge className={`${option.color} text-white`}>{option.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Registro de Monitoreo
            </CardTitle>
            <CardDescription>Historial basado en esquema SQL</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Nuevo Registro</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Nuevo Registro</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Riesgo Relacionado</Label>
                    <Select value={formData.risk_id} onValueChange={(v) => setFormData({ ...formData, risk_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar riesgo..." /></SelectTrigger>
                      <SelectContent>
                        {risks.map((risk) => (
                          <SelectItem key={risk.id} value={risk.id}>{risk.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo (action_type)</Label>
                    <Select value={formData.action_type} onValueChange={(v) => setFormData({ ...formData, action_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LOG_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción *</Label>
                    <Textarea 
                      required 
                      value={formData.description} 
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Realizado Por</Label>
                    <Input 
                      value={formData.performed_by} 
                      onChange={(e) => setFormData({ ...formData, performed_by: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Registrar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input 
              placeholder="Buscar..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Responsable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {log.created_at && formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })}
                  </TableCell>
                  <TableCell>{getLogTypeBadge(log.action_type)}</TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>{log.performed_by || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}