export interface PontoEvolucaoSemanal {
  semana_inicio: string
  horas: number
}

export interface PontoEvolucaoMensal {
  mes: string
  horas: number
}

export type ClassificacaoIndice = "excelente" | "atencao" | "risco" | "critico"

export interface Estatisticas {
  total_horas_estudadas: number
  total_sessoes: number
  evolucao_semanal: PontoEvolucaoSemanal[]
  evolucao_mensal: PontoEvolucaoMensal[]
  total_conteudos: number
  conteudos_concluidos: number
  cobertura_conteudo: number | null
  taxa_revisoes_em_dia: number | null
  questoes_respondidas: number
  questoes_acertos: number
  taxa_acerto_questoes: number | null
}

export interface EstatisticasProva {
  total_horas_estudadas: number
  total_sessoes: number
  horas_por_disciplina: Record<string, number>
  evolucao_semanal: PontoEvolucaoSemanal[]
  evolucao_mensal: PontoEvolucaoMensal[]
  taxa_revisoes_em_dia: number | null
  cobertura_conteudo: number | null
  indice_preparacao: number | null
  classificacao_indice: ClassificacaoIndice | null
  motivos: string[]
}

export interface ResumoComparacaoProva {
  prova_id: number
  nome: string
  total_horas_estudadas: number
  total_sessoes: number
  taxa_revisoes_em_dia: number | null
  cobertura_conteudo: number | null
  indice_preparacao: number
  classificacao_indice: ClassificacaoIndice
}