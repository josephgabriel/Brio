import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

type Tom = "sucesso" | "erro" | "neutro"

const TONS: Record<Tom, string> = {
  sucesso: "bg-emerald-500/10 text-emerald-500",
  erro: "bg-destructive/10 text-destructive",
  neutro: "bg-primary/10 text-primary",
}

interface TelaStatusProps {
  icone?: LucideIcon
  tom?: Tom
  /** Faz o ícone girar (carregando). Respeita "reduzir movimento". */
  girando?: boolean
  /** Número grande no lugar do ícone (ex.: "404"). */
  codigo?: string
  titulo: string
  texto?: ReactNode
  /** Conteúdo técnico extra (ex.: detalhe do erro, só em desenvolvimento). */
  detalhe?: ReactNode
  /** Coloca o conteúdo num cartão sobre o gradiente da marca. */
  cartao?: boolean
  /** Botões e links de saída. */
  children?: ReactNode
}

/**
 * Tela cheia para estados de uma coisa só: erro, 404, verificando, aguardando pagamento.
 * Antes cada uma era um texto solto no meio da página.
 */
export function TelaStatus({
  icone: Icone,
  tom = "neutro",
  girando = false,
  codigo,
  titulo,
  texto,
  detalhe,
  cartao = false,
  children,
}: TelaStatusProps) {
  const conteudo = (
    <div
      role={girando ? "status" : undefined}
      className={`flex w-full max-w-md flex-col items-center gap-4 text-center ${
        cartao ? "rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8" : ""
      }`}
    >
      {codigo ? (
        <p aria-hidden className="text-7xl font-semibold tabular-nums text-muted-foreground/40">
          {codigo}
        </p>
      ) : (
        Icone && (
          <div
            aria-hidden
            className={`flex size-14 items-center justify-center rounded-full ${TONS[tom]}`}
          >
            <Icone className={`size-7 ${girando ? "animate-spin motion-reduce:animate-none" : ""}`} />
          </div>
        )
      )}

      <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{titulo}</h1>

      {texto && <div className="text-muted-foreground">{texto}</div>}

      {detalhe}

      {children && <div className="mt-2 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  )

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background px-6 py-10 text-foreground">
      {cartao && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background"
        />
      )}
      <div className="relative flex w-full justify-center">{conteudo}</div>
    </div>
  )
}
