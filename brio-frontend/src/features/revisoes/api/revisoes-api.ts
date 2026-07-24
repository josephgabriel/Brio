import { apiFetch } from "@/lib/api-client"
import type { Revisao } from "@/features/revisoes/types"

export async function listarRevisoes(): Promise<Revisao[]> {
  const response = await apiFetch("/api/v1/revisoes")
  if (!response.ok) throw new Error("Não foi possível carregar as revisões")
  return response.json()
}

export async function concluirRevisao(id: number): Promise<Revisao> {
  const response = await apiFetch(`/api/v1/revisoes/${id}/concluir`, {
    method: "PATCH",
  })
  if (!response.ok) throw new Error("Não foi possível concluir a revisão")
  return response.json()
}