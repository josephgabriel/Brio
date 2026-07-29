export type StatusRevisao = "pendente" | "atrasada" | "concluida"

export interface Revisao {
  id: number
  prova_id: number
  sessao_estudo_id: number
  topico_id: number | null
  disciplina: string
  assunto: string
  intervalo_numero: number
  data_agendada: string
  concluida_em: string | null
  status: StatusRevisao
}