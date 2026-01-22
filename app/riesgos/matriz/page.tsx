import { AppLayout } from "@/components/app-layout"
import { RiskMatrixContent } from "@/components/riesgos/risk-matrix-content"

export default function MatrizPage() {
  return (
    <AppLayout
      title="Matriz de Riesgos"
      breadcrumbs={[
        { label: "Identificacion de Riesgos", href: "/riesgos" },
        { label: "Matriz de Riesgos" },
      ]}
    >
      <RiskMatrixContent />
    </AppLayout>
  )
}
