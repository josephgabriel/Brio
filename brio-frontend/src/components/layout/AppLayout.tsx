import { useState } from "react"
import { NavLink, Outlet, Link, useLocation } from "react-router-dom"
import {
  BarChart3,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Sun,
  Timer,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/auth-context"
import { useTheme } from "@/hooks/useTheme"
import { useSessaoAtiva } from "@/features/sessoes/sessao-ativa-context"

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
  const { sessaoAtiva, pomodoro } = useSessaoAtiva()
  const location = useLocation()

  const [sidebarRecolhida, setSidebarRecolhida] = useState(false)

  return (
    <div className="flex min-h-screen">
      <aside
  className={`flex flex-col border-r border-border/80 bg-card p-4 shadow-sm transition-all duration-300 ${
    sidebarRecolhida ? "w-20" : "w-56"
  }`}
>
        {/* Cabeçalho */}
       <div className="mb-8 flex items-center justify-between px-3">
  {!sidebarRecolhida && (
    <span className="text-xl font-bold tracking-tight">
      BRIO
    </span>
  )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setSidebarRecolhida((valor) => !valor)
            }
          >
            {sidebarRecolhida ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>

        {/* Links */}
        <nav className="flex flex-1 flex-col gap-2.5">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              title={sidebarRecolhida ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  sidebarRecolhida
                    ? "justify-center"
                    : "gap-2"
                } ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              <Icon className="size-4 shrink-0" />

              {!sidebarRecolhida && (
                <span>{label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Ações inferiores */}
        <div className="flex flex-col gap-1 border-t border-border pt-4">
          <Button
            variant="ghost"
            title={
              sidebarRecolhida
                ? tema === "dark"
                  ? "Modo claro"
                  : "Modo escuro"
                : undefined
            }
            className={`gap-2 ${
              sidebarRecolhida
                ? "justify-center"
                : "justify-start"
            }`}
            onClick={alternarTema}
          >
            {tema === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}

            {!sidebarRecolhida && (
              <span>
                {tema === "dark"
                  ? "Modo claro"
                  : "Modo escuro"}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            title={sidebarRecolhida ? "Sair" : undefined}
            className={`gap-2 ${
              sidebarRecolhida
                ? "justify-center"
                : "justify-start"
            }`}
            onClick={logout}
          >
            <LogOut className="size-4" />

            {!sidebarRecolhida && (
              <span>Sair</span>
            )}
          </Button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-8">
        {sessaoAtiva && location.pathname !== "/sessoes" && (
          <Link
            to="/sessoes"
            className="mb-4 flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary/20"
          >
            <span className="font-mono tabular-nums">
              {pomodoro.tempoFormatado}
            </span>

            <span>
              Sessão em andamento — voltar
            </span>
          </Link>
        )}

        <Outlet />
      </main>
    </div>
  )
}