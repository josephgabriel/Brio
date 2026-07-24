import { apiFetch } from "@/lib/api-client"
import type { Disciplina } from "@/features/disciplinas/types"

export async function listarDisciplinas(provaId: number): Promise<Disciplina[]> {
  const response = await apiFetch(`/api/v1/provas/${provaId}/disciplinas`)
  if (!response.ok) throw new Error("Não foi possível carregar as matérias")
  return response.json()
}

export async function criarDisciplina(provaId: number, nome: string): Promise<Disciplina> {
  const response = await apiFetch(`/api/v1/provas/${provaId}/disciplinas`, {
    method: "POST",
    body: JSON.stringify({ nome }),
  })
  if (!response.ok) throw new Error("Não foi possível criar a matéria")
  return response.json()
}

export async function deletarDisciplina(id: number): Promise<void> {
  const response = await apiFetch(`/api/v1/disciplinas/${id}`, { method: "DELETE" })
  if (!response.ok) throw new Error("Não foi possível excluir a matéria")
}