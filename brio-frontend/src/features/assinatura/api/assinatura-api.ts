import { apiFetch } from "@/lib/api-client"
import type { Assinatura, Plano } from "@/features/assinatura/types"

export async function obterMinhaAssinatura(): Promise<Assinatura | null> {
  const response = await apiFetch("/api/v1/assinatura/minha")
  if (!response.ok) throw new Error("Não foi possível carregar sua assinatura")
  return response.json()
}

export async function criarAssinatura(plano: Plano): Promise<string> {
  const response = await apiFetch("/api/v1/assinatura/criar", {
    method: "POST",
    body: JSON.stringify({ plano }),
  })
  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail ?? "Não foi possível iniciar a assinatura")
  }
  const dados = await response.json()
  return dados.checkout_url
}

export async function solicitarReembolso(): Promise<void> {
  const response = await apiFetch("/api/v1/assinatura/reembolso", { method: "POST" })
  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail ?? "Não foi possível solicitar o reembolso")
  }
}