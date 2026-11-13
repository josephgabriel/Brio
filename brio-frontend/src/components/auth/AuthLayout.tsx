import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import logo2 from "@/assets/logo2.png"
import logo3 from "@/assets/logo3.png"
import { useForceDarkMode } from "@/hooks/useForceDarkMode"

interface AuthLayoutProps {
  titulo: string
  descricao?: ReactNode
  children: ReactNode
}

/**
 * Moldura das telas de entrada (login, cadastro, recuperar e redefinir senha).
 * Antes o painel da marca e o cartão eram copiados em cada página.
 */
export function AuthLayout({ titulo, descricao, children }: AuthLayoutProps) {
  useForceDarkMode()

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      {/* Painel da marca: só em telas grandes */}
      <section className="relative hidden w-1/2 items-center justify-center overflow-hidden border-r border-border lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />

        <div className="auth-entrada relative max-w-lg px-12">
          <div className="flex items-center gap-5">
            <img src={logo3} alt="" className="h-24 w-auto" />
            <p className="text-7xl font-black tracking-tight text-primary">Brio</p>
          </div>

          <p className="mt-6 text-balance text-2xl font-medium">
            Plataforma completa de estudos para Concursos, ENEM e Vestibulares.
          </p>

          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Organize provas, matérias, sessões de estudo, revisões e anotações em uma única
            plataforma.
          </p>
        </div>
      </section>

      {/* Cartão */}
      <section className="flex w-full items-center justify-center px-4 py-8 sm:px-8 sm:py-10 lg:w-1/2">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-10">
          <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
            {/* No desktop a marca já aparece no painel ao lado */}
            <Link to="/" aria-label="Brio, página inicial" className="mb-4 lg:hidden">
              <img src={logo2} alt="Brio" className="h-14 w-auto" />
            </Link>

            <h1 className="text-2xl font-bold sm:text-3xl">{titulo}</h1>
            {descricao && <p className="mt-2 text-muted-foreground">{descricao}</p>}
          </div>

          {children}
        </div>
      </section>

      <style>{`
        @keyframes auth-entrada {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @media (prefers-reduced-motion: no-preference) {
          .auth-entrada { animation: auth-entrada 0.7s ease-out both; }
        }
      `}</style>
    </div>
  )
}

type TomAviso = "sucesso" | "atencao"

const TONS_AVISO: Record<TomAviso, string> = {
  sucesso: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  atencao: "border-amber-500/30 bg-amber-500/10 text-amber-500",
}

interface AvisoAuthProps {
  tom: TomAviso
  icone: ReactNode
  titulo: string
  /** Espaçamento externo. Padrão: margem abaixo, para avisos que ficam no topo do cartão. */
  className?: string
  children?: ReactNode
}

/** Faixa de aviso dentro do cartão de entrada (cadastro feito, e-mail não verificado...). */
export function AvisoAuth({ tom, icone, titulo, className = "mb-6", children }: AvisoAuthProps) {
  return (
    <div
      role={tom === "atencao" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border p-4 ${TONS_AVISO[tom]} ${className}`}
    >
      <span aria-hidden className="mt-0.5 shrink-0">
        {icone}
      </span>
      <div className="min-w-0 text-sm">
        <p className="font-semibold">{titulo}</p>
        {children}
      </div>
    </div>
  )
}
