import { Line } from "react-chartjs-2"
import { useQuery } from "@tanstack/react-query"

import "@/lib/chart-setup"
import { CardMetrica } from "@/components/shared/CardMetrica"
import { obterEstatisticas } from "@/features/estatisticas/api/estatisticas-api"

const COR_CIANO = "#0891B2"
const COR_BORDA = "#E7E7EA"

function formatarSemana(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  })
}

const OPCOES_COMUNS = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: COR_BORDA } },
    y: { grid: { color: COR_BORDA }, beginAtZero: true },
  },
}

export function EstatisticasPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["estatisticas"],
    queryFn: obterEstatisticas,
  })

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>
  if (isError || !data) {
    return <p className="text-destructive">Não foi possível carregar as estatísticas.</p>
  }

  const dadosLinha = {
    labels: data.evolucao_semanal.map((ponto) => formatarSemana(ponto.semana_inicio)),
    datasets: [
      {
        label: "Horas por semana",
        data: data.evolucao_semanal.map((ponto) => ponto.horas),
        borderColor: COR_CIANO,
        backgroundColor: COR_CIANO,
        tension: 0.3,
      },
    ],
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Estatísticas Gerais</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral da sua produtividade. Para números por matéria, acesse a prova específica.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <CardMetrica label="Total de horas" valor={`${data.total_horas_estudadas}h`} />
        <CardMetrica label="Total de sessões" valor={String(data.total_sessoes)} />
        <CardMetrica
          label="Revisões concluídas"
          valor={`${data.taxa_conclusao_revisoes}%`}
        />
        <CardMetrica label="Aprendizado médio" valor={`${data.media_aprendizado}%`} />
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Evolução semanal</h2>
        <Line data={dadosLinha} options={OPCOES_COMUNS} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <CardMetrica label="Concentração média" valor={`${data.media_concentracao}/5`} />
        <CardMetrica label="Dificuldade média" valor={`${data.media_dificuldade}/5`} />
      </div>
    </div>
  )
}