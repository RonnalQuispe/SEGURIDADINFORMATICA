import { AppLayout } from "@/components/app-layout"
// ✅ Importamos con llaves { } porque el componente usa "export function"
import { IsoControlsContent } from "@/components/tratamiento/iso-controls-content"

export default function IsoControlesPage() {
  return (
    <AppLayout
      title="Controles ISO 27002:2022"
      breadcrumbs={[
        { label: "Tratamiento de Riesgos", href: "/tratamiento" },
        { label: "Controles ISO 27002" },
      ]}
    >
      {/* ✅ Al renderizarlo aquí, ya no será undefined */}
      <IsoControlsContent />
    </AppLayout>
  )
}