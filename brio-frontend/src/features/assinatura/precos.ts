import type { Plano } from "@/features/assinatura/types"

// Única fonte dos preços exibidos no site. O valor COBRADO vem do backend
// (PRECOS em app/application/use_cases/criar_assinatura.py): os dois precisam ser iguais.
export const PRECOS: Record<Plano, number> = {
  mensal: 12.5,
  anual: 120,
}

export function formatarReais(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

const mensalEmUmAno = PRECOS.mensal * 12

// Tudo abaixo é calculado: mudou um preço, estes textos acompanham sozinhos
export const ECONOMIA_ANUAL = Math.round((mensalEmUmAno - PRECOS.anual) * 100) / 100
export const PERCENTUAL_ECONOMIA = Math.round((ECONOMIA_ANUAL / mensalEmUmAno) * 100)
export const EQUIVALENTE_MENSAL_ANUAL = Math.round((PRECOS.anual / 12) * 100) / 100