import { useState } from "react"
import { Download, ArrowLeft, Play } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"

import { EditorAnotacao } from "@/components/shared/EditorAnotacao"
import { Carregando, SkeletonEditor } from "@/components/shared/Skeletons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  exportarAnotacaoPdf,
  obterAnotacao,
  salvarAnotacao,
} from "@/features/anotacoes/api/anotacoes-api"
import { notificar } from "@/lib/toast"

export function TopicoAnotacaoPage() {
  const { id } = useParams()
  const topicoId = Number(id)
  const navigate = useNavigate()

  // 1. TODOS OS HOOKS DEVEM FICAR NO TOPO (Incondicionais)
  const [exportando, setExportando] = useState(false)

  const {
    data: anotacao,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["anotacao", topicoId],
    queryFn: () => obterAnotacao(topicoId),
    staleTime: Infinity,
    gcTime: 0,
  })

  const salvar = useMutation({
    mutationFn: (html: string) => salvarAnotacao(topicoId, html),
  })

  async function handleExportar() {
    if (!anotacao) return
    setExportando(true)
    try {
      await exportarAnotacaoPdf(topicoId, `topico-${topicoId}`)
      notificar.sucesso("PDF exportado")
    } catch (erro) {
      notificar.erro(erro)
    } finally {
      setExportando(false)
    }
  }

  // 2. RETORNOS CONDICIONAIS APENAS APÓS OS HOOKS
  if (isLoading) {
    return (
      <Carregando>
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-7 w-32" />
          <SkeletonEditor />
        </div>
      </Carregando>
    )
  }

  if (isError || !anotacao) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
        <p className="text-destructive">Não foi possível carregar a anotação.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          Tentar de novo
        </Button>
      </div>
    )
  }

  // 3. Largura de leitura confortável, com o editor ocupando toda ela
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-3 border-b border-border pb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex min-h-10 w-fit cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground sm:min-h-0"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">Anotações</h1>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/sessoes?topico_id=${topicoId}`)}
            >
              <Play className="size-4" />
              Iniciar sessão
            </Button>

            <Button variant="outline" size="sm" onClick={handleExportar} disabled={exportando}>
              <Download className="size-4" />
              {exportando ? "Exportando..." : "Exportar PDF"}
            </Button>
          </div>
        </div>
      </div>

      <EditorAnotacao
        key={topicoId}
        conteudoInicial={anotacao.conteudo_html}
        chaveRascunho={`topico-${topicoId}`}
        onSalvar={(html) => salvar.mutateAsync(html)}
      />
    </div>
  )
}
