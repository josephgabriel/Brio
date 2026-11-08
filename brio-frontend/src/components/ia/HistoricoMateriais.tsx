import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FileText, Layers } from "lucide-react"

import { RevisaoFlashcards } from "@/components/ia/RevisaoFlashcards"
import { EstadoVazio } from "@/components/shared/EstadoVazio"
import { Carregando } from "@/components/shared/Skeletons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { plural } from "@/features/cronograma/semana"
import { listarMateriais } from "@/features/ia/api/ia-api"
import { formatarData } from "@/features/ia/formatacao"

// Aproveitamento baixo usa âmbar, e não vermelho: o erro faz parte de aprender
function cor(aproveitamento: number): { barra: string; texto: string } {
  if (aproveitamento >= 70) {
    return { barra: "bg-emerald-500", texto: "text-emerald-600 dark:text-emerald-400" }
  }
  return { barra: "bg-amber-500", texto: "text-amber-600 dark:text-amber-400" }
}

interface HistoricoMateriaisProps {
  aoIrParaGerar: () => void
}

export function HistoricoMateriais({ aoIrParaGerar }: HistoricoMateriaisProps) {
  const [materialAbertoId, setMaterialAbertoId] = useState<number | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["ia-materiais", "lista"],
    queryFn: listarMateriais,
  })

  if (materialAbertoId !== null) {
    return (
      <RevisaoFlashcards materialId={materialAbertoId} aoVoltar={() => setMaterialAbertoId(null)} />
    )
  }

  if (isLoading) {
    return (
      <Carregando>
        <ul className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <li key={i} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <Skeleton className="size-10 rounded-lg" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="mt-5 h-2 w-full" />
            </li>
          ))}
        </ul>
      </Carregando>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto w-full max-w-2xl rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
        <p className="text-destructive">Não foi possível carregar o histórico.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          Tentar de novo
        </Button>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <EstadoVazio
        className="mx-auto w-full max-w-2xl"
        icone={Layers}
        titulo="Nenhum material ainda"
        descricao="Quando você gerar questões a partir de um PDF, elas ficam guardadas aqui para você revisar quando quiser."
        acao={{ rotulo: "Gerar minhas primeiras questões", aoClicar: aoIrParaGerar }}
      />
    )
  }

  return (
    <ul className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      {data.map((material) => {
        const cores = material.aproveitamento !== null ? cor(material.aproveitamento) : null
        const faltam = material.total_questoes - material.questoes_respondidas

        return (
          <li
            key={material.id}
            className="rounded-2xl border border-border bg-card p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <div
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" title={material.nome_arquivo}>
                  {material.nome_arquivo}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatarData(material.criado_em)} ·{" "}
                  {plural(material.total_questoes, "questão", "questões")}
                </p>
              </div>
            </div>

            <div className="mt-4">
              {material.aproveitamento === null || cores === null ? (
                <p className="text-xs text-muted-foreground">
                  Você ainda não respondeu estas questões.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">
                      Acertou {material.questoes_acertadas} de {material.questoes_respondidas}{" "}
                      respondidas
                    </span>
                    <span className={`font-semibold tabular-nums ${cores.texto}`}>
                      {Math.round(material.aproveitamento)}%
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={Math.round(material.aproveitamento)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Aproveitamento"
                    className="h-2 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cores.barra}`}
                      style={{ width: `${material.aproveitamento}%` }}
                    />
                  </div>
                  {faltam > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {faltam === 1 ? "Falta responder 1 questão" : `Faltam responder ${faltam} questões`}
                    </p>
                  )}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              className="mt-4 h-11 w-full sm:h-9"
              onClick={() => setMaterialAbertoId(material.id)}
            >
              Revisar com flashcards
            </Button>
          </li>
        )
      })}
    </ul>
  )
}