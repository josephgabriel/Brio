import type { ChartOptions, ScriptableContext } from "chart.js"

// Cores dos gráficos (canvas). Para trocar o tom, mude aqui.
export const ESMERALDA = {
  forte: "#059669",
  base: "#10B981",
  trilho: "rgba(16, 185, 129, 0.15)",
}

export const GRADIENTE_HERO = "linear-gradient(135deg, #064E3B 0%, #059669 60%, #10B981 100%)"

// Cinza neutro com transparência: legível no tema claro e no escuro
const COR_GRADE = "rgba(128, 128, 128, 0.15)"
const COR_TEXTO_EIXO = "#9CA3AF"

export function gradienteArea(contexto: ScriptableContext<"line">): string | CanvasGradient {
  const { ctx, chartArea } = contexto.chart
  // Na primeira renderização a área do gráfico ainda não existe
  if (!chartArea) return "rgba(16, 185, 129, 0.2)"

  const gradiente = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
  gradiente.addColorStop(0, "rgba(16, 185, 129, 0.4)")
  gradiente.addColorStop(1, "rgba(16, 185, 129, 0)")
  return gradiente
}

export const OPCOES_LINHA: ChartOptions<"line"> = {
  responsive: true,
  interaction: { intersect: false, mode: "index" },
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (item) => ` ${item.parsed.y} h` } },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: COR_TEXTO_EIXO } },
    y: { beginAtZero: true, grid: { color: COR_GRADE }, ticks: { color: COR_TEXTO_EIXO } },
  },
}

export const OPCOES_ROSCA: ChartOptions<"doughnut"> = {
  responsive: true,
  cutout: "74%",
  plugins: { legend: { display: false } },
}