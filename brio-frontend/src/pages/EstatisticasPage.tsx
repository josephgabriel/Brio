import { Line, Bar } from "react-chartjs-2"
import { useQuery } from "@tanstack/react-query"

import "@/lib/chart-setup"
import { CardMetrica } from "@/components/shared/CardMetrica"
import { Badge } from "@/components/ui/badge"
import {
  obterEstatisticas,
  obterComparacaoProvas,
} from "@/features/estatisticas/api/estatisticas-api"

const COR_CIANO = "#10B981"
const COR_CIANO_ALPHA = "rgba(8, 145, 178, 0.15)"
const COR_INDIGO = "#065F46"
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

const OPCOES_GRAFICOS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { display: false },
    },
    y: {
      grid: { color: COR_BORDA },
      beginAtZero: true,
    },
  },
}

const CORES_CLASSIFICACAO: Record<string, string> = {
  excelente: "bg-status-excelente text-white",
  atencao: "bg-status-atencao text-white",
  risco: "bg-status-risco text-white",
  critico: "bg-status-critico text-white",
}

export function EstatisticasPage() {
  const {
    data,
    isLoading: isLoadingEstatisticas,
    isError: isErrorEstatisticas,
  } = useQuery({
    queryKey: ["estatisticas"],
    queryFn: obterEstatisticas,
  })

  const { data: comparacaoData } = useQuery({
    queryKey: ["comparacao-provas"],
    queryFn: obterComparacaoProvas,
  })

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

  // Cast seguro para prevenir falhas de propriedades inexistentes
  const dadosApi = data as Record<string, any>

  // Proteção contra undefined nos arrays dos gráficos
  const evolucaoSemanal = Array.isArray(dadosApi.evolucao_semanal)
    ? dadosApi.evolucao_semanal
    : []

  const evolucaoMensal = Array.isArray(dadosApi.evolucao_mensal)
    ? dadosApi.evolucao_mensal
    : []

  // Proteção contra undefined na lista de comparação
  const comparacao = Array.isArray(comparacaoData) ? comparacaoData : []

  // Gráfico de Área (Linha com gradiente preenchido) para frequência semanal
  const dadosEvolucaoSemanal = {
    labels: evolucaoSemanal.map((ponto: { semana_inicio: string }) =>
      formatarSemana(ponto.semana_inicio),
    ),
    datasets: [
      {
        label: "Horas por semana",
        data: evolucaoSemanal.map((ponto: { horas: number }) => ponto.horas),
        borderColor: COR_CIANO,
        backgroundColor: COR_CIANO_ALPHA,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  // Gráfico de Barras para volumes acumulados mensais
  const dadosEvolucaoMensal = {
    labels: evolucaoMensal.map((ponto: { mes: string }) =>
      formatarMes(ponto.mes),
    ),
    datasets: [
      {
        label: "Horas por mês",
        data: evolucaoMensal.map((ponto: { horas: number }) => ponto.horas),
        backgroundColor: COR_INDIGO,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Estatísticas Gerais</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral da sua produtividade. Para números por matéria, acesse a
          prova específica.
        </p>
      </div>

      {/* Métricas Principais */}
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
          label="Aprendizado médio"
          valor={
            dadosApi.media_aprendizado != null
              ? `${dadosApi.media_aprendizado}%`
              : "—"
          }
        />
      </div>

      {/* Visualização de Gráficos Lado a Lado */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Evolução semanal</h2>
            <p className="text-xs text-muted-foreground">
              Acompanhamento de ritmo por semana
            </p>
          </div>
          <div className="h-64">
            {evolucaoSemanal.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sem dados de evolução semanal ainda.
              </p>
            ) : (
              <Line data={dadosEvolucaoSemanal} options={OPCOES_GRAFICOS} />
            )}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Evolução mensal</h2>
            <p className="text-xs text-muted-foreground">
              Volume total trabalhado por mês
            </p>
          </div>
          <div className="h-64">
            {evolucaoMensal.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sem dados de evolução mensal ainda.
              </p>
            ) : (
              <Bar data={dadosEvolucaoMensal} options={OPCOES_GRAFICOS} />
            )}
          </div>
        </div>
      </div>

      {/* Métricas Secundárias */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <CardMetrica
          label="Concentração média"
          valor={
            dadosApi.media_concentracao != null
              ? `${dadosApi.media_concentracao}/5`
              : "—"
          }
        />
        <CardMetrica
          label="Dificuldade média"
          valor={
            dadosApi.media_dificuldade != null
              ? `${dadosApi.media_dificuldade}/5`
              : "—"
          }
        />
      </div>

      {/* Tabela de Comparação */}
      {comparacao.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Comparação entre provas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Prova</th>
                  <th className="pb-2 pr-4">Horas</th>
                  <th className="pb-2 pr-4">Sessões</th>
                  <th className="pb-2 pr-4">Revisões concluídas</th>
                  <th className="pb-2">Índice</th>
                </tr>
              </thead>
              <tbody>
                {comparacao.map((prova: any) => (
                  <tr
                    key={prova.prova_id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-2 pr-4 font-medium">{prova.nome}</td>
                    <td className="py-2 pr-4">
                      {prova.total_horas_estudadas ?? 0}h
                    </td>
                    <td className="py-2 pr-4">{prova.total_sessoes ?? 0}</td>
                    <td className="py-2 pr-4">
                      {prova.taxa_conclusao_revisoes ?? 0}%
                    </td>
                    <td className="py-2">
                      <Badge
                        className={
                          CORES_CLASSIFICACAO[prova.classificacao_indice] ||
                          "bg-muted text-muted-foreground"
                        }
                      >
                        {prova.indice_preparacao ?? "—"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}