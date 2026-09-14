import { apiFetch } from "@/lib/api-client"
import type {
  AvaliacaoDesempenho,
  CotaIA,
  MaterialComQuestoes,
  ResultadoResposta,
} from "@/features/ia/types"

export async function obterCotaIA(): Promise<CotaIA> {
  const response = await apiFetch("/api/v1/ia/cota")
  if (!response.ok) throw new Error("Não foi possível carregar a cota")
  return response.json()
}

export async function gerarQuestoes(
  arquivo: File,
  topicoId?: number,
): Promise<MaterialComQuestoes> {
  const formData = new FormData()
  formData.append("arquivo", arquivo)
  if (topicoId) formData.append("topico_id", String(topicoId))

  const response = await apiFetch("/api/v1/ia/questoes/gerar", {
    method: "POST",
    body: formData,
  })
  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail ?? "Não foi possível gerar as questões")
  }
  return response.json()
}

export async function responderQuestao(
  questaoId: number,
  alternativa: string,
): Promise<ResultadoResposta> {
  const response = await apiFetch(`/api/v1/ia/questoes/${questaoId}/responder`, {
    method: "POST",
    body: JSON.stringify({ alternativa }),
  })
  if (!response.ok) throw new Error("Não foi possível registrar a resposta")
  return response.json()
}

export async function gerarAvaliacao(materialId: number): Promise<AvaliacaoDesempenho> {
  const response = await apiFetch("/api/v1/ia/avaliacao/gerar", {
    method: "POST",
    body: JSON.stringify({ material_id: materialId }),
  })
  if (!response.ok) throw new Error("Não foi possível gerar a avaliação")
  return response.json()
}