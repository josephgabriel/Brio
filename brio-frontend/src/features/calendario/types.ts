export type TipoItemCalendario = "prova" | "sessao" | "revisao" | "evento" | "tarefa"

export interface ItemCalendario {
  tipo: TipoItemCalendario
  id: number
  titulo: string
  data: string
  concluido: boolean | null
  rota: string | null
  detalhe: string | null
}

export type TipoEvento = "evento" | "tarefa"

export interface EventoFormData {
  titulo: string
  data: string
  tipo: TipoEvento
  descricao: string
}