import type { ReactNode } from "react"

interface OpcaoAba<T extends string> {
  id: T
  rotulo: ReactNode
}

interface AbasProps<T extends string> {
  opcoes: OpcaoAba<T>[]
  valor: T
  aoMudar: (id: T) => void
  /** Nome do grupo para leitores de tela. */
  rotuloGrupo: string
  /** Versão menor, para dentro de cartões e barras de ferramentas. */
  compacto?: boolean
  className?: string
}

/**
 * Controle segmentado usado nas telas internas (Questões, Resumos, Revisões, Calendário).
 * Mantém o visual de pílula com o item ativo em esmeralda, e ganha anel de foco no teclado.
 */
export function Abas<T extends string>({
  opcoes,
  valor,
  aoMudar,
  rotuloGrupo,
  compacto = false,
  className = "",
}: AbasProps<T>) {
  const tamanho = compacto
    ? "px-3 py-1 text-xs"
    : "min-h-10 px-5 text-sm sm:min-h-0 sm:py-1.5"

  return (
    <div
      role="group"
      aria-label={rotuloGrupo}
      className={`flex w-fit flex-wrap gap-1 rounded-full bg-muted p-1 ${className}`}
    >
      {opcoes.map((opcao) => {
        const ativa = opcao.id === valor
        return (
          <button
            key={opcao.id}
            type="button"
            aria-pressed={ativa}
            onClick={() => aoMudar(opcao.id)}
            className={`cursor-pointer rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tamanho} ${
              ativa
                ? "bg-emerald-500 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opcao.rotulo}
          </button>
        )
      })}
    </div>
  )
}
