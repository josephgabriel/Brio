export interface Sessao {
  id: number
  prova_id: number
  disciplina: string
  assunto: string
  objetivo: string | null
  iniciada_em: string
  finalizada_em: string | null
  duracao_minutos: number | null
  concentracao: number | null
  dificuldade: number | null
  aprendizado_percentual: number | null
}

export interface IniciarSessaoData {
  disciplina_id: number
  topico_id: number
  objetivo: string
}

export interface FinalizarSessaoData {
  concentracao: number
  dificuldade: number
  aprendizado_percentual: number
}