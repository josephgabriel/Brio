import { useQuery } from "@tanstack/react-query"
import { FileText, Layers } from "lucide-react"

import { EstadoVazio } from "@/components/shared/EstadoVazio"
import { Carregando } from "@/components/shared/Skeletons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatarData } from "@/features/ia/formatacao"
import { listarResumos } from "@/features/resumos/api/resumos-api"
import { rotuloNivel } from "@/features/resumos/formatacao"

interface ListaResumosProps {
  aoAbrir: (resumoId: number) => void
  aoIrParaGerar: () => void
}

export function ListaResumos({ aoAbrir, aoIrParaGerar }: ListaResumosProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["resumos", "lista"],
    queryFn: listarResumos,
  })

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
              <Skeleton className="mt-4 h-9 w-full" />
            </li>
          ))}
        </ul>
      </Carregando>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto w-full max-w-2xl rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
        <p className="text-destructive">Não foi possível carregar os resumos.</p>
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
        titulo="Nenhum resumo ainda"
        descricao="Os resumos que você gerar ficam guardados aqui, para ler de novo sem gastar a cota."
        acao={{ rotulo: "Gerar meu primeiro resumo", aoClicar: aoIrParaGerar }}
      />
    )
  }

  return (
    <ul className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      {data.map((resumo) => {
        const parcial = resumo.paginas_lidas < resumo.total_paginas
        return (
          <li key={resumo.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-medium">{resumo.titulo}</p>
                <p className="truncate text-xs text-muted-foreground" title={resumo.nome_arquivo}>
                  {resumo.nome_arquivo}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatarData(resumo.criado_em)} · {rotuloNivel(resumo.nivel)}
                  {parcial &&
                    ` · primeiras ${resumo.paginas_lidas} de ${resumo.total_paginas} páginas`}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="mt-4 h-11 w-full sm:h-9"
              onClick={() => aoAbrir(resumo.id)}
            >
              Ler resumo
            </Button>
          </li>
        )
      })}
    </ul>
  )
}