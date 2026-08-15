export interface ItemCronograma {
  id: number
  disciplina_id: number
  disciplina_nome: string
  prova_nome: string
  dia_semana: number
  horario_inicio: string | null
  duracao_minutos: number
}

export interface ItemCronogramaFormData {
  disciplina_id: number
  dia_semana: number
  duracao_minutos: number
  horario_inicio: string | null
}