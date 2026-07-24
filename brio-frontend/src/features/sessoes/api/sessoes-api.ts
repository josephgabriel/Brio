import { apiFetch } from "@/lib/api-client"
import type {
  FinalizarSessaoData,
  IniciarSessaoData,
  Sessao,
} from "@/features/sessoes/types"

export async function iniciarSessao(dados: IniciarSessaoData): Promise<Sessao> {
  const response = await apiFetch("/api/v1/sessoes", {
    method: "POST",
    body: JSON.stringify({ ...dados, objetivo: dados.objetivo || null }),
  })
  if (!response.ok) throw new Error("Não foi possível iniciar a sessão")
  return response.json()
}

export async function finalizarSessao(
  id: number,
  dados: FinalizarSessaoData,
): Promise<Sessao> {
  const response = await apiFetch(`/api/v1/sessoes/${id}/finalizar`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  })
  if (!response.ok) throw new Error("Não foi possível finalizar a sessão")
  return response.json()
}

export async function cancelarSessao(id: number): Promise<void> {
  const response = await apiFetch(`/api/v1/sessoes/${id}`, { method: "DELETE" })
  if (!response.ok) throw new Error("Não foi possível cancelar a sessão")
}