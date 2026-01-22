import { AppLayout } from "@/components/app-layout"
import { ThreatsContent } from "@/components/riesgos/threats-content"

export default function AmenazasPage() {
  return (
    <AppLayout
      title="Catalogo de Amenazas"
      breadcrumbs={[
        { label: "Identificacion de Riesgos", href: "/riesgos" },
        { label: "Amenazas" },
      ]}
    >
      <ThreatsContent />
    </AppLayout>
  )
}
