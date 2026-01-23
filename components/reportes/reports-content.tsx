"use client";

import React from "react"
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Download, Printer, Calendar, Building2, Shield, 
  AlertTriangle, CheckCircle2, Clock, FileCheck, Loader2 
} from "lucide-react";

// ✅ Interfaz sincronizada con tu Base de Datos real
interface ReportConfig {
  id: string;
  name: string;
  description: string;
  report_type: string; // Antes: format
  filters: { sections?: string[] } | any; // Antes: sections
  created_at: string;
}

interface ReportSection {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const availableSections: ReportSection[] = [
  { id: "executive_summary", name: "Resumen Ejecutivo", description: "Visión general del estado de riesgos", icon: <FileText className="h-4 w-4" /> },
  { id: "asset_inventory", name: "Inventario de Activos", description: "Lista completa de activos", icon: <Building2 className="h-4 w-4" /> },
  { id: "risk_matrix", name: "Matriz de Riesgos", description: "Riesgos inherentes identificados", icon: <AlertTriangle className="h-4 w-4" /> },
  { id: "treatment_plan", name: "Plan de Tratamiento", description: "Estrategias de mitigación", icon: <FileCheck className="h-4 w-4" /> },
  { id: "residual_risk", name: "Riesgo Residual", description: "Análisis post-tratamiento", icon: <AlertTriangle className="h-4 w-4" /> },
  { id: "observations", name: "Observaciones", description: "Hallazgos y recomendaciones", icon: <FileText className="h-4 w-4" /> },
];

export function ReportsContent() {
  const [savedConfigs, setSavedConfigs] = useState<ReportConfig[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "executive_summary",
    "risk_matrix",
    "treatment_plan",
  ]);
  const [reportFormat, setReportFormat] = useState<string>("PDF");
  const [reportName, setReportName] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadConfigs();
  }, []);

  async function loadConfigs() {
    const { data } = await supabase
      .from("report_configs")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setSavedConfigs(data);
  }

  function toggleSection(sectionId: string) {
    setSelectedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((s) => s !== sectionId) : [...prev, sectionId]
    );
  }

  async function saveConfig() {
    if (!reportName.trim()) return;
    // ✅ Ajuste a columnas reales: report_type y filters (JSON)
    const { error } = await supabase.from("report_configs").insert({
      name: reportName,
      description: `Reporte configurado con ${selectedSections.length} secciones`,
      report_type: reportFormat, 
      filters: { sections: selectedSections }, 
    });
    
    if (!error) {
      loadConfigs();
      setReportName("");
    }
  }

  async function generateReport() {
    setIsGenerating(true);
    const reportData: any = {};
    
    // Simulación de carga de datos basada en tu esquema SQL
    if (selectedSections.includes("risk_matrix")) {
      const { data } = await supabase.from("risks").select("*");
      reportData.risks = data || [];
    }

    // Aquí llamarías a tu función generateHTMLReport(reportData)
    // Para este ejemplo, generamos un placeholder
    setTimeout(() => {
      setGeneratedReport(`<html><body><h1>Reporte: ${reportName || 'Nuevo'}</h1><p>Secciones: ${selectedSections.join(", ")}</p></body></html>`);
      setIsGenerating(false);
    }, 1000);
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generar Reporte</TabsTrigger>
          <TabsTrigger value="templates">Plantillas Guardadas</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Configurar Reporte ISO 27001
              </CardTitle>
              <CardDescription>Selecciona los módulos de información para exportar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {availableSections.map((section) => (
                  <div
                    key={section.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedSections.includes(section.id) ? "border-primary bg-primary/5 shadow-sm" : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleSection(section.id)}
                  >
                    <Checkbox checked={selectedSections.includes(section.id)} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-medium">
                        {section.icon} {section.name}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Badge variant="outline">{selectedSections.length} secciones activas</Badge>
                <Button onClick={generateReport} disabled={isGenerating || selectedSections.length === 0}>
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                  Generar Reporte
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Guardar Preferencias</CardTitle></CardHeader>
            <CardContent className="flex gap-2">
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Nombre de la plantilla (ej: Reporte Mensual Q4)"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
              <Button variant="secondary" onClick={saveConfig} disabled={!reportName}>Guardar</Button>
            </CardContent>
          </Card>

          {generatedReport && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-green-200 bg-green-50/10">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-green-700 flex items-center gap-2">
                      <FileCheck className="h-5 w-5" /> Reporte Listo
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-2"/>Imprimir</Button>
                    </div>
                  </CardHeader>
                </Card>
             </div>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Configuraciones</CardTitle>
            </CardHeader>
            <CardContent>
              {savedConfigs.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                  No hay plantillas disponibles.
                </div>
              ) : (
                <div className="grid gap-4">
                  {savedConfigs.map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-bold">{config.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(config.created_at).toLocaleDateString()} • 
                          {/* ✅ CORRECCIÓN FINAL: Acceso seguro a filtros */}
                          <span className="font-semibold text-primary">
                             {config.filters?.sections?.length || 0} secciones
                          </span>
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => {
                        setSelectedSections(config.filters?.sections || []);
                        setReportFormat(config.report_type);
                      }}>Cargar</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}