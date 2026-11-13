import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ROTULO_PRIORIDADE,
  ROTULO_STATUS,
  textoDiasRestantes,
  variantePrioridade,
} from "@/features/provas/apresentacao"

export interface ProvaResumo {
  id: number | string
  nome: string
  prioridade: string
  status: string
  dias_restantes: number | null
}

/**
 * Card de prova do Dashboard e da lista de provas.
 * A contagem regressiva é o dado que importa, então ela vira o destaque do card.
 */
export function CartaoProva({ prova }: { prova: ProvaResumo }) {
  const dias = prova.dias_restantes
  const emContagem = dias !== null && dias > 0
  const semanaDaProva = emContagem && dias <= 7

  return (
    <Link
      to={`/provas/${prova.id}`}
      className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full transition-colors group-hover:border-primary">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="min-w-0 flex-1 truncate text-base" title={prova.nome}>
              {prova.nome}
            </CardTitle>

            <div className="flex shrink-0 gap-1.5">
              <Badge variant={variantePrioridade(prova.prioridade)}>
                <span className="sr-only">Prioridade </span>
                {ROTULO_PRIORIDADE[prova.prioridade] ?? prova.prioridade}
              </Badge>
              {/* "Ativa" é o normal: só mostramos o status quando ele foge disso */}
              {prova.status !== "ativa" && (
                <Badge variant="secondary">{ROTULO_STATUS[prova.status] ?? prova.status}</Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {emContagem ? (
            <p className="flex items-baseline gap-1.5">
              <span
                className={`text-3xl font-semibold leading-none tabular-nums ${
                  semanaDaProva ? "text-amber-600 dark:text-amber-400" : ""
                }`}
              >
                {dias}
              </span>
              <span className="text-sm text-muted-foreground">
                {dias === 1 ? "dia para a prova" : "dias para a prova"}
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">{textoDiasRestantes(dias)}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
