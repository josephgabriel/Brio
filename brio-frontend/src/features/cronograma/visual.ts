import { BookOpen, ClipboardCheck, ListChecks, RotateCcw, type LucideIcon } from "lucide-react"

import type { TipoAtividade } from "@/features/cronograma/types"

export const ROTULOS_TIPO: Record<TipoAtividade, string> = {
  estudo: "Estudo",
  revisao: "Revisão",
  questoes: "Questões",
  simulado: "Simulado",
}

export const ICONES_TIPO: Record<TipoAtividade, LucideIcon> = {
  estudo: BookOpen,
  revisao: RotateCcw,
  questoes: ListChecks,
  simulado: ClipboardCheck,
}

export interface CorAtividade {
  fundo: string
  texto: string
}

// As classes precisam estar escritas por inteiro: o Tailwind só gera o CSS
// do que aparece no código como texto completo (nada de `bg-${cor}-500`).
const PALETA: CorAtividade[] = [
  { fundo: "bg-sky-500/15", texto: "text-sky-600 dark:text-sky-400" },
  { fundo: "bg-amber-500/15", texto: "text-amber-600 dark:text-amber-400" },
  { fundo: "bg-emerald-500/15", texto: "text-emerald-600 dark:text-emerald-400" },
  { fundo: "bg-violet-500/15", texto: "text-violet-600 dark:text-violet-400" },
  { fundo: "bg-rose-500/15", texto: "text-rose-600 dark:text-rose-400" },
  { fundo: "bg-cyan-500/15", texto: "text-cyan-600 dark:text-cyan-400" },
]

const COR_LIVRE = PALETA[2]

export function corDaAtividade(disciplinaId: number | null): CorAtividade {
  if (disciplinaId === null) return COR_LIVRE
  return PALETA[disciplinaId % PALETA.length]
}