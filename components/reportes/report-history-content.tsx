"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Trash2, Eye, Calendar, Clock } from "lucide-react";
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

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  sections: string[];
  format: string;
  created_at: string;
}

const sectionLabels: Record<string, string> = {
  executive_summary: "Resumen Ejecutivo",
  asset_inventory: "Inventario de Activos",
  risk_matrix: "Matriz de Riesgos",
  threats_vulnerabilities: "Amenazas y Vulnerabilidades",
  existing_controls: "Controles Existentes",
  treatment_plan: "Plan de Tratamiento",
  residual_risk: "Riesgo Residual",
  iso_compliance: "Cumplimiento ISO",
  monitoring_log: "Registro de Monitoreo",
  observations: "Observaciones",
};

export function ReportHistoryContent() {
  const [configs, setConfigs] = useState<ReportConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadConfigs();
  }, []);

  async function loadConfigs() {
    setIsLoading(true);
    const { data } = await supabase
      .from("report_configs")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setConfigs(data);
    setIsLoading(false);
  }

  async function deleteConfig(id: string) {
    const { error } = await supabase.from("report_configs").delete().eq("id", id);
    if (!error) {
      setConfigs((prev) => prev.filter((c) => c.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Plantillas de Reportes Guardadas
          </CardTitle>
          <CardDescription>
            Gestiona las configuraciones de reportes guardadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando...
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No hay plantillas guardadas</p>
              <p className="text-sm mt-2">
                Ve al generador de reportes para crear y guardar una plantilla
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Secciones</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Fecha de Creacion</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="font-medium">{config.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {config.sections.slice(0, 3).map((section) => (
                          <Badge key={section} variant="secondary" className="text-xs">
                            {sectionLabels[section] || section}
                          </Badge>
                        ))}
                        {config.sections.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{config.sections.length - 3} mas
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{config.format.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(config.created_at).toLocaleDateString("es-ES")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/reportes/generar?template=${config.id}`}>
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar Plantilla</AlertDialogTitle>
                              <AlertDialogDescription>
                                Estas seguro de eliminar la plantilla &quot;{config.name}&quot;? Esta accion no se puede deshacer.
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{configs.length}</p>
                <p className="text-sm text-muted-foreground">Plantillas Guardadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-accent/10">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {configs.length > 0
                    ? new Date(configs[0].created_at).toLocaleDateString("es-ES")
                    : "-"}
                </p>
                <p className="text-sm text-muted-foreground">Ultima Plantilla</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">PDF/HTML</p>
                <p className="text-sm text-muted-foreground">Formatos Disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
