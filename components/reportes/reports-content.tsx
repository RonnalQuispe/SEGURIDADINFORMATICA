"use client";

import React from "react"

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, FileSpreadsheet, Printer, Calendar, Building2, Shield, AlertTriangle, CheckCircle2, Clock, FileCheck } from "lucide-react";

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  sections: string[];
  format: string;
  created_at: string;
}

interface ReportSection {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const availableSections: ReportSection[] = [
  { id: "executive_summary", name: "Resumen Ejecutivo", description: "Vision general del estado de riesgos", icon: <FileText className="h-4 w-4" /> },
  { id: "asset_inventory", name: "Inventario de Activos", description: "Lista completa de activos y su valoracion", icon: <Building2 className="h-4 w-4" /> },
  { id: "risk_matrix", name: "Matriz de Riesgos", description: "Matriz de riesgos inherentes identificados", icon: <AlertTriangle className="h-4 w-4" /> },
  { id: "threats_vulnerabilities", name: "Amenazas y Vulnerabilidades", description: "Catalogo de amenazas y vulnerabilidades", icon: <Shield className="h-4 w-4" /> },
  { id: "existing_controls", name: "Controles Existentes", description: "Evaluacion de controles implementados", icon: <CheckCircle2 className="h-4 w-4" /> },
  { id: "treatment_plan", name: "Plan de Tratamiento", description: "Estrategias de tratamiento de riesgos", icon: <FileCheck className="h-4 w-4" /> },
  { id: "residual_risk", name: "Riesgo Residual", description: "Analisis de riesgo residual post-tratamiento", icon: <AlertTriangle className="h-4 w-4" /> },
  { id: "iso_compliance", name: "Cumplimiento ISO 27002", description: "Estado de cumplimiento con controles ISO", icon: <Shield className="h-4 w-4" /> },
  { id: "monitoring_log", name: "Registro de Monitoreo", description: "Historico de actividades de monitoreo", icon: <Clock className="h-4 w-4" /> },
  { id: "observations", name: "Observaciones", description: "Hallazgos y recomendaciones", icon: <FileText className="h-4 w-4" /> },
];

export function ReportsContent() {
  const [savedConfigs, setSavedConfigs] = useState<ReportConfig[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "executive_summary",
    "risk_matrix",
    "treatment_plan",
  ]);
  const [reportFormat, setReportFormat] = useState<string>("pdf");
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
      prev.includes(sectionId)
        ? prev.filter((s) => s !== sectionId)
        : [...prev, sectionId]
    );
  }

  async function saveConfig() {
    if (!reportName.trim()) return;
    const { error } = await supabase.from("report_configs").insert({
      name: reportName,
      description: `Reporte con ${selectedSections.length} secciones`,
      sections: selectedSections,
      format: reportFormat,
    });
    if (!error) {
      loadConfigs();
      setReportName("");
    }
  }

  async function generateReport() {
    setIsGenerating(true);
    
    // Fetch all data based on selected sections
    const reportData: Record<string, unknown> = {};
    
    if (selectedSections.includes("asset_inventory")) {
      const { data } = await supabase.from("assets").select("*, asset_categories(name)");
      reportData.assets = data || [];
    }
    
    if (selectedSections.includes("risk_matrix")) {
      const { data } = await supabase.from("risks").select("*, assets(name), threats(name), vulnerabilities(name)");
      reportData.risks = data || [];
    }
    
    if (selectedSections.includes("threats_vulnerabilities")) {
      const { data: threats } = await supabase.from("threats").select("*");
      const { data: vulnerabilities } = await supabase.from("vulnerabilities").select("*");
      reportData.threats = threats || [];
      reportData.vulnerabilities = vulnerabilities || [];
    }
    
    if (selectedSections.includes("existing_controls")) {
      const { data } = await supabase.from("existing_controls").select("*");
      reportData.existingControls = data || [];
    }
    
    if (selectedSections.includes("treatment_plan")) {
      const { data } = await supabase.from("risk_treatments").select("*, risks(*, assets(name)), iso_controls(control_id, name)");
      reportData.treatments = data || [];
    }
    
    if (selectedSections.includes("residual_risk")) {
      const { data } = await supabase.from("residual_risks").select("*, risks(*, assets(name))");
      reportData.residualRisks = data || [];
    }
    
    if (selectedSections.includes("iso_compliance")) {
      const { data } = await supabase.from("iso_controls").select("*");
      reportData.isoControls = data || [];
    }
    
    if (selectedSections.includes("monitoring_log")) {
      const { data } = await supabase.from("monitoring_logs").select("*, risks(*, assets(name))");
      reportData.monitoringLogs = data || [];
    }
    
    if (selectedSections.includes("observations")) {
      const { data } = await supabase.from("observations").select("*, risks(*, assets(name))");
      reportData.observations = data || [];
    }

    // Generate HTML report
    const html = generateHTMLReport(reportData);
    setGeneratedReport(html);
    setIsGenerating(false);
  }

  function generateHTMLReport(data: Record<string, unknown>): string {
    const date = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte de Gestion de Riesgos Ciberneticos</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #1a1a2e; background: #fff; }
    .container { max-width: 900px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; padding: 40px 0; border-bottom: 3px solid #0ea5e9; margin-bottom: 40px; }
    .header h1 { font-size: 28px; color: #0c4a6e; margin-bottom: 8px; }
    .header .subtitle { color: #64748b; font-size: 14px; }
    .header .date { color: #0ea5e9; font-weight: 600; margin-top: 16px; }
    .section { margin-bottom: 40px; page-break-inside: avoid; }
    .section-title { font-size: 20px; color: #0c4a6e; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
    .section-title::before { content: ''; width: 4px; height: 24px; background: #0ea5e9; border-radius: 2px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    th, td { padding: 12px; text-align: left; border: 1px solid #e2e8f0; }
    th { background: #f1f5f9; color: #0c4a6e; font-weight: 600; }
    tr:nth-child(even) { background: #f8fafc; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-critical { background: #fee2e2; color: #dc2626; }
    .badge-high { background: #ffedd5; color: #ea580c; }
    .badge-medium { background: #fef3c7; color: #d97706; }
    .badge-low { background: #dcfce7; color: #16a34a; }
    .badge-very-low { background: #e0e7ff; color: #4f46e5; }
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 20px 0; }
    .stat-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
    .stat-card .value { font-size: 32px; font-weight: 700; color: #0ea5e9; }
    .stat-card .label { font-size: 12px; color: #64748b; margin-top: 4px; }
    .footer { text-align: center; padding: 40px 0; border-top: 1px solid #e2e8f0; margin-top: 40px; color: #64748b; font-size: 12px; }
    .risk-matrix { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; margin: 20px 0; }
    .risk-cell { padding: 16px 8px; text-align: center; font-size: 11px; font-weight: 600; border-radius: 4px; }
    @media print { .container { padding: 20px; } .section { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reporte de Gestion de Riesgos Ciberneticos</h1>
      <p class="subtitle">Sistema de Gestion basado en ISO 27002:2022</p>
      <p class="date">Generado: ${date}</p>
    </div>
`;

    // Executive Summary
    if (selectedSections.includes("executive_summary")) {
      const risks = (data.risks as Array<{ risk_level: string }>) || [];
      const criticalCount = risks.filter((r) => r.risk_level === "critico").length;
      const highCount = risks.filter((r) => r.risk_level === "alto").length;
      const mediumCount = risks.filter((r) => r.risk_level === "medio").length;
      const lowCount = risks.filter((r) => r.risk_level === "bajo").length;
      
      html += `
    <div class="section">
      <h2 class="section-title">Resumen Ejecutivo</h2>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="value">${risks.length}</div>
          <div class="label">Total Riesgos</div>
        </div>
        <div class="stat-card">
          <div class="value" style="color: #dc2626;">${criticalCount}</div>
          <div class="label">Criticos</div>
        </div>
        <div class="stat-card">
          <div class="value" style="color: #ea580c;">${highCount}</div>
          <div class="label">Altos</div>
        </div>
        <div class="stat-card">
          <div class="value" style="color: #16a34a;">${mediumCount + lowCount}</div>
          <div class="label">Medio/Bajo</div>
        </div>
      </div>
      <p>Este reporte presenta el estado actual de la gestion de riesgos ciberneticos de la organizacion, incluyendo la identificacion, evaluacion y tratamiento de riesgos conforme a las mejores practicas y la norma ISO 27002:2022.</p>
    </div>
`;
    }

    // Asset Inventory
    if (selectedSections.includes("asset_inventory") && data.assets) {
      const assets = data.assets as Array<{
        name: string;
        asset_categories?: { name: string };
        owner: string;
        criticality: string;
        confidentiality: number;
        integrity: number;
        availability: number;
      }>;
      html += `
    <div class="section">
      <h2 class="section-title">Inventario de Activos</h2>
      <table>
        <thead>
          <tr>
            <th>Activo</th>
            <th>Categoria</th>
            <th>Propietario</th>
            <th>Criticidad</th>
            <th>C</th>
            <th>I</th>
            <th>D</th>
          </tr>
        </thead>
        <tbody>
          ${assets.map((a) => `
          <tr>
            <td>${a.name}</td>
            <td>${a.asset_categories?.name || "-"}</td>
            <td>${a.owner || "-"}</td>
            <td><span class="badge badge-${a.criticality}">${a.criticality}</span></td>
            <td>${a.confidentiality}</td>
            <td>${a.integrity}</td>
            <td>${a.availability}</td>
          </tr>
          `).join("")}
        </tbody>
      </table>
      <p style="font-size: 12px; color: #64748b; margin-top: 8px;">C = Confidencialidad, I = Integridad, D = Disponibilidad (escala 1-5)</p>
    </div>
`;
    }

    // Risk Matrix
    if (selectedSections.includes("risk_matrix") && data.risks) {
      const risks = data.risks as Array<{
        assets?: { name: string };
        threats?: { name: string };
        vulnerabilities?: { name: string };
        probability: number;
        impact: number;
        inherent_risk: number;
        risk_level: string;
      }>;
      html += `
    <div class="section">
      <h2 class="section-title">Matriz de Riesgos Inherentes</h2>
      <table>
        <thead>
          <tr>
            <th>Activo</th>
            <th>Amenaza</th>
            <th>Vulnerabilidad</th>
            <th>Prob.</th>
            <th>Impacto</th>
            <th>Riesgo</th>
            <th>Nivel</th>
          </tr>
        </thead>
        <tbody>
          ${risks.map((r) => `
          <tr>
            <td>${r.assets?.name || "-"}</td>
            <td>${r.threats?.name || "-"}</td>
            <td>${r.vulnerabilities?.name || "-"}</td>
            <td>${r.probability}</td>
            <td>${r.impact}</td>
            <td>${r.inherent_risk}</td>
            <td><span class="badge badge-${r.risk_level}">${r.risk_level}</span></td>
          </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
`;
    }

    // Threats and Vulnerabilities
    if (selectedSections.includes("threats_vulnerabilities")) {
      const threats = (data.threats as Array<{ name: string; category: string; description: string }>) || [];
      const vulnerabilities = (data.vulnerabilities as Array<{ name: string; category: string; severity: string }>) || [];
      
      html += `
    <div class="section">
      <h2 class="section-title">Amenazas Identificadas</h2>
      <table>
        <thead>
          <tr>
            <th>Amenaza</th>
            <th>Categoria</th>
            <th>Descripcion</th>
          </tr>
        </thead>
        <tbody>
          ${threats.map((t) => `
          <tr>
            <td>${t.name}</td>
            <td>${t.category}</td>
            <td>${t.description || "-"}</td>
          </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    <div class="section">
      <h2 class="section-title">Vulnerabilidades Identificadas</h2>
      <table>
        <thead>
          <tr>
            <th>Vulnerabilidad</th>
            <th>Categoria</th>
            <th>Severidad</th>
          </tr>
        </thead>
        <tbody>
          ${vulnerabilities.map((v) => `
          <tr>
            <td>${v.name}</td>
            <td>${v.category}</td>
            <td><span class="badge badge-${v.severity}">${v.severity}</span></td>
          </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
`;
    }

    // Existing Controls
    if (selectedSections.includes("existing_controls") && data.existingControls) {
      const controls = data.existingControls as Array<{
        name: string;
        control_type: string;
        implementation_status: string;
        effectiveness: number;
      }>;
      html += `
    <div class="section">
      <h2 class="section-title">Controles Existentes</h2>
      <table>
        <thead>
          <tr>
            <th>Control</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Efectividad</th>
          </tr>
        </thead>
        <tbody>
          ${controls.map((c) => `
          <tr>
            <td>${c.name}</td>
            <td>${c.control_type}</td>
            <td>${c.implementation_status}</td>
            <td>${c.effectiveness}%</td>
          </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
`;
    }

    // Treatment Plan
    if (selectedSections.includes("treatment_plan") && data.treatments) {
      const treatments = data.treatments as Array<{
        risks?: { assets?: { name: string } };
        treatment_type: string;
        iso_controls?: { control_id: string; name: string };
        status: string;
        due_date: string;
        responsible: string;
      }>;
      html += `
    <div class="section">
      <h2 class="section-title">Plan de Tratamiento de Riesgos</h2>
      <table>
        <thead>
          <tr>
            <th>Riesgo/Activo</th>
            <th>Tratamiento</th>
            <th>Control ISO</th>
            <th>Estado</th>
            <th>Fecha Limite</th>
            <th>Responsable</th>
          </tr>
        </thead>
        <tbody>
          ${treatments.map((t) => `
          <tr>
            <td>${t.risks?.assets?.name || "-"}</td>
            <td>${t.treatment_type}</td>
            <td>${t.iso_controls ? `${t.iso_controls.control_id} - ${t.iso_controls.name}` : "-"}</td>
            <td>${t.status}</td>
            <td>${t.due_date ? new Date(t.due_date).toLocaleDateString("es-ES") : "-"}</td>
            <td>${t.responsible || "-"}</td>
          </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
`;
    }

    // Residual Risk
    if (selectedSections.includes("residual_risk") && data.residualRisks) {
      const residualRisks = data.residualRisks as Array<{
        risks?: { assets?: { name: string }; inherent_risk: number; risk_level: string };
        residual_probability: number;
        residual_impact: number;
        residual_risk_value: number;
        residual_risk_level: string;
        risk_reduction_percentage: number;
      }>;
      html += `
    <div class="section">
      <h2 class="section-title">Analisis de Riesgo Residual</h2>
      <table>
        <thead>
          <tr>
            <th>Activo</th>
            <th>Riesgo Inherente</th>
            <th>Prob. Residual</th>
            <th>Imp. Residual</th>
            <th>Riesgo Residual</th>
            <th>Nivel</th>
            <th>Reduccion</th>
          </tr>
        </thead>
        <tbody>
          ${residualRisks.map((r) => `
          <tr>
            <td>${r.risks?.assets?.name || "-"}</td>
            <td>${r.risks?.inherent_risk || "-"} (${r.risks?.risk_level || "-"})</td>
            <td>${r.residual_probability}</td>
            <td>${r.residual_impact}</td>
            <td>${r.residual_risk_value}</td>
            <td><span class="badge badge-${r.residual_risk_level}">${r.residual_risk_level}</span></td>
            <td style="color: #16a34a; font-weight: 600;">${r.risk_reduction_percentage?.toFixed(1)}%</td>
          </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
`;
    }

    // ISO Compliance
    if (selectedSections.includes("iso_compliance") && data.isoControls) {
      const isoControls = data.isoControls as Array<{
        control_id: string;
        name: string;
        domain: string;
        implementation_status: string;
      }>;
      const implemented = isoControls.filter((c) => c.implementation_status === "implementado").length;
      const partial = isoControls.filter((c) => c.implementation_status === "parcial").length;
      const planned = isoControls.filter((c) => c.implementation_status === "planificado").length;
      
      html += `
    <div class="section">
      <h2 class="section-title">Cumplimiento ISO 27002:2022</h2>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="value">${isoControls.length}</div>
          <div class="label">Total Controles</div>
        </div>
        <div class="stat-card">
          <div class="value" style="color: #16a34a;">${implemented}</div>
          <div class="label">Implementados</div>
        </div>
        <div class="stat-card">
          <div class="value" style="color: #d97706;">${partial}</div>
          <div class="label">Parciales</div>
        </div>
        <div class="stat-card">
          <div class="value" style="color: #3b82f6;">${planned}</div>
          <div class="label">Planificados</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID Control</th>
            <th>Nombre</th>
            <th>Dominio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${isoControls.slice(0, 20).map((c) => `
          <tr>
            <td>${c.control_id}</td>
            <td>${c.name}</td>
            <td>${c.domain}</td>
            <td>${c.implementation_status}</td>
          </tr>
          `).join("")}
        </tbody>
      </table>
      ${isoControls.length > 20 ? `<p style="font-size: 12px; color: #64748b; margin-top: 8px;">Mostrando 20 de ${isoControls.length} controles</p>` : ""}
    </div>
`;
    }

    // Observations
    if (selectedSections.includes("observations") && data.observations) {
      const observations = data.observations as Array<{
        title: string;
        observation_type: string;
        priority: string;
        status: string;
        description: string;
        risks?: { assets?: { name: string } };
      }>;
      html += `
    <div class="section">
      <h2 class="section-title">Observaciones y Hallazgos</h2>
      <table>
        <thead>
          <tr>
            <th>Titulo</th>
            <th>Tipo</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Riesgo Asociado</th>
          </tr>
        </thead>
        <tbody>
          ${observations.map((o) => `
          <tr>
            <td>${o.title}</td>
            <td>${o.observation_type}</td>
            <td><span class="badge badge-${o.priority}">${o.priority}</span></td>
            <td>${o.status}</td>
            <td>${o.risks?.assets?.name || "-"}</td>
          </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
`;
    }

    // Footer
    html += `
    <div class="footer">
      <p>Documento generado automaticamente por CyberRisk Manager</p>
      <p>Sistema de Gestion de Riesgos Ciberneticos - ISO 27002:2022</p>
      <p>${date}</p>
    </div>
  </div>
</body>
</html>
`;

    return html;
  }

  function downloadReport(format: string) {
    if (!generatedReport) return;

    if (format === "html" || format === "pdf") {
      const blob = new Blob([generatedReport], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      
      if (format === "pdf") {
        // Open in new window for printing to PDF
        const printWindow = window.open(url, "_blank");
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = `reporte-riesgos-${new Date().toISOString().split("T")[0]}.html`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  }

  function printReport() {
    if (!generatedReport) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(generatedReport);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
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
                <FileText className="h-5 w-5" />
                Configurar Reporte
              </CardTitle>
              <CardDescription>
                Selecciona las secciones que deseas incluir en el reporte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {availableSections.map((section) => (
                  <div
                    key={section.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedSections.includes(section.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => toggleSection(section.id)}
                  >
                    <Checkbox
                      checked={selectedSections.includes(section.id)}
                      onCheckedChange={() => toggleSection(section.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {section.icon}
                        <span className="font-medium">{section.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {section.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">
                    {selectedSections.length} secciones seleccionadas
                  </Badge>
                </div>
                <Button
                  onClick={generateReport}
                  disabled={selectedSections.length === 0 || isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Generando...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Generar Reporte
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Template */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Guardar como Plantilla</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="templateName" className="sr-only">
                    Nombre de la plantilla
                  </Label>
                  <input
                    id="templateName"
                    type="text"
                    placeholder="Nombre de la plantilla..."
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={saveConfig}
                  disabled={!reportName.trim() || selectedSections.length === 0}
                >
                  Guardar Plantilla
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Report Preview */}
          {generatedReport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-green-600" />
                    Reporte Generado
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => downloadReport("html")} className="gap-2">
                      <Download className="h-4 w-4" />
                      HTML
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadReport("pdf")} className="gap-2">
                      <FileText className="h-4 w-4" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={printReport} className="gap-2 bg-transparent">
                      <Printer className="h-4 w-4" />
                      Imprimir
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <iframe
                    srcDoc={generatedReport}
                    className="w-full h-[600px]"
                    title="Vista previa del reporte"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas Guardadas</CardTitle>
              <CardDescription>
                Plantillas de reportes configuradas previamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedConfigs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay plantillas guardadas</p>
                  <p className="text-sm">Crea una plantilla configurando las secciones y guardandola</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedConfigs.map((config) => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{config.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {config.sections.length} secciones - Creado:{" "}
                          {new Date(config.created_at).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSections(config.sections);
                          setReportFormat(config.format);
                        }}
                      >
                        Usar Plantilla
                      </Button>
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
