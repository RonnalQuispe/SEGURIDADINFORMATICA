import { AppLayout } from "@/components/app-layout"
import { MonitoringContent } from "@/components/residual/monitoring-content"

export default function MonitoreoPage() {
  return (
    <AppLayout
      title="Monitoreo de Riesgos"
      breadcrumbs={[
        { label: "Riesgo Residual", href: "/residual" },
        { label: "Monitoreo" },
      ]}
    >
      <MonitoringContent />
    </AppLayout>
  )
}
