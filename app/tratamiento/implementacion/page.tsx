import { AppLayout } from "@/components/app-layout"
import { ImplementationContent } from "@/components/tratamiento/implementation-content"

export default function ImplementacionPage() {
  return (
    <AppLayout
      title="Estado de Implementacion"
      breadcrumbs={[
        { label: "Tratamiento de Riesgos", href: "/tratamiento" },
        { label: "Implementacion" },
      ]}
    >
      <ImplementationContent />
    </AppLayout>
  )
}
