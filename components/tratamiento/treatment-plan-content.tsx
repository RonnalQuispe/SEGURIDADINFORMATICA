"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Pencil, Search, Loader2, ShieldCheck, Calendar } from "lucide-react"

// ✅ Importación de tipos
import type { RiskTreatment, Risk, ISOControl } from "@/lib/types/database"

// ✅ Tipos parciales para evitar errores de "missing properties" de TypeScript
type PartialISOControl = Pick<ISOControl, "id" | "control_id" | "name">
type PartialRisk = Pick<Risk, "id" | "name">

interface TreatmentWithRelations extends RiskTreatment {
  risks: PartialRisk | null
  iso_controls: PartialISOControl | null
}

const STATUS_CONFIG = [
  { value: "Planificado", label: "Planificado", color: "bg-slate-500", progress: 15 },
  { value: "En Progreso", label: "En Progreso", color: "bg-blue-500", progress: 50 },
  { value: "Implementado", label: "Implementado", color: "bg-green-500", progress: 90 },
  { value: "Verificado", label: "Verificado", color: "bg-emerald-600", progress: 100 },
]

export function TreatmentPlanContent() {
  const [treatments, setTreatments] = useState<TreatmentWithRelations[]>([])
  const [risks, setRisks] = useState<PartialRisk[]>([])
  const [isoControls, setIsoControls] = useState<PartialISOControl[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState<TreatmentWithRelations | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // ✅ Estado del formulario alineado exactamente a tus INSERTs de SQL
  const [formData, setFormData] = useState({
    risk_id: "",
    strategy: "Mitigar",
    justification: "",
    iso_control_id: "",
    proposed_control: "",
    responsible: "",
    implementation_date: "",
    priority: "Alta",
    status: "Planificado",
  })

  async function fetchData() {
    setLoading(true)
    const supabase = createClient()
    
    const [treatmentsRes, risksRes, controlsRes] = await Promise.all([
      supabase
        .from("risk_treatments")
        .select("*, risks(id, name), iso_controls(id, control_id, name)")
        .order("created_at", { ascending: false }),
      supabase.from("risks").select("id, name").order("name"),
      supabase.from("iso_controls").select("id, control_id, name").order("control_id"),
    ])

    setTreatments((treatmentsRes.data as any) || [])
    setRisks((risksRes.data as PartialRisk[]) || [])
    setIsoControls((controlsRes.data as PartialISOControl[]) || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const filteredTreatments = treatments.filter((t) =>
    t.strategy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.risks?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.proposed_control.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusInfo = (status: string | null) => 
    STATUS_CONFIG.find(s => s.value === status) || STATUS_CONFIG[0]

  async function handleSubmit() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const payload = { ...formData }

    if (editingTreatment) {
      await supabase.from("risk_treatments").update(payload).eq("id", editingTreatment.id)
    } else {
      await supabase.from("risk_treatments").insert([payload])
    }
    
    setIsDialogOpen(false)
    fetchData()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por riesgo, estrategia o control..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => { setEditingTreatment(null); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Nuevo Tratamiento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle>Plan de Tratamiento de Riesgos</CardTitle>
          </div>
          <CardDescription>Control y seguimiento de medidas de mitigación ISO 27001</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold">Estrategia y Control</TableHead>
                    <TableHead>Riesgo</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Estado / Avance</TableHead>
                    <TableHead>Fecha Límite</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTreatments.map((t) => {
                    const status = getStatusInfo(t.status)
                    return (
                      <TableRow key={t.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{t.strategy}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">{t.proposed_control}</span>
                            <span className="text-[10px] mt-1 text-primary font-mono">{t.iso_controls?.control_id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{t.risks?.name}</TableCell>
                        <TableCell>
                          <Badge variant={t.priority === 'Crítica' ? 'destructive' : 'outline'} className="text-[10px]">
                            {t.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5 w-32">
                            <div className="flex justify-between text-[10px]">
                              <span className="font-medium">{status.label}</span>
                              <span>{status.progress}%</span>
                            </div>
                            <Progress value={status.progress} className="h-1.5" />
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {t.implementation_date ? new Date(t.implementation_date).toLocaleDateString() : 'Pendiente'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setEditingTreatment(t)
                            setFormData({
                              risk_id: t.risk_id || "",
                              strategy: t.strategy,
                              justification: t.justification || "",
                              iso_control_id: t.iso_control_id || "",
                              proposed_control: t.proposed_control,
                              responsible: t.responsible || "",
                              implementation_date: t.implementation_date || "",
                              priority: t.priority as any,
                              status: t.status as any,
                            })
                            setIsDialogOpen(true)
                          }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTreatment ? "Editar Plan de Tratamiento" : "Registrar Nuevo Plan"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Riesgo a Mitigar</Label>
              <Select value={formData.risk_id} onValueChange={(v) => setFormData({...formData, risk_id: v})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar riesgo..." /></SelectTrigger>
                <SelectContent>
                  {risks.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Control ISO 27002</Label>
              <Select value={formData.iso_control_id} onValueChange={(v) => setFormData({...formData, iso_control_id: v})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar control..." /></SelectTrigger>
                <SelectContent>
                  {isoControls.map(c => <SelectItem key={c.id} value={c.id}>{c.control_id} - {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estrategia</Label>
              <Select value={formData.strategy} onValueChange={(v) => setFormData({...formData, strategy: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mitigar">Mitigar</SelectItem>
                  <SelectItem value="Evitar">Evitar</SelectItem>
                  <SelectItem value="Transferir">Transferir</SelectItem>
                  <SelectItem value="Aceptar">Aceptar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baja">Baja</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Crítica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Acción de Control Propuesta</Label>
              <Input 
                placeholder="Ej: Implementar cifrado AES-256..." 
                value={formData.proposed_control} 
                onChange={(e) => setFormData({...formData, proposed_control: e.target.value})} 
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Justificación Técnica</Label>
              <Input 
                placeholder="Razón de la elección de este control..." 
                value={formData.justification} 
                onChange={(e) => setFormData({...formData, justification: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Responsable</Label>
              <Input 
                placeholder="Nombre o cargo..." 
                value={formData.responsible} 
                onChange={(e) => setFormData({...formData, responsible: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha de Implementación</Label>
              <Input 
                type="date" 
                value={formData.implementation_date} 
                onChange={(e) => setFormData({...formData, implementation_date: e.target.value})} 
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Estado Actual</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_CONFIG.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Guardar Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}