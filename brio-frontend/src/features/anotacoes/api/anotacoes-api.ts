import { apiFetch } from "@/lib/api-client"
import type { Anotacao } from "@/features/anotacoes/types"

export async function obterAnotacao(topicoId: number): Promise<Anotacao> {
  const response = await apiFetch(`/api/v1/topicos/${topicoId}/anotacao`)
  if (!response.ok) throw new Error("Não foi possível carregar a anotação")
  return response.json()
}

export async function salvarAnotacao(topicoId: number, conteudoHtml: string): Promise<Anotacao> {
  const response = await apiFetch(`/api/v1/topicos/${topicoId}/anotacao`, {
    method: "PUT",
    body: JSON.stringify({ conteudo_html: conteudoHtml }),
  })
  if (!response.ok) throw new Error("Não foi possível salvar a anotação")
  return response.json()
}