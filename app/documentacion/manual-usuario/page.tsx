"use client";

import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ManualUsuarioPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header con botones - se oculta al imprimir */}
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
          <div className="text-center mb-16 print:mb-8 page-break-after">
            <div className="mb-8">
              <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                <svg className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">CyberSeg Manager</h1>
            <h2 className="text-2xl text-muted-foreground mb-8">Manual de Usuario</h2>
            <div className="text-sm text-muted-foreground">
              <p>Version 1.0</p>
              <p>Enero 2026</p>
            </div>
          </div>

          {/* Página 1: Introducción */}
          <section className="mb-12 print:page-break-before">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">1. Introduccion</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">1.1 Proposito del Sistema</h3>
            <p className="text-justify leading-relaxed">
              CyberSeg Manager es un sistema integral de gestion de riesgos ciberneticos disenado para ayudar a las organizaciones a identificar, evaluar, tratar y monitorear los riesgos de seguridad de la informacion de manera sistematica y conforme a los estandares internacionales ISO 27001 e ISO 27002:2022.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">1.2 Alcance</h3>
            <p className="text-justify leading-relaxed">
              Este manual proporciona instrucciones detalladas para utilizar todas las funcionalidades del sistema, incluyendo:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Gestion y valoracion de activos de informacion</li>
              <li>Identificacion de amenazas y vulnerabilidades</li>
              <li>Evaluacion y calculo de riesgos</li>
              <li>Planes de tratamiento de riesgos</li>
              <li>Monitoreo y seguimiento continuo</li>
              <li>Generacion de reportes ejecutivos</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">1.3 Navegacion Principal</h3>
            <p className="text-justify leading-relaxed">
              El sistema cuenta con un menu lateral izquierdo que organiza todas las funcionalidades en seis modulos principales:
            </p>
            <table className="w-full border-collapse border border-border mt-4">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-2 text-left">Modulo</th>
                  <th className="border border-border p-2 text-left">Descripcion</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-2 font-medium">Dashboard</td>
                  <td className="border border-border p-2">Vista general con metricas e indicadores clave</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Activos</td>
                  <td className="border border-border p-2">Inventario y valoracion de activos</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Riesgos</td>
                  <td className="border border-border p-2">Amenazas, vulnerabilidades y matriz de riesgos</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Tratamiento</td>
                  <td className="border border-border p-2">Controles ISO y planes de tratamiento</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Residual</td>
                  <td className="border border-border p-2">Calculo de riesgo residual y monitoreo</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Reportes</td>
                  <td className="border border-border p-2">Generacion de informes y documentacion</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Página 2: Módulo de Activos */}
          <section className="mb-12 print:page-break-before">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">2. Modulo de Activos</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Categorias de Activos</h3>
            <p className="text-justify leading-relaxed">
              Antes de registrar activos, debe definir las categorias que los agruparan. Acceda a <strong>Activos → Categorias</strong> y utilice el boton "Nueva Categoria".
            </p>
            <div className="bg-muted p-4 rounded-lg my-4">
              <p className="font-semibold mb-2">Campos requeridos:</p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><strong>Nombre:</strong> Identificador unico de la categoria (ej: "Servidores")</li>
                <li><strong>Descripcion:</strong> Detalle del tipo de activos que incluye</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Inventario de Activos</h3>
            <p className="text-justify leading-relaxed">
              En <strong>Activos → Inventario</strong> registre cada activo de informacion. Complete los siguientes campos:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Nombre:</strong> Identificador del activo</li>
              <li><strong>Categoria:</strong> Seleccione de las categorias previamente creadas</li>
              <li><strong>Propietario:</strong> Responsable del activo</li>
              <li><strong>Ubicacion:</strong> Ubicacion fisica o logica</li>
              <li><strong>Descripcion:</strong> Detalles adicionales del activo</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Valoracion de Activos (CIA)</h3>
            <p className="text-justify leading-relaxed">
              En <strong>Activos → Valoracion</strong> asigne valores a cada dimension de seguridad:
            </p>
            <table className="w-full border-collapse border border-border mt-4">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-2 text-left">Dimension</th>
                  <th className="border border-border p-2 text-left">Descripcion</th>
                  <th className="border border-border p-2 text-center">Escala</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-2 font-medium">Confidencialidad</td>
                  <td className="border border-border p-2">Proteccion contra acceso no autorizado</td>
                  <td className="border border-border p-2 text-center">1-5</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Integridad</td>
                  <td className="border border-border p-2">Exactitud y completitud de la informacion</td>
                  <td className="border border-border p-2 text-center">1-5</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Disponibilidad</td>
                  <td className="border border-border p-2">Accesibilidad cuando se requiere</td>
                  <td className="border border-border p-2 text-center">1-5</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-muted-foreground mt-2">
              El sistema calcula automaticamente la <strong>criticidad</strong> como el promedio de las tres dimensiones.
            </p>
          </section>

          {/* Página 3: Identificación de Riesgos */}
          <section className="mb-12 print:page-break-before">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">3. Identificacion de Riesgos</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Registro de Amenazas</h3>
            <p className="text-justify leading-relaxed">
              En <strong>Riesgos → Amenazas</strong> documente las amenazas potenciales. Cada amenaza requiere:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Nombre:</strong> Identificador de la amenaza</li>
              <li><strong>Categoria:</strong> Natural, Humana Intencional, Humana No Intencional, Tecnica, Ambiental</li>
              <li><strong>Descripcion:</strong> Detalle de la amenaza</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Registro de Vulnerabilidades</h3>
            <p className="text-justify leading-relaxed">
              En <strong>Riesgos → Vulnerabilidades</strong> registre las debilidades identificadas:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Nombre:</strong> Identificador de la vulnerabilidad</li>
              <li><strong>Severidad:</strong> Critica, Alta, Media, Baja</li>
              <li><strong>Activo Afectado:</strong> Vincule con el inventario</li>
              <li><strong>Descripcion:</strong> Detalle tecnico</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.3 Controles Existentes</h3>
            <p className="text-justify leading-relaxed">
              En <strong>Riesgos → Controles Existentes</strong> documente las medidas de seguridad actuales, indicando su tipo (Preventivo, Detectivo, Correctivo) y efectividad (0-100%).
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.4 Matriz de Riesgos</h3>
            <p className="text-justify leading-relaxed">
              En <strong>Riesgos → Matriz de Riesgos</strong> cree escenarios de riesgo combinando:
            </p>
            <div className="bg-muted p-4 rounded-lg my-4">
              <p className="font-semibold mb-2">Formula de Riesgo Inherente:</p>
              <p className="font-mono text-center py-2 bg-background rounded">
                Riesgo = Probabilidad × Impacto × Criticidad del Activo
              </p>
            </div>
            <p className="text-justify leading-relaxed">
              El sistema clasifica automaticamente los riesgos como: <span className="text-red-600 font-semibold">Critico</span>, <span className="text-orange-600 font-semibold">Alto</span>, <span className="text-yellow-600 font-semibold">Medio</span> o <span className="text-green-600 font-semibold">Bajo</span>.
            </p>
          </section>

          {/* Página 4: Tratamiento de Riesgos */}
          <section className="mb-12 print:page-break-before">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">4. Tratamiento de Riesgos</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Catalogo de Controles ISO 27002:2022</h3>
            <p className="text-justify leading-relaxed">
              En <strong>Tratamiento → Controles ISO</strong> consulte y gestione el catalogo completo de controles organizados por clausulas:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>5. Controles Organizacionales</li>
              <li>6. Controles de Personas</li>
              <li>7. Controles Fisicos</li>
              <li>8. Controles Tecnologicos</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Plan de Tratamiento</h3>
            <p className="text-justify leading-relaxed">
              En <strong>Tratamiento → Plan de Tratamiento</strong> defina las acciones para cada riesgo:
            </p>
            <table className="w-full border-collapse border border-border mt-4">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-2 text-left">Estrategia</th>
                  <th className="border border-border p-2 text-left">Descripcion</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-2 font-medium">Mitigar</td>
                  <td className="border border-border p-2">Implementar controles para reducir probabilidad/impacto</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Transferir</td>
                  <td className="border border-border p-2">Trasladar el riesgo a un tercero (seguros, outsourcing)</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Aceptar</td>
                  <td className="border border-border p-2">Asumir el riesgo cuando el costo de tratamiento es mayor</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Evitar</td>
                  <td className="border border-border p-2">Eliminar la actividad que genera el riesgo</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.3 Seguimiento de Implementacion</h3>
            <p className="text-justify leading-relaxed">
              En <strong>Tratamiento → Implementacion</strong> monitoree el progreso de cada plan con estados: Pendiente, En Progreso, Completado, Cancelado.
            </p>
          </section>

          {/* Página 5: Monitoreo y Reportes */}
          <section className="mb-12 print:page-break-before">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">5. Monitoreo y Reportes</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Calculo de Riesgo Residual</h3>
            <p className="text-justify leading-relaxed">
              En <strong>Residual → Calculo</strong> el sistema determina automaticamente el riesgo residual considerando la efectividad de los controles implementados:
            </p>
            <div className="bg-muted p-4 rounded-lg my-4">
              <p className="font-semibold mb-2">Formula:</p>
              <p className="font-mono text-center py-2 bg-background rounded">
                Riesgo Residual = Riesgo Inherente × (1 - Efectividad del Control)
              </p>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Monitoreo Continuo</h3>
            <p className="text-justify leading-relaxed">
              En <strong>Residual → Monitoreo</strong> registre actividades de seguimiento periodico y documente cambios en el perfil de riesgo.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.3 Observaciones y Hallazgos</h3>
            <p className="text-justify leading-relaxed">
              En <strong>Residual → Observaciones</strong> registre hallazgos de auditorias, incidentes o revisiones con su criticidad y estado de seguimiento.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.4 Generacion de Reportes</h3>
            <p className="text-justify leading-relaxed">
              En <strong>Reportes → Generar Reporte</strong> cree informes ejecutivos personalizados:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mt-4">
              <li>Seleccione las secciones a incluir (maximo 10 disponibles)</li>
              <li>Configure el titulo y descripcion del reporte</li>
              <li>Utilice "Vista Previa" para revisar el contenido</li>
              <li>Haga clic en "Imprimir / Guardar PDF" para exportar</li>
            </ol>

            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg mt-6">
              <p className="font-semibold text-primary mb-2">Consejo:</p>
              <p className="text-sm">
                Guarde configuraciones frecuentes como plantillas para agilizar la generacion de reportes periodicos.
              </p>
            </div>
          </section>

          {/* Pie de documento */}
          <footer className="mt-16 pt-8 border-t border-border text-center text-sm text-muted-foreground print:mt-8">
            <p>CyberSeg Manager - Manual de Usuario v1.0</p>
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
          .page-break-after {
            page-break-after: always;
          }
          @page {
            margin: 2cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
