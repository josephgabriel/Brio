// Textos e variantes que a pessoa vê nos cards de prova.
// O sistema guarda "media" e "ativa": aqui eles viram o texto legível.
// Se aparecer um valor novo, o texto cru é mostrado como reserva.

export type VariantePrioridade = "prioridade_alta" | "prioridade_media" | "prioridade_baixa"

export const ROTULO_PRIORIDADE: Record<string, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
}

export const ROTULO_STATUS: Record<string, string> = {
  ativa: "Ativa",
  arquivada: "Arquivada",
  concluida: "Concluída",
}

export function variantePrioridade(prioridade: string): VariantePrioridade {
  if (prioridade === "alta") return "prioridade_alta"
  if (prioridade === "media") return "prioridade_media"
  return "prioridade_baixa"
}

export function textoDiasRestantes(dias: number | null): string {
  if (dias === null) return "Data não definida"
  if (dias < 0) return "Prova já passou"
  if (dias === 0) return "A prova é hoje"
  return dias === 1 ? "Falta 1 dia" : `Faltam ${dias} dias`
}
