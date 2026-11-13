import type { ReactNode } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CartaoPlanoProps {
  nome: string
  preco: string
  periodo: string
  observacao?: string
  /** Plano recomendado: borda e preço na cor da marca. */
  destaque?: boolean
  /** Selo ao lado do nome (ex.: "Mais vantajoso"). */
  selo?: string
  /** O botão ou link de contratação. */
  children: ReactNode
}

/**
 * Cartão de plano da landing e da tela de planos.
 * Só preço e botão: a lista de benefícios é a mesma nos dois planos, então fica fora daqui.
 */
export function CartaoPlano({
  nome,
  preco,
  periodo,
  observacao,
  destaque = false,
  selo,
  children,
}: CartaoPlanoProps) {
  return (
    <Card className={`flex flex-col ${destaque ? "border-primary/60 ring-1 ring-primary/40" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">{nome}</CardTitle>
          {selo && (
            <span className="shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
              {selo}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5">
        <div>
          <p>
            <span
              className={`text-4xl font-semibold tracking-tight tabular-nums ${
                destaque ? "text-primary" : ""
              }`}
            >
              {preco}
            </span>{" "}
            <span className="text-sm text-muted-foreground">{periodo}</span>
          </p>
          {observacao && (
            <p className="mt-1 text-sm font-medium text-emerald-500">{observacao}</p>
          )}
        </div>

        <div className="mt-auto">{children}</div>
      </CardContent>
    </Card>
  )
}
