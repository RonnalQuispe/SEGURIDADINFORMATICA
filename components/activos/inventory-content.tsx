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
import { Plus, Pencil, Trash2, Server, Search } from "lucide-react"
import type { Asset, AssetCategory } from "@/lib/types/database"

type AssetWithCategory = Asset & { asset_categories: AssetCategory | null }

const CRITICALITY_OPTIONS = [
  { value: "critico", label: "Critico", color: "bg-red-500" },
  { value: "alto", label: "Alto", color: "bg-orange-500" },
  { value: "medio", label: "Medio", color: "bg-yellow-500" },
  { value: "bajo", label: "Bajo", color: "bg-green-500" },
]

export function InventoryContent() {
  const [assets, setAssets] = useState<AssetWithCategory[]>([])
  const [categories, setCategories] = useState<AssetCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    owner: "",
    location: "",
    criticality: "medio",
    confidentiality: 3,
    integrity: 3,
    availability: 3,
  })

  async function fetchData() {
    const supabase = createClient()
    const [assetsRes, categoriesRes] = await Promise.all([
      supabase
        .from("assets")
        .select("*, asset_categories(*)")
        .order("name"),
      supabase.from("asset_categories").select("*").order("name"),
    ])
    setAssets((assetsRes.data as AssetWithCategory[]) || [])
    setCategories(categoriesRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    const assetData = {
      name: formData.name,
      description: formData.description,
      category_id: formData.category_id || null,
      owner: formData.owner,
      location: formData.location,
      criticality: formData.criticality,
      confidentiality: formData.confidentiality,
      integrity: formData.integrity,
      availability: formData.availability,
    }

    if (editingAsset) {
      await supabase.from("assets").update(assetData).eq("id", editingAsset.id)
    } else {
      await supabase.from("assets").insert(assetData)
    }

    setIsDialogOpen(false)
    setEditingAsset(null)
    resetForm()
    fetchData()
  }

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      category_id: "",
      owner: "",
      location: "",
      criticality: "medio",
      confidentiality: 3,
      integrity: 3,
      availability: 3,
    })
  }

  async function handleDelete(id: string) {
    if (!confirm("Esta seguro de eliminar este activo?")) return
    const supabase = createClient()
    await supabase.from("assets").delete().eq("id", id)
    fetchData()
  }

  function openEditDialog(asset: AssetWithCategory) {
    setEditingAsset(asset)
    setFormData({
      name: asset.name,
      description: asset.description || "",
      category_id: asset.category_id || "",
      owner: asset.owner || "",
      location: asset.location || "",
      criticality: asset.criticality || "medio",
      confidentiality: asset.confidentiality || 3,
      integrity: asset.integrity || 3,
      availability: asset.availability || 3,
    })
    setIsDialogOpen(true)
  }

  function openNewDialog() {
    setEditingAsset(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const filteredAssets = assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.owner?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function getCriticalityBadge(criticality: string | null) {
    const option = CRITICALITY_OPTIONS.find((o) => o.value === criticality)
    if (!option) return <Badge variant="secondary">-</Badge>
    return (
      <Badge className={`${option.color} text-white`}>
        {option.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Inventario de Activos</CardTitle>
            <CardDescription>
              Registra y gestiona los activos de informacion de la organizacion
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Activo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingAsset ? "Editar Activo" : "Nuevo Activo"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingAsset
                      ? "Modifica los datos del activo"
                      : "Agrega un nuevo activo al inventario"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nombre del activo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Descripcion</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripcion del activo..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner">Propietario</Label>
                    <Input
                      id="owner"
                      value={formData.owner}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                      placeholder="Responsable del activo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicacion</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ubicacion fisica o logica"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="criticality">Criticidad</Label>
                    <Select
                      value={formData.criticality}
                      onValueChange={(value) => setFormData({ ...formData, criticality: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CRITICALITY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Confidencialidad (1-5)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={formData.confidentiality}
                      onChange={(e) => setFormData({ ...formData, confidentiality: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Integridad (1-5)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={formData.integrity}
                      onChange={(e) => setFormData({ ...formData, integrity: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Disponibilidad (1-5)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingAsset ? "Guardar Cambios" : "Crear Activo"}
                  </Button>
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
                placeholder="Buscar por nombre o propietario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse text-muted-foreground">Cargando activos...</div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Server className="h-8 w-8 mb-2 opacity-50" />
              <p>No hay activos registrados</p>
              <p className="text-sm">Crea el primer activo para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Propietario</TableHead>
                    <TableHead>Criticidad</TableHead>
                    <TableHead className="text-center">C/I/D</TableHead>
                    <TableHead className="w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {asset.asset_categories?.name || "-"}
                      </TableCell>
                      <TableCell>{asset.owner || "-"}</TableCell>
                      <TableCell>{getCriticalityBadge(asset.criticality)}</TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {asset.confidentiality}/{asset.integrity}/{asset.availability}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(asset)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(asset.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
