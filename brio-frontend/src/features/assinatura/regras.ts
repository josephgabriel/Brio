import type { Assinatura } from "@/features/assinatura/types"

export function assinaturaEstaValida(assinatura: Assinatura | null | undefined): boolean {
  if (!assinatura) return false
  if (assinatura.status !== "ativa") return false
  if (!assinatura.data_expiracao) return false
  return new Date(`${assinatura.data_expiracao}T23:59:59`) >= new Date()
}