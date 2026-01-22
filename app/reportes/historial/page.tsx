"use client";

import { AppLayout } from "@/components/app-layout";
import { ReportHistoryContent } from "@/components/reportes/report-history-content";

export default function ReportHistoryPage() {
  return (
    <AppLayout
      title="Historial de Reportes"
      description="Consulta los reportes generados anteriormente"
    >
      <ReportHistoryContent />
    </AppLayout>
  );
}
