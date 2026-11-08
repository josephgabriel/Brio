import { apiFetch } from "@/lib/api-client"
import type { CotaResumos, ResumoDetalhe, ResumoItem } from "@/features/resumos/types"

async function falhar(response: Response, padrao: string): Promise<never> {
  const erro = await response.json().catch(() => null)
  throw new Error(typeof erro?.detail === "string" ? erro.detail : padrao)
}

export async function obterCotaResumos(): Promise<CotaResumos> {
  const response = await apiFetch("/api/v1/ia/resumos/cota")
  if (!response.ok) await falhar(response, "Não foi possível carregar a cota")
  return response.json()
}

export async function gerarResumo(arquivo: File, nivel: string): Promise<ResumoDetalhe> {
  const formData = new FormData()
  formData.append("arquivo", arquivo)
  formData.append("nivel", nivel)

  const response = await apiFetch("/api/v1/ia/resumos", { method: "POST", body: formData })
  if (!response.ok) await falhar(response, "Não foi possível gerar o resumo")
  return response.json()
}

export async function listarResumos(): Promise<ResumoItem[]> {
  const response = await apiFetch("/api/v1/ia/resumos")
  if (!response.ok) await falhar(response, "Não foi possível carregar os resumos")
  return response.json()
}

export async function obterResumo(id: number): Promise<ResumoDetalhe> {
  const response = await apiFetch(`/api/v1/ia/resumos/${id}`)
  if (!response.ok) await falhar(response, "Não foi possível carregar o resumo")
  return response.json()
}

export async function arquivarResumo(id: number): Promise<void> {
  const response = await apiFetch(`/api/v1/ia/resumos/${id}`, { method: "DELETE" })
  if (!response.ok) await falhar(response, "Não foi possível arquivar o resumo")
}