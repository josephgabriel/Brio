export interface CotaIA {
  usadas: number
  limite: number
  quantidades_permitidas: number[]
}

export interface Alternativas {
  A: string
  B: string
  C: string
  D: string
}

export interface Questao {
  id: number
  enunciado: string
  alternativas: Alternativas
}

export interface MaterialComQuestoes {
  material_id: number
  questoes: Questao[]
}

export interface ResultadoResposta {
  correta: boolean
  resposta_correta: string
  explicacao: string
}

export interface AvaliacaoDesempenho {
  diagnostico: string
  total_questoes: number
  total_acertos: number
}

export interface MaterialResumo {
  id: number
  nome_arquivo: string
  criado_em: string
  total_questoes: number
  questoes_respondidas: number
  questoes_acertadas: number
  aproveitamento: number | null
}

export interface QuestaoRevisao {
  id: number
  enunciado: string
  alternativas: Alternativas
  resposta_correta: string
  explicacao: string
  ultima_resposta: string | null
  ultima_acertou: boolean | null
  respondida_em: string | null
}

export interface MaterialDetalhe {
  id: number
  nome_arquivo: string
  criado_em: string
  questoes: QuestaoRevisao[]
}