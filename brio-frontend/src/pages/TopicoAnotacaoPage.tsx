import { useState } from "react"
import { Download, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportarAnotacaoPdf, obterAnotacao, salvarAnotacao } from "@/features/anotacoes/api/anotacoes-api"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import { EditorAnotacao } from "@/components/shared/EditorAnotacao"

export function TopicoAnotacaoPage() {
  const { id } = useParams()
  const topicoId = Number(id)
  const navigate = useNavigate()

  // 1. TODOS OS HOOKS DEVEM FICAR NO TOPO (Incondicionais)
  const [exportando, setExportando] = useState(false)

  const { data: anotacao, isLoading, isError } = useQuery({
    queryKey: ["anotacao", topicoId],
    queryFn: () => obterAnotacao(topicoId),
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
    } finally {
      setExportando(false)
    }
  }

  // 2. RETORNOS CONDICIONAIS APENAS APÓS OS HOOKS
  if (isLoading) {
    return <p className="p-6 text-muted-foreground">Carregando anotação...</p>
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

        <Button variant="outline" size="sm" onClick={handleExportar} disabled={exportando}>
          <Download className="size-4" />
          {exportando ? "Exportando..." : "Exportar PDF"}
        </Button>
      </div>

      <div className="w-full">
        <EditorAnotacao
          conteudoInicial={anotacao.conteudo_html}
          onSalvar={(html) => salvar.mutate(html)}
        />
      </div>
    </div>
  )
}