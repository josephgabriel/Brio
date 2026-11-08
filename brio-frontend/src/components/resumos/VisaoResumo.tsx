import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Archive, ArrowLeft, Copy } from "lucide-react"

import { ConteudoResumo } from "@/components/resumos/ConteudoResumo"
import { Carregando } from "@/components/shared/Skeletons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useConfirmar } from "@/features/confirmacao/confirmacao-context"
import { arquivarResumo, obterResumo } from "@/features/resumos/api/resumos-api"
import { resumoParaTexto } from "@/features/resumos/formatacao"
import { notificar } from "@/lib/toast"

interface VisaoResumoProps {
  resumoId: number
  aoVoltar: () => void
}

export function VisaoResumo({ resumoId, aoVoltar }: VisaoResumoProps) {
  const queryClient = useQueryClient()
  const confirmar = useConfirmar()

  // Um resumo nunca muda depois de criado: o cache pode valer para sempre
  const {
    data: resumo,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["resumos", "detalhe", resumoId],
    queryFn: () => obterResumo(resumoId),
    staleTime: Infinity,
  })

  const arquivar = useMutation({
    mutationFn: () => arquivarResumo(resumoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumos", "lista"] })
      notificar.sucesso("Resumo arquivado")
      aoVoltar()
    },
    onError: (erro) => notificar.erro(erro),
  })

  async function aoArquivar() {
    const confirmado = await confirmar({
      titulo: "Arquivar este resumo?",
      descricao:
        "Ele deixa de aparecer na sua lista. A geração continua contando na sua cota do mês.",
      textoConfirmar: "Arquivar",
      destrutivo: true,
    })
    if (confirmado) arquivar.mutate()
  }

  async function copiar() {
    if (!resumo) return
    try {
      await navigator.clipboard.writeText(resumoParaTexto(resumo))
      notificar.sucesso("Resumo copiado")
    } catch {
      notificar.erro("Não foi possível copiar. Selecione o texto e copie manualmente.")
    }
  }

  const botaoVoltar = (
    <button
      type="button"
      onClick={aoVoltar}
      className="flex min-h-10 cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Voltar
    </button>
  )

  if (isLoading) {
    return (
      <Carregando>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </Carregando>
    )
  }

  if (isError || !resumo) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
        <p className="text-destructive">Não foi possível carregar este resumo.</p>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar de novo
          </Button>
          <Button variant="ghost" size="sm" onClick={aoVoltar}>
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {botaoVoltar}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="min-h-10 sm:min-h-0" onClick={copiar}>
            <Copy className="size-4" />
            Copiar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-h-10 sm:min-h-0"
            onClick={aoArquivar}
            disabled={arquivar.isPending}
          >
            <Archive className="size-4" />
            {arquivar.isPending ? "Arquivando..." : "Arquivar"}
          </Button>
        </div>
      </div>

      <ConteudoResumo resumo={resumo} />
    </div>
  )
}