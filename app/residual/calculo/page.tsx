import { AppLayout } from "@/components/app-layout"
import { ResidualCalculationContent } from "@/components/residual/residual-calculation-content"

export default function CalculoPage() {
  return (
    <AppLayout
      title="Calculo de Riesgo Residual"
      breadcrumbs={[
        { label: "Riesgo Residual", href: "/residual" },
        { label: "Calculo" },
      ]}
    >
      <ResidualCalculationContent />
    </AppLayout>
  )
}
