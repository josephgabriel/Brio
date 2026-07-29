export interface PontoEvolucaoSemanal {
  semana_inicio: string
  horas: number
}

export interface Estatisticas {
  total_horas_estudadas: number
  total_sessoes: number
  evolucao_semanal: PontoEvolucaoSemanal[]
  taxa_conclusao_revisoes: number
  media_concentracao: number
  media_dificuldade: number
  media_aprendizado: number
}

export interface EstatisticasProva extends Estatisticas {
  horas_por_disciplina: Record<string, number>
  nivel_medio_conhecimento: number | null
  indice_preparacao: number | null
  classificacao_indice: "excelente" | "atencao" | "risco" | "critico" | null
  motivos: string[]
}