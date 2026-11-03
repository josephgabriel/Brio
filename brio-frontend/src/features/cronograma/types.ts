export type TipoAtividade = "estudo" | "revisao" | "questoes" | "simulado"

export interface OcorrenciaCronograma {
  item_id: number
  data: string
  titulo: string
  titulo_personalizado: string | null
  foco: string | null
  tipo: TipoAtividade
  disciplina_id: number | null
  disciplina_nome: string | null
  prova_id: number | null
  prova_nome: string | null
  dia_semana: number
  horario_inicio: string | null
  duracao_minutos: number
  concluido: boolean
}

export interface AtividadeFormData {
  tipo: TipoAtividade
  disciplina_id: number | null
  titulo: string | null
  foco: string | null
  dia_semana: number
  horario_inicio: string | null
  duracao_minutos: number
}