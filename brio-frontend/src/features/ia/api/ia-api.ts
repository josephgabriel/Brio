import { apiFetch } from "@/lib/api-client"
import type {
  AvaliacaoDesempenho,
  CotaIA,
  MaterialComQuestoes,
  ResultadoResposta,
  MaterialDetalhe,
  MaterialResumo,
} from "@/features/ia/types"

async function falhar(response: Response, padrao: string): Promise<never> {
  const erro = await response.json().catch(() => null)
  // Erros de validação do FastAPI trazem "detail" como lista: nesse caso usa a mensagem padrão
  throw new Error(typeof erro?.detail === "string" ? erro.detail : padrao)
}

export async function obterCotaIA(): Promise<CotaIA> {
  const response = await apiFetch("/api/v1/ia/cota")
  if (!response.ok) await falhar(response, "Não foi possível carregar a cota")
  return response.json()
}

export async function gerarQuestoes(
  arquivo: File,
  quantidade: number,
  topicoId?: number,
): Promise<MaterialComQuestoes> {
  const formData = new FormData()
  formData.append("arquivo", arquivo)
  formData.append("quantidade", String(quantidade))
  if (topicoId) formData.append("topico_id", String(topicoId))

  const response = await apiFetch("/api/v1/ia/questoes/gerar", {
    method: "POST",
    body: formData,
  })
  if (!response.ok) await falhar(response, "Não foi possível gerar as questões")
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
  if (!response.ok) await falhar(response, "Não foi possível registrar a resposta")
  return response.json()
}

export async function gerarAvaliacao(materialId: number): Promise<AvaliacaoDesempenho> {
  const response = await apiFetch("/api/v1/ia/avaliacao/gerar", {
    method: "POST",
    body: JSON.stringify({ material_id: materialId }),
  })
  if (!response.ok) await falhar(response, "Não foi possível gerar o diagnóstico")
  return response.json()
}

export async function listarMateriais(): Promise<MaterialResumo[]> {
  const response = await apiFetch("/api/v1/ia/materiais")
  if (!response.ok) await falhar(response, "Não foi possível carregar o histórico")
  return response.json()
}

export async function obterQuestoesDoMaterial(id: number): Promise<MaterialDetalhe> {
  const response = await apiFetch(`/api/v1/ia/materiais/${id}/questoes`)
  if (!response.ok) await falhar(response, "Não foi possível carregar as questões")
  return response.json()
}