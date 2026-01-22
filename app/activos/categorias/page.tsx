import { AppLayout } from "@/components/app-layout"
import { CategoriesContent } from "@/components/activos/categories-content"

export default function CategoriasPage() {
  return (
    <AppLayout
      title="Categorias de Activos"
      breadcrumbs={[
        { label: "Valoracion de Activos", href: "/activos" },
        { label: "Categorias" },
      ]}
    >
      <CategoriesContent />
    </AppLayout>
  )
}
