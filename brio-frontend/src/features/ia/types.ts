export interface CotaIA {
  usadas: number
  limite: number
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