import { AppLayout } from "@/components/app-layout"
import { InventoryContent } from "@/components/activos/inventory-content"

export default function InventarioPage() {
  return (
    <AppLayout
      title="Inventario de Activos"
      breadcrumbs={[
        { label: "Valoracion de Activos", href: "/activos" },
        { label: "Inventario" },
      ]}
    >
      <InventoryContent />
    </AppLayout>
  )
}
