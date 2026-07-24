import { apiFetch } from "@/lib/api-client"
import type { Prova, ProvaFormData } from "@/features/provas/types"

function paraPayloadApi(dados: ProvaFormData) {
  return {
    ...dados,
    instituicao_banca: dados.instituicao_banca || null,
    cargo: dados.cargo || null,
    data_divulgacao_edital: dados.data_divulgacao_edital || null,
  }
}

export async function listarProvas(): Promise<Prova[]> {
  const response = await apiFetch("/api/v1/provas")
  if (!response.ok) throw new Error("Não foi possível carregar as provas")
  return response.json()
}

export async function obterProva(id: number): Promise<Prova> {
  const response = await apiFetch(`/api/v1/provas/${id}`)
  if (!response.ok) throw new Error("Prova não encontrada")
  return response.json()
}

export async function criarProva(dados: ProvaFormData): Promise<Prova> {
  const response = await apiFetch("/api/v1/provas", {
    method: "POST",
    body: JSON.stringify(paraPayloadApi(dados)),
  })
  if (!response.ok) throw new Error("Não foi possível criar a prova")
  return response.json()
}

export async function atualizarProva(id: number, dados: ProvaFormData): Promise<Prova> {
  const response = await apiFetch(`/api/v1/provas/${id}`, {
    method: "PUT",
    body: JSON.stringify(paraPayloadApi(dados)),
  })
  if (!response.ok) throw new Error("Não foi possível atualizar a prova")
  return response.json()
}

export async function deletarProva(id: number): Promise<void> {
  const response = await apiFetch(`/api/v1/provas/${id}`, { method: "DELETE" })
  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail ?? "Não foi possível excluir a prova")
  }
}

export async function arquivarProva(id: number): Promise<Prova> {
  const response = await apiFetch(`/api/v1/provas/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status: "arquivada" }),
  })
  if (!response.ok) throw new Error("Não foi possível arquivar a prova")
  return response.json()
}