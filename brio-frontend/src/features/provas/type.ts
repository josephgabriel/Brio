export type TipoProva = "enem" | "vestibular" | "concurso"
export type PrioridadeProva = "alta" | "media" | "baixa"
export type StatusProva = "ativa"  | "concluida" | "arquivada"

export interface Prova {
id: number
nome: string
tipo: TipoProva
instituicao_banca: string | null
cargo: string | null
data_prova: string | null
data_divulgacao_edital: string | null
horas_disponiveis_dia: number
doas_disponiveis_semana: number
prioridade: PrioridadeProva
status: StatusProva
criada_em: string
dias_restantes: number | null
}

export interface ProvaFormData {
  nome: string
  tipo: TipoProva
  instituicao_banca: string
  cargo: string
  data_prova: string | null
  data_divulgacao_edital: string
  horas_disponiveis_dia: number
  dias_disponiveis_semana: number
  prioridade: PrioridadeProva
}