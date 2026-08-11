export type Plano = "mensal" | "anual"
export type StatusAssinatura = "pendente" | "ativa" | "cancelada" | "expirada"

export interface Assinatura {
  plano: Plano
  status: StatusAssinatura
  data_inicio: string | null
  data_expiracao: string | null
  criada_em: string
}