import { useState } from "react"
import { Download, ArrowLeft, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportarAnotacaoPdf, obterAnotacao, salvarAnotacao } from "@/features/anotacoes/api/anotacoes-api"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import { EditorAnotacao } from "@/components/shared/EditorAnotacao"
import { notificar } from "@/lib/toast"
import { Carregando, SkeletonEditor } from "@/components/shared/Skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export function TopicoAnotacaoPage() {
  const { id } = useParams()
  const topicoId = Number(id)
  const navigate = useNavigate()

  // 1. TODOS OS HOOKS DEVEM FICAR NO TOPO (Incondicionais)
  const [exportando, setExportando] = useState(false)

  const { data: anotacao, isLoading, isError } = useQuery({
  queryKey: ["anotacao", topicoId],
  queryFn: () => obterAnotacao(topicoId),
  staleTime: Infinity,
  gcTime: 0,
})

  const salvar = useMutation({
    mutationFn: (html: string) => salvarAnotacao(topicoId, html),
  })

  // Função para exportar PDF
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
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-7 w-32" />
          <SkeletonEditor />
        </div>
      </Carregando>
    )
  }

  if (isError || !anotacao) {
    return <p className="p-6 text-destructive">Erro ao carregar a anotação.</p>
  }

  // 3. ESTRUTURA DE LAYOUT (Flex-Col para empilhar topo e editor)
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </button>
          <h1 className="text-xl font-semibold">Anotações</h1>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate(`/sessoes?topico_id=${topicoId}`)}>
         <Play className="size-4" />
         Iniciar sessão
         </Button>

        <Button variant="outline" size="sm" onClick={handleExportar} disabled={exportando}>
          <Download className="size-4" />
          {exportando ? "Exportando..." : "Exportar PDF"}
        </Button>
      </div>

      <div className="w-full">
        <EditorAnotacao
         key={topicoId}
         conteudoInicial={anotacao.conteudo_html}
         chaveRascunho={`topico-${topicoId}`}
         onSalvar={(html) => salvar.mutateAsync(html)}
/>
      </div>
    </div>
  )
}