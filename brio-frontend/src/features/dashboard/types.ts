import type { Prova } from "@/features/provas/types"

export interface DashboardData {
  horas_hoje: number
  horas_semana: number
  horas_mes: number
  sequencia_dias: number
  revisoes_pendentes_hoje: number
  provas_ativas: number
  provas: Prova[]
  disciplinas_hoje: string[]
}