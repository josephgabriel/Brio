import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"

import { EditorAnotacao } from "@/components/shared/EditorAnotacao"
import { obterAnotacao, salvarAnotacao } from "@/features/anotacoes/api/anotacoes-api"

export function TopicoAnotacaoPage() {
  const { id } = useParams()
  const topicoId = Number(id)
  const navigate = useNavigate()
  const [carregado, setCarregado] = useState(false)

  const { data: anotacao } = useQuery({
    queryKey: ["anotacao", topicoId],
    queryFn: () => obterAnotacao(topicoId),
  })

  const salvar = useMutation({
    mutationFn: (html: string) => salvarAnotacao(topicoId, html),
  })

  if (!anotacao) {
    return <p className="text-muted-foreground">Carregando...</p>
  }

  if (!carregado) {
    setCarregado(true)
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar
      </button>

      <h1 className="text-xl font-semibold">Anotações</h1>

      <EditorAnotacao
        conteudoInicial={anotacao.conteudo_html}
        onSalvar={(html) => salvar.mutate(html)}
      />
    </div>
  )
}