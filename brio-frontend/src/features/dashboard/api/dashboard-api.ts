import { apiFetch } from "@/lib/api-client"
import type { DashboardData } from "@/features/dashboard/types"

export async function obterDashboard(): Promise<DashboardData> {
  const response = await apiFetch("/api/v1/dashboard")
  if (!response.ok) throw new Error("Não foi possível carregar o dashboard")
  return response.json()
}