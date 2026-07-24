import { apiFetch } from "@/lib/api-client"
import type { Topico } from "@/features/topicos/types"

export async function listarTopicos(disciplinaId: number): Promise<Topico[]> {
  const response = await apiFetch(`/api/v1/disciplinas/${disciplinaId}/topicos`)
  if (!response.ok) throw new Error("Não foi possível carregar os conteúdos")
  return response.json()
}

export async function criarTopico(disciplinaId: number, nome: string): Promise<Topico> {
  const response = await apiFetch(`/api/v1/disciplinas/${disciplinaId}/topicos`, {
    method: "POST",
    body: JSON.stringify({ nome }),
  })
  if (!response.ok) throw new Error("Não foi possível criar o conteúdo")
  return response.json()
}

export async function deletarTopico(id: number): Promise<void> {
  const response = await apiFetch(`/api/v1/topicos/${id}`, { method: "DELETE" })
  if (!response.ok) throw new Error("Não foi possível excluir o conteúdo")
}