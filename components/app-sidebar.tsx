"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Server,
  AlertTriangle,
  Shield,
  Activity,
  FileText,
  Settings,
  ChevronDown,
  Database,
  Bug,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Valoracion de Activos",
    url: "/activos",
    icon: Server,
    items: [
      { title: "Categorias", url: "/activos/categorias" },
      { title: "Inventario", url: "/activos/inventario" },
      { title: "Valoracion", url: "/activos/valoracion" },
    ],
  },
  {
    title: "Identificacion de Riesgos",
    url: "/riesgos",
    icon: AlertTriangle,
    items: [
      { title: "Amenazas", url: "/riesgos/amenazas", icon: Bug },
      { title: "Vulnerabilidades", url: "/riesgos/vulnerabilidades", icon: Database },
      { title: "Controles Existentes", url: "/riesgos/controles", icon: Lock },
      { title: "Matriz de Riesgos", url: "/riesgos/matriz" },
    ],
  },
  {
    title: "Tratamiento de Riesgos",
    url: "/tratamiento",
    icon: Shield,
    items: [
      { title: "Controles ISO 27002", url: "/tratamiento/iso-controles" },
      { title: "Plan de Tratamiento", url: "/tratamiento/plan" },
      { title: "Implementacion", url: "/tratamiento/implementacion" },
    ],
  },
  {
    title: "Riesgo Residual",
    url: "/residual",
    icon: Activity,
    items: [
      { title: "Calculo", url: "/residual/calculo" },
      { title: "Monitoreo", url: "/residual/monitoreo" },
      { title: "Observaciones", url: "/residual/observaciones" },
    ],
  },
  {
    title: "Reportes",
    url: "/reportes",
    icon: FileText,
    items: [
      { title: "Generar Reporte", url: "/reportes/generar" },
      { title: "Historial", url: "/reportes/historial" },
    ],
  },
  {
    title: "Documentacion",
    url: "/documentacion",
    icon: Settings,
    items: [
      { title: "Manual de Usuario", url: "/documentacion/manual-usuario" },
      { title: "Respaldo Tecnico", url: "/documentacion/respaldo-tecnico" },
      { title: "Descripcion del Sistema", url: "/documentacion/descripcion-sistema" },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <Shield className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">CyberSeg</h1>
            <p className="text-xs text-sidebar-foreground/60">Gestion de Riesgos</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible defaultOpen={pathname.startsWith(item.url)}>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={cn(
                            "w-full justify-between",
                            pathname.startsWith(item.url) && "bg-sidebar-accent text-sidebar-accent-foreground"
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </span>
                          <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.url}
                              >
                                <Link href={subItem.url}>
                                  {subItem.title}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
