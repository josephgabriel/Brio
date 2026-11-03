import { apiFetch } from "@/lib/api-client"
import type { AtividadeFormData, OcorrenciaCronograma } from "@/features/cronograma/types"

async function falhar(response: Response, padrao: string): Promise<never> {
  const erro = await response.json().catch(() => null)
  throw new Error(typeof erro?.detail === "string" ? erro.detail : padrao)
}

export async function obterSemanaCronograma(data: string): Promise<OcorrenciaCronograma[]> {
  const response = await apiFetch(`/api/v1/cronograma/semana?data=${data}`)
  if (!response.ok) await falhar(response, "Não foi possível carregar o cronograma")
  return response.json()
}

export async function criarAtividade(dados: AtividadeFormData): Promise<void> {
  const response = await apiFetch("/api/v1/cronograma", {
    method: "POST",
    body: JSON.stringify(dados),
  })
  if (!response.ok) await falhar(response, "Não foi possível criar a atividade")
}

export async function atualizarAtividade(id: number, dados: AtividadeFormData): Promise<void> {
  const response = await apiFetch(`/api/v1/cronograma/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  })
  if (!response.ok) await falhar(response, "Não foi possível salvar a atividade")
}

export async function excluirAtividade(id: number): Promise<void> {
  const response = await apiFetch(`/api/v1/cronograma/${id}`, { method: "DELETE" })
  if (!response.ok) await falhar(response, "Não foi possível remover a atividade")
}

export async function definirConclusaoAtividade(
  id: number,
  data: string,
  concluido: boolean,
): Promise<void> {
  const response = await apiFetch(`/api/v1/cronograma/${id}/conclusao`, {
    method: "PUT",
    body: JSON.stringify({ data, concluido }),
  })
  if (!response.ok) await falhar(response, "Não foi possível atualizar a atividade")
}