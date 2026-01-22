"use client";

import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DescripcionSistemaPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header con botones */}
      <div className="print:hidden sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Sistema
            </Button>
          </Link>
          <Button onClick={handlePrint} size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir / Guardar PDF
          </Button>
        </div>
      </div>

      {/* Contenido del documento */}
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        <article className="prose prose-slate dark:prose-invert max-w-none print:text-black">
          {/* Portada */}
          <div className="text-center mb-16 print:mb-8">
            <div className="mb-8">
              <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                <svg className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">CyberRisk Manager</h1>
            <h2 className="text-2xl text-muted-foreground mb-4">Sistema de Gestion de Riesgos Ciberneticos</h2>
            <h3 className="text-xl text-muted-foreground mb-8">Descripcion Detallada del Sistema</h3>
            <div className="text-sm text-muted-foreground">
              <p>Version 1.0</p>
              <p>Enero 2026</p>
            </div>
          </div>

          {/* Resumen Ejecutivo */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">Resumen Ejecutivo</h2>
            <div className="bg-muted p-6 rounded-lg">
              <p className="text-justify leading-relaxed">
                <strong>CyberRisk Manager</strong> es una aplicacion web profesional disenada para gestionar de manera integral los riesgos de seguridad de la informacion en organizaciones de cualquier tamano. El sistema implementa las mejores practicas internacionales basadas en los estandares <strong>ISO/IEC 27001:2022</strong> (Sistema de Gestion de Seguridad de la Informacion) e <strong>ISO/IEC 27002:2022</strong> (Controles de Seguridad de la Informacion), proporcionando un marco estructurado para identificar, evaluar, tratar y monitorear los riesgos ciberneticos de forma continua.
              </p>
            </div>
          </section>

          {/* ¿Qué es CyberRisk Manager? */}
          <section className="mb-12 print:page-break-before">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">1. Que es CyberRisk Manager</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">1.1 Definicion</h3>
            <p className="text-justify leading-relaxed">
              CyberRisk Manager es una <strong>plataforma web de gestion de riesgos ciberneticos</strong> que permite a las organizaciones:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Mantener un inventario actualizado de activos de informacion criticos</li>
              <li>Identificar y catalogar amenazas y vulnerabilidades de seguridad</li>
              <li>Evaluar el nivel de riesgo mediante metodologias cuantitativas</li>
              <li>Planificar e implementar tratamientos de riesgo efectivos</li>
              <li>Monitorear continuamente el estado de seguridad</li>
              <li>Generar documentacion y reportes para cumplimiento normativo</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">1.2 Contexto y Necesidad</h3>
            <p className="text-justify leading-relaxed">
              En el panorama actual de ciberseguridad, las organizaciones enfrentan amenazas cada vez mas sofisticadas: ransomware, phishing, ataques de dia cero, brechas de datos y amenazas internas. Segun estadisticas recientes:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-destructive">43%</p>
                <p className="text-sm text-muted-foreground">de ciberataques afectan a PYMES</p>
              </div>
              <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-warning">$4.45M</p>
                <p className="text-sm text-muted-foreground">costo promedio de una brecha de datos</p>
              </div>
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-primary">277 dias</p>
                <p className="text-sm text-muted-foreground">tiempo promedio para detectar una brecha</p>
              </div>
            </div>
            <p className="text-justify leading-relaxed">
              Un sistema estructurado de gestion de riesgos permite anticiparse a estas amenazas, priorizar recursos de seguridad y demostrar debida diligencia ante reguladores, clientes y socios comerciales.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">1.3 Beneficiarios del Sistema</h3>
            <table className="w-full border-collapse border border-border mt-4">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-2 text-left">Rol</th>
                  <th className="border border-border p-2 text-left">Beneficio Principal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-2 font-medium">CISO / Director de Seguridad</td>
                  <td className="border border-border p-2">Vision integral del perfil de riesgo organizacional</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Analistas de Seguridad</td>
                  <td className="border border-border p-2">Herramienta operativa para gestion diaria</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Auditores Internos</td>
                  <td className="border border-border p-2">Evidencia documentada para auditorias</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Alta Direccion</td>
                  <td className="border border-border p-2">Reportes ejecutivos para toma de decisiones</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Oficial de Cumplimiento</td>
                  <td className="border border-border p-2">Trazabilidad de controles ISO</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Para qué sirve */}
          <section className="mb-12 print:page-break-before">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">2. Para Que Sirve el Sistema</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Proposito Principal</h3>
            <p className="text-justify leading-relaxed">
              El proposito fundamental de CyberRisk Manager es <strong>sistematizar el proceso de gestion de riesgos de seguridad de la informacion</strong>, transformando una actividad tradicionalmente manual y dispersa en un proceso estructurado, repetible y auditable.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Funciones Principales</h3>
            
            <div className="space-y-6 mt-4">
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                  Gestion de Activos de Informacion
                </h4>
                <p className="text-justify leading-relaxed text-muted-foreground">
                  Permite mantener un inventario completo de todos los activos de informacion criticos de la organizacion (servidores, aplicaciones, bases de datos, documentos, etc.), clasificandolos por categorias y asignando valores de criticidad basados en la triada CIA (Confidencialidad, Integridad, Disponibilidad).
                </p>
                <div className="mt-2 text-sm">
                  <strong>Casos de uso:</strong>
                  <ul className="list-disc pl-6 mt-1">
                    <li>Crear categorias como "Servidores de Produccion", "Datos de Clientes", "Propiedad Intelectual"</li>
                    <li>Registrar cada servidor con su ubicacion, propietario y criticidad</li>
                    <li>Valorar que tan critico es cada activo para el negocio</li>
                  </ul>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                  Identificacion de Amenazas y Vulnerabilidades
                </h4>
                <p className="text-justify leading-relaxed text-muted-foreground">
                  Facilita la documentacion de amenazas potenciales (tanto externas como internas) y vulnerabilidades tecnicas u organizacionales que podrian ser explotadas para comprometer la seguridad.
                </p>
                <div className="mt-2 text-sm">
                  <strong>Casos de uso:</strong>
                  <ul className="list-disc pl-6 mt-1">
                    <li>Registrar amenazas como "Ransomware", "Ingeniera Social", "Desastres Naturales"</li>
                    <li>Documentar vulnerabilidades encontradas en auditorias o escaneos</li>
                    <li>Asociar vulnerabilidades con los activos afectados</li>
                  </ul>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                  Evaluacion y Calculo de Riesgos
                </h4>
                <p className="text-justify leading-relaxed text-muted-foreground">
                  Implementa una metodologia cuantitativa para calcular el nivel de riesgo inherente de cada escenario, considerando la probabilidad de ocurrencia, el impacto potencial y la criticidad del activo afectado.
                </p>
                <div className="mt-2 text-sm">
                  <strong>Formula:</strong>
                  <div className="bg-muted p-2 rounded mt-1 font-mono text-center">
                    Riesgo Inherente = Probabilidad x Impacto x Criticidad
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                  Tratamiento de Riesgos
                </h4>
                <p className="text-justify leading-relaxed text-muted-foreground">
                  Permite definir planes de accion para cada riesgo identificado, seleccionando estrategias de tratamiento (mitigar, transferir, aceptar, evitar) y asignando controles del catalogo ISO 27002:2022.
                </p>
                <div className="mt-2 text-sm">
                  <strong>Estrategias disponibles:</strong>
                  <ul className="list-disc pl-6 mt-1">
                    <li><strong>Mitigar:</strong> Implementar controles para reducir probabilidad o impacto</li>
                    <li><strong>Transferir:</strong> Contratar seguros o externalizar la responsabilidad</li>
                    <li><strong>Aceptar:</strong> Asumir el riesgo cuando el costo de tratamiento es mayor</li>
                    <li><strong>Evitar:</strong> Eliminar la actividad que genera el riesgo</li>
                  </ul>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
                  Calculo de Riesgo Residual
                </h4>
                <p className="text-justify leading-relaxed text-muted-foreground">
                  Calcula automaticamente el riesgo que permanece despues de aplicar los controles de tratamiento, considerando la efectividad de cada control implementado.
                </p>
                <div className="mt-2 text-sm">
                  <strong>Formula:</strong>
                  <div className="bg-muted p-2 rounded mt-1 font-mono text-center">
                    Riesgo Residual = Riesgo Inherente x (1 - Efectividad del Control)
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">6</span>
                  Monitoreo Continuo
                </h4>
                <p className="text-justify leading-relaxed text-muted-foreground">
                  Proporciona mecanismos para registrar actividades de seguimiento periodico, documentar hallazgos de auditorias e incidentes, y mantener un historico de la evolucion del perfil de riesgo.
                </p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">7</span>
                  Generacion de Reportes
                </h4>
                <p className="text-justify leading-relaxed text-muted-foreground">
                  Permite crear informes ejecutivos profesionales con secciones personalizables, listos para presentar a la direccion, auditorias externas o entes reguladores.
                </p>
              </div>
            </div>
          </section>

          {/* Módulos del Sistema */}
          <section className="mb-12 print:page-break-before">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">3. Modulos del Sistema</h2>
            
            <p className="text-justify leading-relaxed mb-6">
              El sistema esta organizado en seis modulos funcionales que cubren todo el ciclo de vida de la gestion de riesgos:
            </p>

            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Modulo 1: Dashboard</h4>
                <p className="text-sm text-muted-foreground mb-2">Panel de control con vision ejecutiva del estado de seguridad</p>
                <ul className="list-disc pl-6 text-sm space-y-1">
                  <li>Estadisticas clave: total de activos, riesgos, controles implementados</li>
                  <li>Matriz de riesgos visual con codigo de colores</li>
                  <li>Distribucion de riesgos por nivel (critico, alto, medio, bajo)</li>
                  <li>Actividad reciente y alertas pendientes</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Modulo 2: Activos</h4>
                <p className="text-sm text-muted-foreground mb-2">Gestion completa del inventario de activos de informacion</p>
                <ul className="list-disc pl-6 text-sm space-y-1">
                  <li><strong>Categorias:</strong> Clasificacion de tipos de activos</li>
                  <li><strong>Inventario:</strong> Registro detallado de cada activo</li>
                  <li><strong>Valoracion:</strong> Asignacion de valores CIA y criticidad</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Modulo 3: Riesgos</h4>
                <p className="text-sm text-muted-foreground mb-2">Identificacion y evaluacion de escenarios de riesgo</p>
                <ul className="list-disc pl-6 text-sm space-y-1">
                  <li><strong>Amenazas:</strong> Catalogo de amenazas potenciales</li>
                  <li><strong>Vulnerabilidades:</strong> Debilidades identificadas en activos</li>
                  <li><strong>Controles Existentes:</strong> Medidas de seguridad actuales</li>
                  <li><strong>Matriz de Riesgos:</strong> Evaluacion y calculo de riesgo inherente</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Modulo 4: Tratamiento</h4>
                <p className="text-sm text-muted-foreground mb-2">Planificacion e implementacion de respuestas a riesgos</p>
                <ul className="list-disc pl-6 text-sm space-y-1">
                  <li><strong>Controles ISO:</strong> Catalogo completo ISO 27002:2022</li>
                  <li><strong>Plan de Tratamiento:</strong> Definicion de acciones por riesgo</li>
                  <li><strong>Implementacion:</strong> Seguimiento del estado de cada plan</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Modulo 5: Riesgo Residual</h4>
                <p className="text-sm text-muted-foreground mb-2">Evaluacion post-tratamiento y seguimiento continuo</p>
                <ul className="list-disc pl-6 text-sm space-y-1">
                  <li><strong>Calculo:</strong> Determinacion automatica de riesgo residual</li>
                  <li><strong>Monitoreo:</strong> Registro de actividades de seguimiento</li>
                  <li><strong>Observaciones:</strong> Hallazgos de auditorias e incidentes</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Modulo 6: Reportes</h4>
                <p className="text-sm text-muted-foreground mb-2">Documentacion y comunicacion de resultados</p>
                <ul className="list-disc pl-6 text-sm space-y-1">
                  <li><strong>Generar Reporte:</strong> Creacion de informes personalizados</li>
                  <li><strong>Historial:</strong> Archivo de reportes generados</li>
                  <li><strong>Plantillas:</strong> Configuraciones reutilizables</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Alineación con Estándares */}
          <section className="mb-12 print:page-break-before">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">4. Alineacion con Estandares Internacionales</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">4.1 ISO/IEC 27001:2022</h3>
            <p className="text-justify leading-relaxed">
              El sistema implementa los requisitos de la clausula 6.1.2 "Evaluacion de riesgos de seguridad de la informacion" y 6.1.3 "Tratamiento de riesgos de seguridad de la informacion", proporcionando:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Metodologia de evaluacion de riesgos documentada y repetible</li>
              <li>Criterios de aceptacion de riesgos basados en niveles</li>
              <li>Proceso de tratamiento de riesgos con opciones estandarizadas</li>
              <li>Registros de evidencia para auditorias de certificacion</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.2 ISO/IEC 27002:2022</h3>
            <p className="text-justify leading-relaxed">
              El sistema incluye el catalogo completo de 93 controles de seguridad organizados en 4 temas:
            </p>
            <table className="w-full border-collapse border border-border mt-4">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-2 text-left">Clausula</th>
                  <th className="border border-border p-2 text-left">Tema</th>
                  <th className="border border-border p-2 text-center">Controles</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-2">5</td>
                  <td className="border border-border p-2">Controles Organizacionales</td>
                  <td className="border border-border p-2 text-center">37</td>
                </tr>
                <tr>
                  <td className="border border-border p-2">6</td>
                  <td className="border border-border p-2">Controles de Personas</td>
                  <td className="border border-border p-2 text-center">8</td>
                </tr>
                <tr>
                  <td className="border border-border p-2">7</td>
                  <td className="border border-border p-2">Controles Fisicos</td>
                  <td className="border border-border p-2 text-center">14</td>
                </tr>
                <tr>
                  <td className="border border-border p-2">8</td>
                  <td className="border border-border p-2">Controles Tecnologicos</td>
                  <td className="border border-border p-2 text-center">34</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.3 Otras Normativas Compatibles</h3>
            <p className="text-justify leading-relaxed">
              La estructura del sistema facilita el cumplimiento de otras normativas de seguridad y privacidad:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>GDPR:</strong> Evaluaciones de impacto de privacidad (DPIA)</li>
              <li><strong>NIST CSF:</strong> Marco de ciberseguridad con funciones Identify, Protect, Detect, Respond, Recover</li>
              <li><strong>SOC 2:</strong> Controles de seguridad, disponibilidad y confidencialidad</li>
              <li><strong>PCI DSS:</strong> Requisitos de seguridad para datos de tarjetas de pago</li>
            </ul>
          </section>

          {/* Valor para la Organización */}
          <section className="mb-12 print:page-break-before">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">5. Valor para la Organizacion</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">Reduccion de Incidentes</h4>
                <p className="text-sm text-muted-foreground">
                  La identificacion proactiva de vulnerabilidades y la implementacion de controles reduce significativamente la probabilidad de sufrir brechas de seguridad.
                </p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">Optimizacion de Recursos</h4>
                <p className="text-sm text-muted-foreground">
                  La priorizacion basada en niveles de riesgo permite enfocar inversiones de seguridad donde generan mayor impacto.
                </p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">Cumplimiento Normativo</h4>
                <p className="text-sm text-muted-foreground">
                  La documentacion estructurada facilita auditorias y demuestra debida diligencia ante reguladores.
                </p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">Mejora Continua</h4>
                <p className="text-sm text-muted-foreground">
                  El monitoreo continuo y la trazabilidad historica permiten medir la evolucion del perfil de riesgo.
                </p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">Comunicacion Ejecutiva</h4>
                <p className="text-sm text-muted-foreground">
                  Los reportes profesionales traducen informacion tecnica en metricas de negocio para la alta direccion.
                </p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">Confianza de Stakeholders</h4>
                <p className="text-sm text-muted-foreground">
                  Un sistema formal de gestion de riesgos genera confianza en clientes, socios e inversores.
                </p>
              </div>
            </div>
          </section>

          {/* Glosario */}
          <section className="mb-12 print:page-break-before">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">6. Glosario de Terminos</h2>
            
            <dl className="space-y-3">
              <div>
                <dt className="font-semibold">Activo de Informacion</dt>
                <dd className="text-muted-foreground pl-4">Cualquier elemento que tiene valor para la organizacion: datos, sistemas, hardware, software, personas, instalaciones.</dd>
              </div>
              <div>
                <dt className="font-semibold">Amenaza</dt>
                <dd className="text-muted-foreground pl-4">Causa potencial de un incidente no deseado que puede resultar en dano a un sistema u organizacion.</dd>
              </div>
              <div>
                <dt className="font-semibold">Vulnerabilidad</dt>
                <dd className="text-muted-foreground pl-4">Debilidad de un activo o control que puede ser explotada por una o mas amenazas.</dd>
              </div>
              <div>
                <dt className="font-semibold">Riesgo Inherente</dt>
                <dd className="text-muted-foreground pl-4">Nivel de riesgo antes de aplicar cualquier control o medida de mitigacion.</dd>
              </div>
              <div>
                <dt className="font-semibold">Riesgo Residual</dt>
                <dd className="text-muted-foreground pl-4">Nivel de riesgo que permanece despues de aplicar los controles de tratamiento.</dd>
              </div>
              <div>
                <dt className="font-semibold">Control de Seguridad</dt>
                <dd className="text-muted-foreground pl-4">Medida que modifica el riesgo, incluyendo politicas, procedimientos, practicas y estructuras organizacionales.</dd>
              </div>
              <div>
                <dt className="font-semibold">CIA (Triada)</dt>
                <dd className="text-muted-foreground pl-4">Confidencialidad, Integridad y Disponibilidad: los tres pilares de la seguridad de la informacion.</dd>
              </div>
              <div>
                <dt className="font-semibold">ISO 27001</dt>
                <dd className="text-muted-foreground pl-4">Estandar internacional para sistemas de gestion de seguridad de la informacion (SGSI).</dd>
              </div>
              <div>
                <dt className="font-semibold">ISO 27002</dt>
                <dd className="text-muted-foreground pl-4">Guia de buenas practicas que describe objetivos de control y controles recomendados.</dd>
              </div>
            </dl>
          </section>

          {/* Pie de documento */}
          <footer className="mt-16 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>CyberRisk Manager - Descripcion del Sistema v1.0</p>
            <p>Documento generado el {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </footer>
        </article>
      </div>

      {/* Estilos de impresión */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:page-break-before {
            page-break-before: always;
          }
          @page {
            margin: 1.5cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
