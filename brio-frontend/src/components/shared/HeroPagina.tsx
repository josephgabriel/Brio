import type { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { GRADIENTE_HERO } from "@/features/estatisticas/visual"

interface HeroPaginaProps {
  /** Texto curto acima do título (ex.: "Brio-IA"). Escreva em frase normal, sem caixa alta. */
  rotulo?: string
  titulo: ReactNode
  texto?: ReactNode
  /** Mostra esqueletos no lugar do título e do texto. */
  carregando?: boolean
  /** Use 2 quando a página já tem um h1 próprio (ex.: o h1 sr-only das Estatísticas). */
  nivelTitulo?: 1 | 2
  /** Painel do lado direito (use o PainelHero). */
  children?: ReactNode
}

/**
 * Banner de abertura das telas internas. Antes cada tela repetia este bloco inteiro;
 * agora o gradiente, os círculos e o espaçamento ficam num lugar só.
 */
export function HeroPagina({
  rotulo,
  titulo,
  texto,
  carregando = false,
  nivelTitulo = 1,
  children,
}: HeroPaginaProps) {
  const Titulo = nivelTitulo === 2 ? "h2" : "h1"

  return (
    <section
      className="relative overflow-hidden rounded-3xl p-5 text-white sm:p-8"
      style={{ background: GRADIENTE_HERO }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-56 rounded-full bg-white/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 right-28 size-40 rounded-full bg-white/10"
      />

      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <div className="max-w-md">
          {rotulo && <p className="text-sm font-medium text-white/75">{rotulo}</p>}

          {carregando ? (
            <>
              <Skeleton className="mt-2 h-8 w-64 max-w-full bg-white/20" />
              <Skeleton className="mt-3 h-4 w-80 max-w-full bg-white/20" />
            </>
          ) : (
            <>
              <Titulo className="mt-1 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                {titulo}
              </Titulo>
              {texto && <div className="mt-2 text-sm text-white/85">{texto}</div>}
            </>
          )}
        </div>

        {children}
      </div>
    </section>
  )
}

interface PainelHeroProps {
  rotulo: string
  /** Número ou texto grande. Omita para mostrar só o rótulo e o conteúdo. */
  valor?: ReactNode
  /** Texto pequeno ao lado do valor (ex.: "de 8", "dias", "/ 100"). */
  unidade?: ReactNode
  /** Valor ainda maior, para o dado principal do banner. */
  grande?: boolean
  progresso?: { percentual: number; rotulo: string }
  children?: ReactNode
}

/** Painel translúcido do banner: um dado principal, e se quiser uma barra de progresso. */
export function PainelHero({
  rotulo,
  valor,
  unidade,
  grande = false,
  progresso,
  children,
}: PainelHeroProps) {
  return (
    <div className="w-full rounded-2xl bg-black/20 p-5 sm:w-64">
      <p className="text-sm font-medium text-white/75">{rotulo}</p>

      {valor !== undefined && (
        <div className="mt-1 flex items-baseline gap-1">
          <span
            className={`${grande ? "text-5xl" : "text-4xl"} font-semibold leading-none tabular-nums`}
          >
            {valor}
          </span>
          {unidade && <span className="text-sm text-white/70">{unidade}</span>}
        </div>
      )}

      {progresso && (
        <div
          role="progressbar"
          aria-valuenow={progresso.percentual}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={progresso.rotulo}
          className="mt-3 h-2 overflow-hidden rounded-full bg-white/20"
        >
          <div
            className="h-full rounded-full bg-white transition-all duration-700 motion-reduce:transition-none"
            style={{ width: `${progresso.percentual}%` }}
          />
        </div>
      )}

      {children}
    </div>
  )
}
