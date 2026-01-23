"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Trash2, Eye, Calendar, Clock, Settings2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ✅ Interfaz robusta
interface ReportConfig {
  id: string;
  name: string;
  description: string;
  report_type: string;
  filters: {
    sections?: string[];
    [key: string]: any;
  } | null;
  created_at: string;
}

export function ReportHistoryContent() {
  const [configs, setConfigs] = useState<ReportConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadConfigs();
  }, []);

  async function loadConfigs() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("report_configs")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setConfigs(data || []);
    } catch (err) {
      console.error("Error cargando configuraciones:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteConfig(id: string) {
    try {
      const { error } = await supabase.from("report_configs").delete().eq("id", id);
      if (error) throw error;
      setConfigs((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Configuraciones de Reportes Guardadas
          </CardTitle>
          <CardDescription>
            Historial de plantillas y criterios de filtrado personalizados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Cargando plantillas...</p>
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No hay configuraciones guardadas</p>
              <p className="text-sm mt-1">Crea un nuevo reporte para verlo aquí.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Nombre / Descripción</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Secciones/Filtros</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => {
                    // Extraer secciones del JSON de forma segura
                    const sections = config.filters?.sections || [];
                    
                    return (
                      <TableRow key={config.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold">{config.name || "Sin nombre"}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {config.description || "Sin descripción"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {config.report_type?.toUpperCase() || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {sections.length > 0 ? (
                              sections.map((s: string) => (
                                <Badge key={s} variant="secondary" className="text-[10px] py-0 px-1.5 capitalize">
                                  {s.replace(/_/g, ' ')}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Por defecto</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(config.created_at).toLocaleDateString("es-ES")}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar configuración?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Se eliminará la plantilla <strong>{config.name}</strong>. Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteConfig(config.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          icon={<FileText className="h-5 w-5 text-primary" />} 
          value={configs.length} 
          label="Total Plantillas" 
          color="bg-primary/10" 
        />
        <StatCard 
          icon={<Clock className="h-5 w-5 text-orange-500" />} 
          value={configs.length > 0 ? new Date(configs[0].created_at).toLocaleDateString("es-ES", { day: 'numeric', month: 'short' }) : "-"} 
          label="Última Actualización" 
          color="bg-orange-500/10" 
        />
        <StatCard 
          icon={<Settings2 className="h-5 w-5 text-emerald-600" />} 
          value="JSON" 
          label="Motor de Criterios" 
          color="bg-emerald-500/10" 
        />
      </div>
    </div>
  );
}

// Subcomponente para las estadísticas para limpiar el código
function StatCard({ icon, value, label, color }: { icon: React.ReactNode, value: string | number, label: string, color: string }) {
  return (
    <Card className="bg-background">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${color}`}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}