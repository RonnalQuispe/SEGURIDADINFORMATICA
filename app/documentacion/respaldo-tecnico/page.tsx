"use client";

import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RespaldoTecnicoPage() {
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
            <h2 className="text-2xl text-muted-foreground mb-8">Documento de Respaldo Tecnico</h2>
            <div className="text-sm text-muted-foreground">
              <p>Version 1.0</p>
              <p>Enero 2026</p>
            </div>
          </div>

          {/* Índice */}
          <section className="mb-12 print:page-break-after">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">Indice</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Diagrama de Arquitectura del Sistema</li>
              <li>Explicacion del Desarrollo y Herramientas Utilizadas</li>
              <li>Estructura de la Base de Datos</li>
              <li>Conclusiones</li>
              <li>Recomendaciones</li>
            </ol>
          </section>

          {/* Sección 1: Diagrama de Arquitectura */}
          <section className="mb-12 print:page-break-before">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">1. Diagrama de Arquitectura del Sistema</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">1.1 Arquitectura General</h3>
            <p className="text-justify leading-relaxed mb-6">
              CyberRisk Manager implementa una arquitectura moderna de tres capas basada en el patron de aplicaciones web serverless, optimizada para escalabilidad, rendimiento y seguridad.
            </p>

           
           {/* Container for the Architecture Image */}
<div className="bg-muted p-6 rounded-lg mb-6 flex justify-center">
  <img 
    src="/arquitectura.png" 
    alt="Diagrama de Arquitectura" 
    className="max-w-full h-auto rounded-md shadow-sm"
  />
</div>
           
           

            <h3 className="text-xl font-semibold mt-6 mb-3">1.2 Componentes Principales</h3>
            <table className="w-full border-collapse border border-border mt-4">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-2 text-left">Componente</th>
                  <th className="border border-border p-2 text-left">Tecnologia</th>
                  <th className="border border-border p-2 text-left">Funcion</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-2">Frontend</td>
                  <td className="border border-border p-2">Next.js 16 + React 19</td>
                  <td className="border border-border p-2">Interfaz de usuario interactiva</td>
                </tr>
                <tr>
                  <td className="border border-border p-2">Estilos</td>
                  <td className="border border-border p-2">Tailwind CSS v4</td>
                  <td className="border border-border p-2">Sistema de diseno responsive</td>
                </tr>
                <tr>
                  <td className="border border-border p-2">Componentes UI</td>
                  <td className="border border-border p-2">shadcn/ui + Radix</td>
                  <td className="border border-border p-2">Componentes accesibles</td>
                </tr>
                <tr>
                  <td className="border border-border p-2">Graficos</td>
                  <td className="border border-border p-2">Recharts</td>
                  <td className="border border-border p-2">Visualizaciones de datos</td>
                </tr>
                <tr>
                  <td className="border border-border p-2">Base de Datos</td>
                  <td className="border border-border p-2">Supabase (PostgreSQL)</td>
                  <td className="border border-border p-2">Almacenamiento persistente</td>
                </tr>
                
              </tbody>
            </table>
          </section>

          {/* Sección 2: Desarrollo y Herramientas */}
          <section className="mb-12 print:page-break-before">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">2. Explicacion del Desarrollo y Herramientas Utilizadas</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Stack Tecnologico</h3>
            
            <h4 className="text-lg font-semibold mt-4 mb-2">Frontend</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Next.js 16:</strong> Framework React de produccion con soporte para Server Components, Server Actions y renderizado hibrido (SSR/SSG/ISR). Proporciona enrutamiento basado en archivos, optimizacion automatica y excelente DX.
              </li>
              <li>
                <strong>React 19:</strong> Biblioteca de UI con las ultimas caracteristicas como useEffectEvent, Activity components y mejoras de rendimiento en la reconciliacion.
              </li>
              <li>
                <strong>TypeScript:</strong> Superset de JavaScript que agrega tipado estatico, mejorando la mantenibilidad y reduciendo errores en tiempo de desarrollo.
              </li>
              <li>
                <strong>Tailwind CSS v4:</strong> Framework CSS utility-first que permite diseno rapido y consistente mediante clases atomicas.
              </li>
            </ul>

            <h4 className="text-lg font-semibold mt-4 mb-2">Componentes UI</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>shadcn/ui:</strong> Coleccion de componentes React reutilizables construidos sobre Radix UI, completamente accesibles y personalizables.
              </li>
              <li>
                <strong>Radix UI:</strong> Primitivos de UI sin estilos que proporcionan comportamiento y accesibilidad WCAG AAA.
              </li>
              <li>
                <strong>Lucide React:</strong> Biblioteca de iconos SVG optimizados y consistentes.
              </li>
              <li>
                <strong>Recharts:</strong> Biblioteca de graficos basada en React y D3 para visualizaciones interactivas.
              </li>
            </ul>

            <h4 className="text-lg font-semibold mt-4 mb-2">Backend y Base de Datos</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Supabase:</strong> Plataforma Backend-as-a-Service que proporciona base de datos PostgreSQL, autenticacion, almacenamiento y APIs automaticas.
              </li>
              <li>
                <strong>PostgreSQL:</strong> Sistema de gestion de base de datos relacional robusto con soporte para JSON, funciones y triggers.
              </li>
              <li>
                <strong>Row Level Security (RLS):</strong> Politicas de seguridad a nivel de fila que garantizan aislamiento de datos.
              </li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Metodologia de Desarrollo</h3>
            <p className="text-justify leading-relaxed">
              El desarrollo siguio un enfoque iterativo e incremental, priorizando:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mt-4">
              <li><strong>Diseno de esquema de datos:</strong> Modelado de entidades y relaciones segun requisitos ISO 27001/27002</li>
              <li><strong>Implementacion de infraestructura:</strong> Configuracion de Supabase y migraciones SQL</li>
              <li><strong>Desarrollo de componentes:</strong> Construccion modular de UI siguiendo principios de composicion</li>
              <li><strong>Integracion de datos:</strong> Conexion frontend-backend mediante Supabase Client</li>
              <li><strong>Validacion y pruebas:</strong> Verificacion de funcionalidad CRUD y flujos de usuario</li>
            </ol>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Patrones de Diseno Implementados</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Component Composition:</strong> Componentes pequenos y reutilizables que se combinan para formar interfaces complejas</li>
              <li><strong>Server Components:</strong> Renderizado en servidor para mejor SEO y rendimiento inicial</li>
              <li><strong>Controlled Forms:</strong> Formularios con estado gestionado para validacion en tiempo real</li>
              <li><strong>Repository Pattern:</strong> Abstraccion de acceso a datos mediante funciones de Supabase</li>
            </ul>
          </section>

          {/* Sección 3: Estructura de Base de Datos */}
          <section className="mb-12 print:page-break-before">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">3. Estructura de la Base de Datos</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Diagrama Entidad-Relacion</h3>
            
            <div className="bg-muted p-6 rounded-lg font-mono text-xs overflow-x-auto mb-6">
              <pre className="whitespace-pre text-foreground">{`
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ asset_categories│       │     assets      │       │ vulnerabilities │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │──┐    │ id (PK)         │
│ name            │  │    │ category_id(FK) │◄─┘    │ asset_id (FK)   │◄─┐
│ description     │  │    │ name            │       │ name            │  │
│ created_at      │  └───►│ owner           │       │ severity        │  │
└─────────────────┘       │ location        │       │ description     │  │
                          │ description     │       │ created_at      │  │
                          │ confidentiality │       └────────┬────────┘  │
                          │ integrity       │                │           │
                          │ availability    │                │           │
                          │ criticality     │◄───────────────┼───────────┘
                          │ created_at      │                │
                          └────────┬────────┘                │
                                   │                         │
                                   ▼                         │
┌─────────────────┐       ┌─────────────────┐               │
│    threats      │       │     risks       │               │
├─────────────────┤       ├─────────────────┤               │
│ id (PK)         │──┐    │ id (PK)         │◄──────────────┘
│ name            │  │    │ asset_id (FK)   │
│ category        │  │    │ threat_id (FK)  │◄──────────────┐
│ description     │  └───►│ vulnerability_id│               │
│ created_at      │       │ probability     │               │
└─────────────────┘       │ impact          │               │
                          │ inherent_risk   │               │
                          │ risk_level      │               │
                          │ created_at      │               │
                          └────────┬────────┘               │
                                   │                        │
                                   ▼                        │
┌─────────────────┐       ┌─────────────────┐       ┌───────┴─────────┐
│  iso_controls   │       │ risk_treatments │       │existing_controls│
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │       │ id (PK)         │
│ clause          │  │    │ risk_id (FK)    │◄──┐   │ name            │
│ control_id      │  │    │ iso_control_id  │◄──┼───│ type            │
│ name            │  └───►│ strategy        │   │   │ effectiveness   │
│ description     │       │ responsible     │   │   │ risk_id (FK)    │◄─┐
│ created_at      │       │ due_date        │   │   │ description     │  │
└─────────────────┘       │ status          │   │   │ created_at      │  │
                          │ created_at      │   │   └─────────────────┘  │
                          └────────┬────────┘   │                        │
                                   │            │                        │
                                   ▼            │                        │
┌─────────────────┐       ┌─────────────────┐   │   ┌─────────────────┐  │
│ monitoring_logs │       │ residual_risks  │   │   │  observations   │  │
├─────────────────┤       ├─────────────────┤   │   ├─────────────────┤  │
│ id (PK)         │       │ id (PK)         │   │   │ id (PK)         │  │
│ risk_id (FK)    │◄──────│ risk_id (FK)    │◄──┘   │ risk_id (FK)    │◄─┘
│ activity        │       │ treatment_id    │       │ type            │
│ findings        │       │ residual_prob   │       │ title           │
│ monitored_by    │       │ residual_impact │       │ description     │
│ monitored_at    │       │ residual_risk   │       │ criticality     │
│ next_review     │       │ residual_level  │       │ status          │
│ created_at      │       │ calculated_at   │       │ created_at      │
└─────────────────┘       └─────────────────┘       └─────────────────┘
              `}</pre>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Tablas del Sistema</h3>
            <table className="w-full border-collapse border border-border mt-4 text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-2 text-left">Tabla</th>
                  <th className="border border-border p-2 text-left">Descripcion</th>
                  <th className="border border-border p-2 text-center">Registros Estimados</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-2 font-mono">asset_categories</td>
                  <td className="border border-border p-2">Categorias de activos</td>
                  <td className="border border-border p-2 text-center">10-50</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-mono">assets</td>
                  <td className="border border-border p-2">Inventario de activos con valoracion CIA</td>
                  <td className="border border-border p-2 text-center">100-1000</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-mono">threats</td>
                  <td className="border border-border p-2">Catalogo de amenazas</td>
                  <td className="border border-border p-2 text-center">50-200</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-mono">vulnerabilities</td>
                  <td className="border border-border p-2">Vulnerabilidades identificadas</td>
                  <td className="border border-border p-2 text-center">50-500</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-mono">iso_controls</td>
                  <td className="border border-border p-2">Catalogo ISO 27002:2022</td>
                  <td className="border border-border p-2 text-center">93</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-mono">existing_controls</td>
                  <td className="border border-border p-2">Controles implementados</td>
                  <td className="border border-border p-2 text-center">50-300</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-mono">risks</td>
                  <td className="border border-border p-2">Matriz de riesgos</td>
                  <td className="border border-border p-2 text-center">100-500</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-mono">risk_treatments</td>
                  <td className="border border-border p-2">Planes de tratamiento</td>
                  <td className="border border-border p-2 text-center">100-500</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-mono">residual_risks</td>
                  <td className="border border-border p-2">Riesgos residuales calculados</td>
                  <td className="border border-border p-2 text-center">100-500</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-mono">observations</td>
                  <td className="border border-border p-2">Hallazgos y observaciones</td>
                  <td className="border border-border p-2 text-center">20-200</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-mono">monitoring_logs</td>
                  <td className="border border-border p-2">Registro de monitoreo</td>
                  <td className="border border-border p-2 text-center">100-1000</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-mono">report_configs</td>
                  <td className="border border-border p-2">Configuraciones de reportes</td>
                  <td className="border border-border p-2 text-center">10-50</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Sección 4: Conclusiones */}
          <section className="mb-12 print:page-break-before">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">4. Conclusiones</h2>
            
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">4.1 Cumplimiento de Objetivos</h4>
                <p className="text-justify leading-relaxed">
                  El sistema CyberRisk Manager cumple satisfactoriamente con los objetivos planteados, proporcionando una herramienta integral para la gestion de riesgos ciberneticos alineada con los estandares ISO 27001 e ISO 27002:2022. La implementacion cubre el ciclo completo de gestion de riesgos: identificacion, evaluacion, tratamiento y monitoreo.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">4.2 Fortalezas del Sistema</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Arquitectura moderna y escalable basada en tecnologias de vanguardia</li>
                  <li>Interfaz intuitiva que facilita la adopcion por usuarios no tecnicos</li>
                  <li>Calculos automatizados de riesgo inherente y residual</li>
                  <li>Integracion con catalogo oficial de controles ISO 27002:2022</li>
                  <li>Generacion de reportes profesionales personalizables</li>
                  <li>Base de datos relacional que garantiza integridad referencial</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">4.3 Impacto Esperado</h4>
                <p className="text-justify leading-relaxed">
                  La implementacion de este sistema permitira a las organizaciones sistematizar su proceso de gestion de riesgos, mejorar la toma de decisiones basada en datos, demostrar cumplimiento normativo ante auditorias y reducir la probabilidad de incidentes de seguridad mediante la identificacion proactiva de vulnerabilidades.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">4.4 Lecciones Aprendidas</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>La modularizacion de componentes facilita el mantenimiento y extension del sistema</li>
                  <li>El uso de TypeScript reduce significativamente los errores en tiempo de ejecucion</li>
                  <li>Supabase como BaaS acelera el desarrollo sin sacrificar funcionalidad</li>
                  <li>El diseno mobile-first garantiza usabilidad en multiples dispositivos</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 5: Recomendaciones */}
          <section className="mb-12 print:page-break-before">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">5. Recomendaciones</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Recomendaciones de Implementacion</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong>Capacitacion de Usuarios:</strong> Realizar sesiones de capacitacion para el personal que utilizara el sistema, enfocandose en el flujo completo de gestion de riesgos.
              </li>
              <li>
                <strong>Poblacion Inicial de Datos:</strong> Comenzar con un piloto en un area especifica antes de expandir a toda la organizacion, importando activos criticos primero.
              </li>
              <li>
                <strong>Revision Periodica:</strong> Establecer un calendario de revisiones trimestrales de la matriz de riesgos y actualizacion de controles.
              </li>
              <li>
                <strong>Integracion con SIEM:</strong> Considerar la integracion futura con sistemas de monitoreo de seguridad para alimentar automaticamente el registro de incidentes.
              </li>
            </ol>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Mejoras Futuras Sugeridas</h3>
            <table className="w-full border-collapse border border-border mt-4">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-2 text-left">Mejora</th>
                  <th className="border border-border p-2 text-left">Beneficio</th>
                  <th className="border border-border p-2 text-center">Prioridad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-2">Autenticacion y roles</td>
                  <td className="border border-border p-2">Control de acceso granular</td>
                  <td className="border border-border p-2 text-center">Alta</td>
                </tr>
                <tr>
                  <td className="border border-border p-2">Notificaciones automaticas</td>
                  <td className="border border-border p-2">Alertas de vencimientos y riesgos criticos</td>
                  <td className="border border-border p-2 text-center">Alta</td>
                </tr>
                <tr>
                  <td className="border border-border p-2">Dashboard ejecutivo</td>
                  <td className="border border-border p-2">Metricas KPI para alta direccion</td>
                  <td className="border border-border p-2 text-center">Media</td>
                </tr>
                <tr>
                  <td className="border border-border p-2">Importacion masiva</td>
                  <td className="border border-border p-2">Carga de datos desde Excel/CSV</td>
                  <td className="border border-border p-2 text-center">Media</td>
                </tr>
                <tr>
                  <td className="border border-border p-2">Historial de cambios</td>
                  <td className="border border-border p-2">Auditoria de modificaciones</td>
                  <td className="border border-border p-2 text-center">Media</td>
                </tr>
                <tr>
                  <td className="border border-border p-2">API REST publica</td>
                  <td className="border border-border p-2">Integracion con sistemas externos</td>
                  <td className="border border-border p-2 text-center">Baja</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.3 Mantenimiento del Sistema</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Realizar backups diarios de la base de datos Supabase</li>
              <li>Monitorear el uso de recursos y escalar segun demanda</li>
              <li>Mantener actualizadas las dependencias de seguridad</li>
              <li>Revisar periodicamente las politicas RLS de la base de datos</li>
              <li>Actualizar el catalogo de controles ISO cuando se publiquen nuevas versiones</li>
            </ul>

            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg mt-6">
              <h4 className="font-semibold text-primary mb-2">Nota Final</h4>
              <p className="text-sm text-justify">
                Este sistema representa una base solida para la gestion de riesgos ciberneticos. Su exito dependera del compromiso organizacional con la mejora continua y la actualizacion constante de la informacion de riesgos. Se recomienda designar un responsable de seguridad que lidere la utilizacion del sistema.
              </p>
            </div>
          </section>

          {/* Pie de documento */}
          <footer className="mt-16 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>CyberRisk Manager - Documento de Respaldo Tecnico v1.0</p>
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
          .print\\:page-break-after {
            page-break-after: always;
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
