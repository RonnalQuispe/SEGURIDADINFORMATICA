import { AppLayout } from "@/components/app-layout"
import { ObservationsContent } from "@/components/residual/observations-content"

export default function ObservacionesPage() {
  return (
    <AppLayout
      title="Observaciones"
      breadcrumbs={[
        { label: "Riesgo Residual", href: "/residual" },
        { label: "Observaciones" },
      ]}
    >
      <ObservationsContent />
    </AppLayout>
  )
}
