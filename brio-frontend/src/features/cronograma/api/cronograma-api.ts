import { apiFetch } from "@/lib/api-client"
import type { ItemCronograma, ItemCronogramaFormData } from "@/features/cronograma/types"

export async function listarCronograma(): Promise<ItemCronograma[]> {
  const response = await apiFetch("/api/v1/cronograma")
  if (!response.ok) throw new Error("Não foi possível carregar o cronograma")
  return response.json()
}

export async function criarItemCronograma(
  dados: ItemCronogramaFormData,
): Promise<ItemCronograma> {
  const response = await apiFetch("/api/v1/cronograma", {
    method: "POST",
    body: JSON.stringify(dados),
  })
  if (!response.ok) throw new Error("Não foi possível criar o item")
  return response.json()
}

export async function excluirItemCronograma(id: number): Promise<void> {
  const response = await apiFetch(`/api/v1/cronograma/${id}`, { method: "DELETE" })
  if (!response.ok) throw new Error("Não foi possível excluir o item")
}