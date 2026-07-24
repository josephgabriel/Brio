import { Bar, Line } from "react-chartjs-2"
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

  const disciplinas = Object.keys(data.horas_por_disciplina)
  const horasPorDisciplina = Object.values(data.horas_por_disciplina)

  const dadosBarra = {
    labels: disciplinas,
    datasets: [
      {
        label: "Horas estudadas",
        data: horasPorDisciplina,
        backgroundColor: COR_CIANO,
        borderRadius: 6,
      },
    ],
  }

  const dadosLinha = {
    labels: data.evolucao_semanal.map((ponto) => formatarSemana(ponto.semana_inicio)),
    datasets: [
      {
        label: "Horas por semana",
        data: data.evolucao_semanal.map((ponto) => ponto.horas),
        borderColor: COR_BORDA,
        backgroundColor: COR_CIANO,
        tension: 0.3,
      },
    ],
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Estatísticas</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <CardMetrica label="Total de horas" valor={`${data.total_horas_estudadas}h`} />
        <CardMetrica label="Total de sessões" valor={String(data.total_sessoes)} />
        <CardMetrica
          label="Revisões concluídas"
          valor={`${data.taxa_conclusao_revisoes}%`}
        />
        <CardMetrica label="Aprendizado médio" valor={`${data.media_aprendizado}%`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Horas por disciplina</h2>
          {disciplinas.length === 0 ? (
            <p className="text-muted-foreground">Sem dados ainda.</p>
          ) : (
            <Bar data={dadosBarra} options={OPCOES_COMUNS} />
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Evolução semanal</h2>
          <Line data={dadosLinha} options={OPCOES_COMUNS} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <CardMetrica label="Concentração média" valor={`${data.media_concentracao}/5`} />
        <CardMetrica label="Dificuldade média" valor={`${data.media_dificuldade}/5`} />
      </div>
    </div>
  )
}