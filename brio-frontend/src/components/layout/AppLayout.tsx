import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  BarChart3,
  Brain,
  Calendar,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Sun,
  Timer,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { reenviarVerificacao } from "@/features/auth/auth-api"
import { useAuth } from "@/features/auth/auth-context"
import { useSessaoAtiva } from "@/features/sessoes/sessao-ativa-context"
import { useTheme } from "@/hooks/useTheme"
import { apiFetch } from "@/lib/api-client"
import { notificar } from "@/lib/toast"

interface UsuarioLogado {
  nome: string
  email: string
  email_verificado: boolean
}

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/calendario", label: "Calendário", icon: Calendar },
  { to: "/cronograma", label: "Cronograma", icon: ListTodo },
  { to: "/provas", label: "Provas", icon: GraduationCap },
  { to: "/sessoes", label: "Sessão de Estudos", icon: Timer },
  { to: "/revisoes", label: "Revisões", icon: RotateCcw },
  { to: "/estatisticas", label: "Estatísticas", icon: BarChart3 },
  { to: "/questoes", label: "Gerador de Questões", icon: Brain },
]

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return "?"
  const primeira = Array.from(partes[0])[0]
  const ultima = partes.length > 1 ? Array.from(partes[partes.length - 1])[0] : ""
  return (primeira + ultima).toUpperCase()
}

// Todos os itens da barra (links, botões) usam estas classes: um único lugar
// define como um item fica aberto, recolhido, ativo e com foco no teclado.
function classeItem(recolhida: boolean, ativo = false): string {
  const base =
    "flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-sm transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  const layout = recolhida ? "justify-center" : "gap-3"
  const cor = ativo
    ? "bg-primary text-primary-foreground"
    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
  return `${base} ${layout} ${cor}`
}

interface ConteudoItemProps {
  icone: LucideIcon
  rotulo: string
  recolhida: boolean
}

function ConteudoItem({ icone: Icone, rotulo, recolhida }: ConteudoItemProps) {
  return (
    <>
      <Icone className="size-4 shrink-0" />
      {!recolhida && <span className="min-w-0 truncate">{rotulo}</span>}
    </>
  )
}

interface BlocoUsuarioProps {
  usuario: UsuarioLogado | undefined
  recolhida: boolean
}

function BlocoUsuario({ usuario, recolhida }: BlocoUsuarioProps) {
  const disposicao = recolhida ? "justify-center" : "gap-3"

  if (!usuario) {
    return (
      <div role="status" className={`mb-1 flex items-center px-1 py-1 ${disposicao}`}>
        <span className="sr-only">Carregando seus dados...</span>
        <Skeleton className="size-9 shrink-0 rounded-full" />
        {!recolhida && (
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      title={`${usuario.nome} (${usuario.email})`}
      className={`mb-1 flex items-center px-1 py-1 ${disposicao}`}
    >
      <div
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
      >
        {iniciais(usuario.nome)}
      </div>

      {recolhida ? (
        <span className="sr-only">
          {usuario.nome}, {usuario.email}
        </span>
      ) : (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight">{usuario.nome}</p>
          <p className="truncate text-xs text-muted-foreground">{usuario.email}</p>
        </div>
      )}
    </div>
  )
}

export function AppLayout() {
  const { logout, emailVerificado, atualizarEmailVerificado } = useAuth()
  const { tema, alternarTema } = useTheme()
  const { sessaoAtiva, pomodoro } = useSessaoAtiva()
  const location = useLocation()

  const [sidebarRecolhida, setSidebarRecolhida] = useState(false)

  const { data: usuario } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await apiFetch("/api/v1/auth/me")
      if (!response.ok) throw new Error("Não foi possível carregar o usuário")
      return response.json() as Promise<UsuarioLogado>
    },
  })

  useEffect(() => {
    if (usuario) atualizarEmailVerificado(usuario.email_verificado)
  }, [usuario, atualizarEmailVerificado])

  const reenviar = useMutation({
    mutationFn: reenviarVerificacao,
    onSuccess: () =>
      notificar.sucesso("Email de verificação reenviado. Confira sua caixa de entrada."),
    onError: (erro) => notificar.erro(erro),
  })

  const rotuloTema = tema === "dark" ? "Modo claro" : "Modo escuro"
  const IconeTema = tema === "dark" ? Sun : Moon

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <aside
        className={`sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden border-r border-border/80 bg-card p-4 shadow-sm transition-all duration-300 ${
          sidebarRecolhida ? "w-20" : "w-56"
        }`}
      >
        <div
          className={`mb-6 flex shrink-0 items-center ${
            sidebarRecolhida ? "justify-center" : "justify-between px-3"
          }`}
        >
          {!sidebarRecolhida && <span className="text-xl font-bold tracking-tight">BRIO</span>}

          <Button
            variant="ghost"
            size="icon"
            aria-label={sidebarRecolhida ? "Expandir menu" : "Recolher menu"}
            onClick={() => setSidebarRecolhida((valor) => !valor)}
          >
            {sidebarRecolhida ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>

        <nav className="no-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              aria-label={sidebarRecolhida ? label : undefined}
              title={sidebarRecolhida ? label : undefined}
              className={({ isActive }) => classeItem(sidebarRecolhida, isActive)}
            >
              <ConteudoItem icone={icon} rotulo={label} recolhida={sidebarRecolhida} />
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 flex-col gap-1 border-t border-border pt-3">
          <BlocoUsuario usuario={usuario} recolhida={sidebarRecolhida} />

          <NavLink
            to="/conta"
            end
            aria-label={sidebarRecolhida ? "Minha assinatura" : undefined}
            title={sidebarRecolhida ? "Minha assinatura" : undefined}
            className={({ isActive }) => classeItem(sidebarRecolhida, isActive)}
          >
            <ConteudoItem
              icone={CreditCard}
              rotulo="Minha assinatura"
              recolhida={sidebarRecolhida}
            />
          </NavLink>

          <button
            type="button"
            onClick={alternarTema}
            aria-label={sidebarRecolhida ? rotuloTema : undefined}
            title={sidebarRecolhida ? rotuloTema : undefined}
            className={classeItem(sidebarRecolhida)}
          >
            <ConteudoItem icone={IconeTema} rotulo={rotuloTema} recolhida={sidebarRecolhida} />
          </button>

          <button
            type="button"
            onClick={logout}
            aria-label={sidebarRecolhida ? "Sair" : undefined}
            title={sidebarRecolhida ? "Sair" : undefined}
            className={classeItem(sidebarRecolhida)}
          >
            <ConteudoItem icone={LogOut} rotulo="Sair" recolhida={sidebarRecolhida} />
          </button>
        </div>
      </aside>

      <main className="h-full min-w-0 flex-1 overflow-y-auto p-8">
        {!emailVerificado && (
          <div className="mb-4 flex items-center justify-between rounded-md border border-status-atencao/40 bg-status-atencao/10 px-4 py-2 text-sm">
            <span>Confirme seu email para aproveitar todos os recursos.</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => reenviar.mutate()}
              disabled={reenviar.isPending}
            >
              {reenviar.isPending ? "Enviando..." : "Reenviar email"}
            </Button>
          </div>
        )}

        {sessaoAtiva && location.pathname !== "/sessoes" && (
          <Link
            to="/sessoes"
            className="mb-4 flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary/20"
          >
            <span className="font-mono tabular-nums">{pomodoro.tempoFormatado}</span>
            <span>Sessão em andamento — voltar</span>
          </Link>
        )}

        <Outlet />
      </main>
    </div>
  )
}