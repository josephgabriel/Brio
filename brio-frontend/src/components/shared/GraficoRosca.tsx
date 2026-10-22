import type { ChartData, ChartOptions } from "chart.js"
import { Doughnut } from "react-chartjs-2"

import "@/lib/chart-setup"
import { ESMERALDA, OPCOES_ROSCA } from "@/features/estatisticas/visual"

export interface FatiaRosca {
  rotulo: string
  valor: number
  cor: string
}

interface GraficoRoscaProps {
  titulo: string
  fatias: FatiaRosca[]
  textoCentral: string
  legendaCentral: string
  mensagemVazia: string
  sufixo?: string
}

export function GraficoRosca({
  titulo,
  fatias,
  textoCentral,
  legendaCentral,
  mensagemVazia,
  sufixo = "",
}: GraficoRoscaProps) {
  const vazio = fatias.reduce((soma, fatia) => soma + fatia.valor, 0) === 0

  const dados: ChartData<"doughnut"> = vazio
    ? {
        labels: ["Sem dados"],
        datasets: [{ data: [1], backgroundColor: [ESMERALDA.trilho], borderWidth: 0 }],
      }
    : {
        labels: fatias.map((fatia) => fatia.rotulo),
        datasets: [
          {
            data: fatias.map((fatia) => fatia.valor),
            backgroundColor: fatias.map((fatia) => fatia.cor),
            borderWidth: 0,
            borderRadius: 6,
            spacing: 2,
            hoverOffset: 4,
          },
        ],
      }

  const opcoes: ChartOptions<"doughnut"> = vazio
    ? { ...OPCOES_ROSCA, plugins: { legend: { display: false }, tooltip: { enabled: false } } }
    : OPCOES_ROSCA

  const descricao = vazio
    ? `${titulo}: sem dados ainda`
    : `${titulo}: ${fatias.map((fatia) => `${fatia.rotulo} ${fatia.valor}${sufixo}`).join(", ")}`

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground">{titulo}</h3>

      <div role="img" aria-label={descricao} className="relative aspect-square w-40">
        <Doughnut data={dados} options={opcoes} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tabular-nums">
            {vazio ? "—" : textoCentral}
          </span>
          {!vazio && <span className="text-xs text-muted-foreground">{legendaCentral}</span>}
        </div>
      </div>

      {vazio ? (
        <p className="max-w-52 text-center text-xs text-muted-foreground">{mensagemVazia}</p>
      ) : (
        <ul className="flex w-full max-w-44 flex-col gap-1.5 text-xs">
          {fatias.map((fatia) => (
            <li key={fatia.rotulo} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span
                  className="size-2.5 rounded-full border border-emerald-500/30"
                  style={{ backgroundColor: fatia.cor }}
                />
                {fatia.rotulo}
              </span>
              <span className="font-medium tabular-nums">
                {fatia.valor}
                {sufixo}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}