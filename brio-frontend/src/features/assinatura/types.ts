export type Plano = "mensal" | "anual"
export type StatusAssinatura = "pendente" | "ativa" | "cancelada" | "expirada"

export interface Assinatura {
  plano: Plano
  status: StatusAssinatura
  renovacao_automatica: boolean
  data_inicio: string | null
  data_expiracao: string | null
  criada_em: string
}

export interface Pagamento {
  valor: number
  status: string
  criado_em: string
}