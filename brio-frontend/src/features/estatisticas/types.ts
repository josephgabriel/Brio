export interface PontoEvolucaoSemanal {
  semana_inicio: string
  horas: number
}

export interface PontoEvolucaoMensal {
  mes: string
  horas: number
}

export interface Estatisticas {
  total_horas_estudadas: number
  total_sessoes: number
  evolucao_semanal: PontoEvolucaoSemanal[]
  evolucao_mensal: PontoEvolucaoMensal[]
  taxa_conclusao_revisoes: number
  media_concentracao: number
  media_dificuldade: number
  media_aprendizado: number
}

export interface EstatisticasProva extends Estatisticas {
  horas_por_disciplina: Record<string, number>
  indice_preparacao: number | null
  classificacao_indice: "excelente" | "atencao" | "risco" | "critico" | null
  motivos: string[]
  nivel_medio_conhecimento: number | null
}

export interface ResumoComparacaoProva {
  prova_id: number
  nome: string
  total_horas_estudadas: number
  total_sessoes: number
  taxa_conclusao_revisoes: number
  indice_preparacao: number
  classificacao_indice: "excelente" | "atencao" | "risco" | "critico"
}