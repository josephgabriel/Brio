import { useParams } from "react-router-dom"
import { Bar, Line } from "react-chartjs-2"
import { useQuery } from "@tanstack/react-query"

import "@/lib/chart-setup"
import { CardMetrica } from "@/components/shared/CardMetrica"
import { IndicePreparacaoCard } from "@/components/shared/IndicePreparacaoCard"
import { obterEstatisticasProva } from "@/features/estatisticas/api/estatisticas-api"

const COR_PADRAO = "#10B981"
const COR_BORDA = "#E7E7EA"

function formatarSemana(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  })
}

function formatarMes(mes: string) {
  const dataFormatada = mes.length === 7 ? `${mes}-01` : mes
  return new Date(`${dataFormatada}T00:00:00`).toLocaleDateString("pt-BR", {
    month: "short",
    year: "2-digit",
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

export function ProvaEstatisticasPage() {
  const { id } = useParams()
  const provaId = Number(id)

  const {
    data,
    isLoading: isLoadingEstatisticas,
    isError: isErrorEstatisticas,
  } = useQuery({
    queryKey: ["estatisticas-prova", provaId],
    queryFn: () => obterEstatisticasProva(provaId),
    enabled: !isNaN(provaId) && provaId > 0,
  })

  // 1. As verificações acontecem PRIMEIRO
  if (isLoadingEstatisticas) {
    return <p className="text-muted-foreground">Carregando...</p>
  }

  if (isErrorEstatisticas || !data) {
    return (
      <p className="text-destructive">
        Não foi possível carregar as estatísticas.
      </p>
    )
  }

  // 2. A declaração das variáveis com acesso ao `data` acontece DEPOIS que garantimos que `data` existe
  const disciplinas = Object.keys(data.horas_por_disciplina || {})
  const horasPorDisciplina = Object.values(data.horas_por_disciplina || {})

  const dadosBarra = {
    labels: disciplinas,
    datasets: [
      {
        label: "Horas estudadas",
        data: horasPorDisciplina,
        backgroundColor: COR_PADRAO,
        borderRadius: 6,
      },
    ],
  }

  const evolucaoSemanal = data.evolucao_semanal || []
  const dadosLinhaSemanal = {
    labels: evolucaoSemanal.map((ponto) =>
      formatarSemana(ponto.semana_inicio),
    ),
    datasets: [
      {
        label: "Horas por semana",
        data: evolucaoSemanal.map((ponto) => ponto.horas),
        borderColor: COR_PADRAO,
        backgroundColor: COR_PADRAO,
        tension: 0.3,
      },
    ],
  }

  // Proteção extra caso a API de provas não retorne a evolução mensal
  const evolucaoMensal = data.evolucao_mensal || []
  const dadosLinhaMensal = {
    labels: evolucaoMensal.map((ponto) => formatarMes(ponto.mes)),
    datasets: [
      {
        label: "Horas por mês",
        data: evolucaoMensal.map((ponto) => ponto.horas),
        borderColor: COR_PADRAO,
        backgroundColor: COR_PADRAO,
        tension: 0.3,
      },
    ],
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Estatísticas da Prova</h1>

      <IndicePreparacaoCard
        indice={data.indice_preparacao}
        classificacao={data.classificacao_indice}
        motivos={data.motivos}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <CardMetrica
          label="Total de horas"
          valor={`${data.total_horas_estudadas}h`}
        />
        <CardMetrica
          label="Total de sessões"
          valor={String(data.total_sessoes)}
        />
        <CardMetrica
          label="Revisões concluídas"
          valor={`${data.taxa_conclusao_revisoes}%`}
        />
        <CardMetrica
          label="Nível médio"
          valor={
            data.nivel_medio_conhecimento === null
              ? "—"
              : `${Math.round(data.nivel_medio_conhecimento)}%`
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Horas por matéria</h2>
          {disciplinas.length === 0 ? (
            <p className="text-muted-foreground">Sem dados ainda.</p>
          ) : (
            <Bar data={dadosBarra} options={OPCOES_COMUNS} />
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Evolução semanal</h2>
          <Line data={dadosLinhaSemanal} options={OPCOES_COMUNS} />
        </div>

        {evolucaoMensal.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold">Evolução mensal</h2>
            <Line data={dadosLinhaMensal} options={OPCOES_COMUNS} />
          </div>
        )}
      </div>
    </div>
  )
}