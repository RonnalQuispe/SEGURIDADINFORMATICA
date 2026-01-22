import { AppLayout } from "@/components/app-layout"
import { VulnerabilitiesContent } from "@/components/riesgos/vulnerabilities-content"

export default function VulnerabilidadesPage() {
  return (
    <AppLayout
      title="Catalogo de Vulnerabilidades"
      breadcrumbs={[
        { label: "Identificacion de Riesgos", href: "/riesgos" },
        { label: "Vulnerabilidades" },
      ]}
    >
      <VulnerabilitiesContent />
    </AppLayout>
  )
}
