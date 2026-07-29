import { apiFetch } from "@/lib/api-client"
import type { Revisao } from "@/features/revisoes/types"

interface FiltrosRevisoes {
  dataInicio?: string
  dataFim?: string
}

export async function listarRevisoes(filtros: FiltrosRevisoes = {}): Promise<Revisao[]> {
  const params = new URLSearchParams()
  if (filtros.dataInicio) params.set("data_inicio", filtros.dataInicio)
  if (filtros.dataFim) params.set("data_fim", filtros.dataFim)

  const query = params.toString() ? `?${params.toString()}` : ""
  const response = await apiFetch(`/api/v1/revisoes${query}`)
  if (!response.ok) throw new Error("Não foi possível carregar as revisões")
  return response.json()
}

export async function concluirRevisao(id: number): Promise<Revisao> {
  const response = await apiFetch(`/api/v1/revisoes/${id}/concluir`, { method: "PATCH" })
  if (!response.ok) throw new Error("Não foi possível concluir a revisão")
  return response.json()
}