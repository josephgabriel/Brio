export interface PontoEvolucaoSemanal {
  semana_inicio: string
  horas: number
}

export interface Estatisticas {
  total_horas_estudadas: number
  total_sessoes: number
  horas_por_disciplina: Record<string, number>
  evolucao_semanal: PontoEvolucaoSemanal[]
  taxa_conclusao_revisoes: number
  media_concentracao: number
  media_dificuldade: number
  media_aprendizado: number
}