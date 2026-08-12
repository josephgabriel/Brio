import { apiFetch } from "@/lib/api-client"

export async function enviarImagem(arquivo: File): Promise<string> {
  const formData = new FormData()
  formData.append("arquivo", arquivo)

  const response = await apiFetch("/api/v1/uploads/imagem", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail ?? "Não foi possível enviar a imagem")
  }

  const dados = await response.json()
  return dados.url
}