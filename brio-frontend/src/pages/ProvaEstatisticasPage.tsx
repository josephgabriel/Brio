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

  // 1. Verificações de carregamento e erro
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

  // Cast seguro para acessar propriedades dinâmicas sem erro de TypeScript
  const dadosApi = data as Record<string, any>

  // 2. Extração de dados com proteções completas contra null/undefined
  const horasPorDisciplina = dadosApi.horas_por_disciplina || {}
  const disciplinas = Object.keys(horasPorDisciplina)
  const valoresHoras = Object.values(horasPorDisciplina)

  const dadosBarra = {
    labels: disciplinas,
    datasets: [
      {
        label: "Horas estudadas",
        data: valoresHoras,
        backgroundColor: COR_PADRAO,
        borderRadius: 6,
      },
    ],
  }

  const evolucaoSemanal = Array.isArray(dadosApi.evolucao_semanal)
    ? dadosApi.evolucao_semanal
    : []

  const dadosLinhaSemanal = {
    labels: evolucaoSemanal.map((ponto: { semana_inicio: string }) =>
      formatarSemana(ponto.semana_inicio),
    ),
    datasets: [
      {
        label: "Horas por semana",
        data: evolucaoSemanal.map((ponto: { horas: number }) => ponto.horas),
        borderColor: COR_PADRAO,
        backgroundColor: COR_PADRAO,
        tension: 0.3,
      },
    ],
  }

  const evolucaoMensal = Array.isArray(dadosApi.evolucao_mensal)
    ? dadosApi.evolucao_mensal
    : []

  const dadosLinhaMensal = {
    labels: evolucaoMensal.map((ponto: { mes: string }) =>
      formatarMes(ponto.mes),
    ),
    datasets: [
      {
        label: "Horas por mês",
        data: evolucaoMensal.map((ponto: { horas: number }) => ponto.horas),
        borderColor: COR_PADRAO,
        backgroundColor: COR_PADRAO,
        tension: 0.3,
      },
    ],
  }

  // Garantia de que motivos é um array
  const motivosLista = Array.isArray(dadosApi.motivos) ? dadosApi.motivos : []

  // Leitura segura do nível médio de conhecimento
  const nivelMedio = dadosApi.nivel_medio_conhecimento

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Estatísticas da Prova</h1>

      <IndicePreparacaoCard
        indice={dadosApi.indice_preparacao}
        classificacao={dadosApi.classificacao_indice}
        motivos={motivosLista}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <CardMetrica
          label="Total de horas"
          valor={`${dadosApi.total_horas_estudadas ?? 0}h`}
        />
        <CardMetrica
          label="Total de sessões"
          valor={String(dadosApi.total_sessoes ?? 0)}
        />
        <CardMetrica
          label="Revisões concluídas"
          valor={`${dadosApi.taxa_conclusao_revisoes ?? 0}%`}
        />
        <CardMetrica
          label="Nível médio"
          valor={
            nivelMedio === null || nivelMedio === undefined
              ? "—"
              : `${Math.round(Number(nivelMedio))}%`
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
          {evolucaoSemanal.length === 0 ? (
            <p className="text-muted-foreground">Sem dados ainda.</p>
          ) : (
            <Line data={dadosLinhaSemanal} options={OPCOES_COMUNS} />
          )}
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