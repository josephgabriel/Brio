import { apiFetch } from "@/lib/api-client"
import type { EventoFormData, ItemCalendario } from "@/features/calendario/types"

async function falhar(response: Response, padrao: string): Promise<never> {
  const erro = await response.json().catch(() => null)
  throw new Error(typeof erro?.detail === "string" ? erro.detail : padrao)
}

export async function obterCalendario(
  dataInicio: string,
  dataFim: string,
): Promise<ItemCalendario[]> {
  const response = await apiFetch(
    `/api/v1/calendario?data_inicio=${dataInicio}&data_fim=${dataFim}`,
  )
  if (!response.ok) await falhar(response, "Não foi possível carregar o calendário")
  return response.json()
}

export async function criarEvento(dados: EventoFormData): Promise<void> {
  const response = await apiFetch("/api/v1/eventos", {
    method: "POST",
    body: JSON.stringify({ ...dados, descricao: dados.descricao || null }),
  })
  if (!response.ok) await falhar(response, "Não foi possível criar o item")
}

export async function atualizarEvento(
  id: number,
  dados: Partial<EventoFormData> & { concluido?: boolean },
): Promise<void> {
  const response = await apiFetch(`/api/v1/eventos/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  })
  if (!response.ok) await falhar(response, "Não foi possível salvar o item")
}

export async function excluirEvento(id: number): Promise<void> {
  const response = await apiFetch(`/api/v1/eventos/${id}`, { method: "DELETE" })
  if (!response.ok) await falhar(response, "Não foi possível excluir o item")
}