import { apiFetch } from "@/lib/api-client"
import type { Estatisticas, EstatisticasProva } from "@/features/estatisticas/types"

export async function obterEstatisticas(): Promise<Estatisticas> {
  const response = await apiFetch("/api/v1/estatisticas")
  if (!response.ok) throw new Error("Não foi possível carregar as estatísticas")
  return response.json()
}

export async function obterEstatisticasProva(provaId: number): Promise<EstatisticasProva> {
  const response = await apiFetch(`/api/v1/provas/${provaId}/estatisticas`)
  if (!response.ok) throw new Error("Não foi possível carregar as estatísticas da prova")
  return response.json()
}