export interface CotaResumos {
  usadas: number
  limite: number
  niveis: string[]
}

export interface ConceitoResumo {
  termo: string
  definicao: string
}

export interface TopicoResumo {
  titulo: string
  pontos: string[]
}

export interface ConteudoResumo {
  titulo: string
  visao_geral: string
  topicos: TopicoResumo[]
  conceitos_chave: ConceitoResumo[]
  para_memorizar: string[]
}

export interface ResumoItem {
  id: number
  nome_arquivo: string
  titulo: string
  nivel: string
  criado_em: string
  paginas_lidas: number
  total_paginas: number
}

export interface ResumoDetalhe extends ResumoItem {
  conteudo: ConteudoResumo
}