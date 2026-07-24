import { apiFetch } from "@/lib/api-client"
import type { Estatisticas } from "@/features/estatisticas/types"

export async function obterEstatisticas(): Promise<Estatisticas> {
  const response = await apiFetch("/api/v1/estatisticas")
  if (!response.ok) throw new Error("Não foi possível carregar as estatísticas")
  return response.json()
}