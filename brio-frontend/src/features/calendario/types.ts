export type TipoItemCalendario = "prova" | "sessao" | "revisao" | "evento" | "tarefa"

export interface ItemCalendario {
  tipo: TipoItemCalendario
  id: number
  titulo: string
  data: string
  concluido: boolean | null
  rota: string | null
}

export interface EventoFormData {
  titulo: string
  data: string
  tipo: "evento" | "tarefa"
  descricao: string
}