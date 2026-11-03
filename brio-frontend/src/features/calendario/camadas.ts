import {
  CalendarDays,
  GraduationCap,
  ListTodo,
  RotateCcw,
  Timer,
  type LucideIcon,
} from "lucide-react"

import type { ItemCalendario, TipoItemCalendario } from "@/features/calendario/types"

export interface Camada {
  rotulo: string
  icone: LucideIcon
  chip: string
  ponto: string
  iconeFundo: string
  iconeTexto: string
}

// As classes precisam estar escritas por inteiro: o Tailwind só gera o CSS
// do que aparece no código como texto completo.
export const CAMADAS: Record<TipoItemCalendario, Camada> = {
  prova: {
    rotulo: "Provas",
    icone: GraduationCap,
    chip: "bg-emerald-500 text-white",
    ponto: "bg-emerald-500",
    iconeFundo: "bg-emerald-500/15",
    iconeTexto: "text-emerald-600 dark:text-emerald-400",
  },
  tarefa: {
    rotulo: "Tarefas",
    icone: ListTodo,
    chip: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    ponto: "bg-rose-500",
    iconeFundo: "bg-rose-500/15",
    iconeTexto: "text-rose-600 dark:text-rose-400",
  },
  evento: {
    rotulo: "Eventos",
    icone: CalendarDays,
    chip: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    ponto: "bg-violet-500",
    iconeFundo: "bg-violet-500/15",
    iconeTexto: "text-violet-600 dark:text-violet-400",
  },
  revisao: {
    rotulo: "Revisões",
    icone: RotateCcw,
    chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    ponto: "bg-amber-500",
    iconeFundo: "bg-amber-500/15",
    iconeTexto: "text-amber-600 dark:text-amber-400",
  },
  sessao: {
    rotulo: "Sessões",
    icone: Timer,
    chip: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    ponto: "bg-sky-500",
    iconeFundo: "bg-sky-500/15",
    iconeTexto: "text-sky-600 dark:text-sky-400",
  },
}

export const ORDEM_CAMADAS: TipoItemCalendario[] = [
  "prova",
  "tarefa",
  "evento",
  "revisao",
  "sessao",
]

export type Camadas = Record<TipoItemCalendario, boolean>

const CAMADAS_PADRAO: Camadas = {
  prova: true,
  tarefa: true,
  evento: true,
  revisao: true,
  sessao: true,
}

const CHAVE_CAMADAS = "brio_calendario_camadas"

export function lerCamadas(): Camadas {
  try {
    const salvo = localStorage.getItem(CHAVE_CAMADAS)
    if (!salvo) return CAMADAS_PADRAO
    return { ...CAMADAS_PADRAO, ...JSON.parse(salvo) }
  } catch {
    return CAMADAS_PADRAO
  }
}

export function salvarCamadas(camadas: Camadas): void {
  try {
    localStorage.setItem(CHAVE_CAMADAS, JSON.stringify(camadas))
  } catch {
    // Sem armazenamento disponível: a escolha vale só até recarregar a página
  }
}

const PRIORIDADE: Record<TipoItemCalendario, number> = {
  prova: 0,
  tarefa: 1,
  evento: 2,
  revisao: 3,
  sessao: 4,
}

// Provas primeiro, depois tarefas, eventos, revisões e sessões. Dentro de cada
// grupo, o que ainda está pendente vem antes do que já foi feito.
export function ordenar(itens: ItemCalendario[]): ItemCalendario[] {
  return [...itens].sort(
    (a, b) =>
      PRIORIDADE[a.tipo] - PRIORIDADE[b.tipo] ||
      Number(a.concluido === true) - Number(b.concluido === true) ||
      a.titulo.localeCompare(b.titulo, "pt-BR"),
  )
}

// "Atrasado" nunca é guardado: é uma tarefa ou revisão pendente de um dia que já passou.
export function ehAtrasado(item: ItemCalendario, hojeISO: string): boolean {
  return (
    item.data < hojeISO &&
    item.concluido === false &&
    (item.tipo === "tarefa" || item.tipo === "revisao")
  )
}