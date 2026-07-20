import { NavLink, Outlet } from "react-router-dom"
import {
  BarChart3,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Moon,
  RotateCcw,
  Sun,
  Timer,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/auth-context"
import { useTheme } from "@/hooks/useTheme"

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/provas", label: "Provas", icon: GraduationCap },
  { to: "/sessoes", label: "Sessão de Estudos", icon: Timer },
  { to: "/revisoes", label: "Revisões", icon: RotateCcw },
  { to: "/estatisticas", label: "Estatísticas", icon: BarChart3 },
]

export function AppLayout() {
  const { logout } = useAuth()
  const { tema, alternarTema } = useTheme()

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col border-r border-border bg-card p-4">
        <span className="mb-6 px-2 text-lg font-semibold">Brio</span>

        <nav className="flex flex-1 flex-col gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-border pt-4">
          <Button variant="ghost" className="justify-start gap-2" onClick={alternarTema}>
            {tema === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {tema === "dark" ? "Modo claro" : "Modo escuro"}
          </Button>
          <Button variant="ghost" className="justify-start gap-2" onClick={logout}>
            <LogOut className="size-4" />
            Sair
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}