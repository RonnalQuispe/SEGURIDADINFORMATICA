"use client";

import { AppLayout } from "@/components/app-layout";
import { ReportsContent } from "@/components/reportes/reports-content";

export default function ReportsPage() {
  return (
    <AppLayout
      title="Generador de Reportes"
      description="Genera reportes profesionales de gestion de riesgos en multiples formatos"
    >
      <ReportsContent />
    </AppLayout>
  );
}
