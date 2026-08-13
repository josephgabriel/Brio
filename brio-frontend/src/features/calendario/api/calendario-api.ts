import { apiFetch } from "@/lib/api-client"
import type { EventoFormData, ItemCalendario } from "@/features/calendario/types"

export async function obterCalendario(
  dataInicio: string,
  dataFim: string,
): Promise<ItemCalendario[]> {
  const response = await apiFetch(
    `/api/v1/calendario?data_inicio=${dataInicio}&data_fim=${dataFim}`,
  )
  if (!response.ok) throw new Error("Não foi possível carregar o calendário")
  return response.json()
}

export async function criarEvento(dados: EventoFormData): Promise<void> {
  const response = await apiFetch("/api/v1/eventos", {
    method: "POST",
    body: JSON.stringify({ ...dados, descricao: dados.descricao || null }),
  })
  if (!response.ok) throw new Error("Não foi possível criar o evento")
}

export async function atualizarEvento(
  id: number,
  dados: Partial<EventoFormData> & { concluido?: boolean },
): Promise<void> {
  const response = await apiFetch(`/api/v1/eventos/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  })
  if (!response.ok) throw new Error("Não foi possível atualizar o evento")
}

export async function excluirEvento(id: number): Promise<void> {
  const response = await apiFetch(`/api/v1/eventos/${id}`, { method: "DELETE" })
  if (!response.ok) throw new Error("Não foi possível excluir o evento")
}