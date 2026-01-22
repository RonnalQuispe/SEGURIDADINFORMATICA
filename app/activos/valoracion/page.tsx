import { AppLayout } from "@/components/app-layout"
import { ValuationContent } from "@/components/activos/valuation-content"

export default function ValoracionPage() {
  return (
    <AppLayout
      title="Valoracion de Activos"
      breadcrumbs={[
        { label: "Valoracion de Activos", href: "/activos" },
        { label: "Valoracion" },
      ]}
    >
      <ValuationContent />
    </AppLayout>
  )
}
