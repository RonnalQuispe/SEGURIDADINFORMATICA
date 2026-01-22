import { AppLayout } from "@/components/app-layout"
import { TreatmentPlanContent } from "@/components/tratamiento/treatment-plan-content"

export default function PlanPage() {
  return (
    <AppLayout
      title="Plan de Tratamiento"
      breadcrumbs={[
        { label: "Tratamiento de Riesgos", href: "/tratamiento" },
        { label: "Plan de Tratamiento" },
      ]}
    >
      <TreatmentPlanContent />
    </AppLayout>
  )
}
