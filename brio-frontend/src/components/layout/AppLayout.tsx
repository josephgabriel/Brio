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
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Sun,
  Timer,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
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

type Tamanho = "normal" | "toque"

const CHAVE_SIDEBAR = "brio_sidebar_recolhida"

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

// Escolha salva do usuário. Sem escolha, tablets começam recolhidos
// e telas grandes começam abertos.
function lerSidebarRecolhida(): boolean {
  const salvo = localStorage.getItem(CHAVE_SIDEBAR)
  if (salvo !== null) return salvo === "true"
  return window.innerWidth < 1024
}

// Todos os itens da barra (links, botões, na barra fixa e na gaveta) usam
// estas classes. "toque" é a versão mais alta, para dedo.
function classeItem(recolhida: boolean, ativo = false, tamanho: Tamanho = "normal"): string {
  const altura = tamanho === "toque" ? "py-3" : "py-2"
  const base =
    `flex w-full cursor-pointer items-center rounded-lg px-3 ${altura} text-sm transition-colors ` +
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

interface ConteudoSidebarProps {
  recolhida: boolean
  tamanho?: Tamanho
  usuario: UsuarioLogado | undefined
  tema: string
  aoAlternarTema: () => void
  aoSair: () => void
  aoNavegar?: () => void
}

// O mesmo conteúdo serve para a barra fixa (desktop) e para a gaveta (celular).
function ConteudoSidebar({
  recolhida,
  tamanho = "normal",
  usuario,
  tema,
  aoAlternarTema,
  aoSair,
  aoNavegar,
}: ConteudoSidebarProps) {
  const rotuloTema = tema === "dark" ? "Modo claro" : "Modo escuro"
  const IconeTema = tema === "dark" ? Sun : Moon

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="no-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto"
      >
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            onClick={aoNavegar}
            aria-label={recolhida ? label : undefined}
            title={recolhida ? label : undefined}
            className={({ isActive }) => classeItem(recolhida, isActive, tamanho)}
          >
            <ConteudoItem icone={icon} rotulo={label} recolhida={recolhida} />
          </NavLink>
        ))}
      </nav>

      <div className="flex shrink-0 flex-col gap-1 border-t border-border pt-3">
        <BlocoUsuario usuario={usuario} recolhida={recolhida} />

        <NavLink
          to="/conta"
          end
          onClick={aoNavegar}
          aria-label={recolhida ? "Minha assinatura" : undefined}
          title={recolhida ? "Minha assinatura" : undefined}
          className={({ isActive }) => classeItem(recolhida, isActive, tamanho)}
        >
          <ConteudoItem icone={CreditCard} rotulo="Minha assinatura" recolhida={recolhida} />
        </NavLink>

        <button
          type="button"
          onClick={aoAlternarTema}
          aria-label={recolhida ? rotuloTema : undefined}
          title={recolhida ? rotuloTema : undefined}
          className={classeItem(recolhida, false, tamanho)}
        >
          <ConteudoItem icone={IconeTema} rotulo={rotuloTema} recolhida={recolhida} />
        </button>

        <button
          type="button"
          onClick={aoSair}
          aria-label={recolhida ? "Sair" : undefined}
          title={recolhida ? "Sair" : undefined}
          className={classeItem(recolhida, false, tamanho)}
        >
          <ConteudoItem icone={LogOut} rotulo="Sair" recolhida={recolhida} />
        </button>
      </div>
    </>
  )
}

export function AppLayout() {
  const { logout, emailVerificado, atualizarEmailVerificado } = useAuth()
  const { tema, alternarTema } = useTheme()
  const { sessaoAtiva, pomodoro } = useSessaoAtiva()
  const location = useLocation()

  const [sidebarRecolhida, setSidebarRecolhida] = useState(lerSidebarRecolhida)
  const [menuAberto, setMenuAberto] = useState(false)

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

  function alternarSidebar() {
    const proximo = !sidebarRecolhida
    setSidebarRecolhida(proximo)
    localStorage.setItem(CHAVE_SIDEBAR, String(proximo))
  }

  const mostrarCronometro = !!sessaoAtiva && location.pathname !== "/sessoes"

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden md:flex-row">
      {/* Celular: barra no topo com o botão do menu */}
      <header className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-3 py-2 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Abrir menu"
          onClick={() => setMenuAberto(true)}
        >
          <Menu className="size-5" />
        </Button>
        <span className="text-lg font-bold tracking-tight">BRIO</span>

        {mostrarCronometro && (
          <Link
            to="/sessoes"
            className="ml-auto flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm text-primary"
          >
            <Timer aria-hidden className="size-4" />
            <span className="font-mono tabular-nums">{pomodoro.tempoFormatado}</span>
            <span className="sr-only">Sessão em andamento, voltar</span>
          </Link>
        )}
      </header>

      {/* Celular: o menu abre numa gaveta */}
      <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
        <SheetContent side="left" className="flex w-72 max-w-[85vw] flex-col p-4 md:hidden">
          <SheetTitle className="mb-4 px-3 text-xl font-bold tracking-tight">BRIO</SheetTitle>
          <ConteudoSidebar
            recolhida={false}
            tamanho="toque"
            usuario={usuario}
            tema={tema}
            aoAlternarTema={alternarTema}
            aoSair={logout}
            aoNavegar={() => setMenuAberto(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Tablet e desktop: barra lateral fixa */}
      <aside
        className={`hidden shrink-0 flex-col overflow-hidden border-r border-border/80 bg-card p-4 shadow-sm transition-[width] duration-300 md:flex ${
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
            onClick={alternarSidebar}
          >
            {sidebarRecolhida ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>

        <ConteudoSidebar
          recolhida={sidebarRecolhida}
          usuario={usuario}
          tema={tema}
          aoAlternarTema={alternarTema}
          aoSair={logout}
        />
      </aside>

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        {!emailVerificado && (
          <div className="mb-4 flex flex-col gap-2 rounded-md border border-status-atencao/40 bg-status-atencao/10 px-4 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
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

        {mostrarCronometro && (
          <Link
            to="/sessoes"
            className="mb-4 hidden w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary/20 md:flex"
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