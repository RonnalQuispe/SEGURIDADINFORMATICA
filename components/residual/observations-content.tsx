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
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, MessageSquare, Search, User, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { Observation, Risk } from "@/lib/types/database"

// Extendemos para soportar la relación y campos extras si decides agregarlos al SQL luego
type ObservationWithRelations = Observation & {
  risks: Risk | null;
  // Campos que no están en tu SQL actual pero usas en UI:
  assigned_to?: string; 
  due_date?: string;
  resolution?: string;
}

const STATUS_OPTIONS = [
  { value: "Abierta", label: "Abierta", color: "bg-blue-500" },
  { value: "En Revisión", label: "En Revisión", color: "bg-yellow-500" },
  { value: "Resuelta", label: "Resuelta", color: "bg-green-500" },
  { value: "Cerrada", label: "Cerrada", color: "bg-slate-500" },
]

const PRIORITY_OPTIONS = [
  { value: "Alta", label: "Alta", color: "bg-red-500" },
  { value: "Media", label: "Media", color: "bg-yellow-500" },
  { value: "Baja", label: "Baja", color: "bg-green-500" },
]

export function ObservationsContent() {
  const [observations, setObservations] = useState<ObservationWithRelations[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingObs, setEditingObs] = useState<ObservationWithRelations | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  const [formData, setFormData] = useState({
    risk_id: "",
    title: "",
    description: "",
    status: "Abierta",
    priority: "Media",
    author: "", // Usamos author que sí está en tu SQL
    type: "Observación" as any // Campo requerido en tu SQL
  })

  async function fetchData() {
    try {
      setLoading(true)
      const supabase = createClient()
      const [obsRes, risksRes] = await Promise.all([
        supabase.from("observations").select("*, risks(*)").order("created_at", { ascending: false }),
        supabase.from("risks").select("*").order("name"),
      ])

      setObservations((obsRes.data as ObservationWithRelations[]) || [])
      setRisks(risksRes.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    // Solo enviamos campos que existan en tu tabla SQL 'observations'
    const obsData = {
      risk_id: formData.risk_id || null,
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      author: formData.author,
      type: formData.type,
    }

    const { error } = editingObs 
      ? await supabase.from("observations").update(obsData).eq("id", editingObs.id)
      : await supabase.from("observations").insert([obsData])

    if (error) {
        alert("Error al guardar: " + error.message)
    } else {
        setIsDialogOpen(false)
        resetForm()
        fetchData()
    }
  }

  function resetForm() {
    setFormData({
      risk_id: "",
      title: "",
      description: "",
      status: "Abierta",
      priority: "Media",
      author: "",
      type: "Observación"
    })
    setEditingObs(null)
  }

  const filteredObs = observations.filter(
    (obs) =>
      obs.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.risks?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Observaciones y Hallazgos
            </CardTitle>
            <CardDescription>Gestión de hallazgos del sistema</CardDescription>
          </div>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Nueva Observación
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título o riesgo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="text-center py-10 text-muted-foreground animate-pulse">Cargando...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredObs.map((obs) => (
                <Card key={obs.id} className="overflow-hidden border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{obs.title}</CardTitle>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {obs.type}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                          setEditingObs(obs);
                          setFormData({
                            risk_id: obs.risk_id || "",
                            title: obs.title,
                            description: obs.description,
                            status: obs.status || "Abierta",
                            priority: obs.priority || "Media",
                            author: obs.author || "",
                            type: obs.type as any
                          });
                          setIsDialogOpen(true);
                        }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={async () => {
                          if(confirm("¿Eliminar?")) {
                            await createClient().from("observations").delete().eq("id", obs.id);
                            fetchData();
                          }
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-4">
                    <p className="text-muted-foreground line-clamp-2">{obs.description}</p>
                    
                    <div className="flex gap-2">
                        <Badge className={STATUS_OPTIONS.find(s => s.value === obs.status)?.color}>
                            {obs.status}
                        </Badge>
                        <Badge variant="outline">{obs.priority}</Badge>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" /> {obs.author || "Sin autor"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> 
                        {formatDistanceToNow(new Date(obs.created_at!), { addSuffix: true, locale: es })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editingObs ? "Editar" : "Nueva"} Observación</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-2">
              <Label>Título</Label>
              <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Observación">Observación</SelectItem>
                    <SelectItem value="Hallazgo">Hallazgo</SelectItem>
                    <SelectItem value="Recomendación">Recomendación</SelectItem>
                    <SelectItem value="Nota">Nota</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Riesgo Relacionado</Label>
              <Select value={formData.risk_id} onValueChange={v => setFormData({...formData, risk_id: v})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar riesgo..." /></SelectTrigger>
                <SelectContent>
                  {risks.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Autor / Auditor</Label>
                    <Input value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}