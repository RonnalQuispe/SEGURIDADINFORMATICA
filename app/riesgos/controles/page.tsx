import { AppLayout } from "@/components/app-layout"
import { ExistingControlsContent } from "@/components/riesgos/existing-controls-content"

export default function ControlesPage() {
  return (
    <AppLayout
      title="Controles Existentes"
      breadcrumbs={[
        { label: "Identificacion de Riesgos", href: "/riesgos" },
        { label: "Controles Existentes" },
      ]}
    >
      <ExistingControlsContent />
    </AppLayout>
  )
}
