import { useState } from "react"
import { Line } from "react-chartjs-2"
import type { ChartData } from "chart.js"

import "@/lib/chart-setup"
import type {
  PontoEvolucaoMensal,
  PontoEvolucaoSemanal,
} from "@/features/estatisticas/types"
import { ESMERALDA, OPCOES_LINHA, gradienteArea } from "@/features/estatisticas/visual"

type Periodo = "semana" | "mes"

function formatarData(data: string, opcoes: Intl.DateTimeFormatOptions): string {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", opcoes)
}

interface GraficoEvolucaoProps {
  semanal: PontoEvolucaoSemanal[]
  mensal: PontoEvolucaoMensal[]
  titulo?: string
}

export function GraficoEvolucao({
  semanal,
  mensal,
  titulo = "Evolução das suas horas",
}: GraficoEvolucaoProps) {
  const [periodo, setPeriodo] = useState<Periodo>("semana")

  const serie =
    periodo === "semana"
      ? {
          rotulos: semanal.map((p) =>
            formatarData(p.semana_inicio, { day: "2-digit", month: "2-digit" }),
          ),
          valores: semanal.map((p) => p.horas),
          nome: "Horas por semana",
          legenda: "Últimas 8 semanas",
        }
      : {
          rotulos: mensal.map((p) => formatarData(p.mes, { month: "short", year: "2-digit" })),
          valores: mensal.map((p) => p.horas),
          nome: "Horas por mês",
          legenda: "Últimos 6 meses",
        }

  const dados: ChartData<"line"> = {
    labels: serie.rotulos,
    datasets: [
      {
        label: serie.nome,
        data: serie.valores,
        borderColor: ESMERALDA.base,
        backgroundColor: gradienteArea,
        borderWidth: 3,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: ESMERALDA.base,
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
      },
    ],
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <p className="text-xs text-muted-foreground">{serie.legenda}</p>
        </div>
        <div className="flex gap-1 rounded-full bg-muted p-1">
          {(["semana", "mes"] as const).map((opcao) => (
            <button
              key={opcao}
              type="button"
              onClick={() => setPeriodo(opcao)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                periodo === opcao
                  ? "bg-emerald-500 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opcao === "semana" ? "Semanas" : "Meses"}
            </button>
          ))}
        </div>
      </div>
      <Line data={dados} options={OPCOES_LINHA} />
    </section>
  )
}