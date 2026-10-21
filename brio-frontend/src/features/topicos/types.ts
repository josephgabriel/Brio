export interface Topico {
  id: number
  disciplina_id: number
  nome: string
  concluido: boolean
  concluido_em: string | null
  criada_em: string
}