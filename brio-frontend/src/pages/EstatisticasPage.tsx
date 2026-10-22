import { Line } from "react-chartjs-2"
import { useQuery } from "@tanstack/react-query"

import "@/lib/chart-setup"
import { CardMetrica } from "@/components/shared/CardMetrica"
import { Carregando, SkeletonGrafico, SkeletonMetricas } from "@/components/shared/Skeletons"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  obterComparacaoProvas,
  obterEstatisticas,
} from "@/features/estatisticas/api/estatisticas-api"

const COR_INDIGO = "#4F46E5"
const COR_BORDA = "#E7E7EA"

const CORES_CLASSIFICACAO: Record<string, string> = {
  excelente: "bg-status-excelente text-white",
  atencao: "bg-status-atencao text-white",
  risco: "bg-status-risco text-white",
  critico: "bg-status-critico text-white",
}

const OPCOES_GRAFICO = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: COR_BORDA } },
    y: { grid: { color: COR_BORDA }, beginAtZero: true },
  },
}

function formatarPercentual(valor: number | null): string {
  return valor === null ? "—" : `${Math.round(valor)}%`
}

function formatarData(data: string, opcoes: Intl.DateTimeFormatOptions): string {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", opcoes)
}

export function EstatisticasPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["estatisticas"],
    queryFn: obterEstatisticas,
  })
  const { data: comparacao } = useQuery({
    queryKey: ["comparacao-provas"],
    queryFn: obterComparacaoProvas,
  })

  if (isLoading) {
    return (
      <Carregando>
        <div className="flex flex-col gap-8">
          <Skeleton className="h-8 w-48" />
          <SkeletonMetricas />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SkeletonGrafico />
            <SkeletonGrafico />
          </div>
          <SkeletonMetricas quantidade={2} className="grid grid-cols-2 gap-4" />
        </div>
      </Carregando>
    )
  }

  if (isError || !data) {
    return <p className="text-destructive">Não foi possível carregar as estatísticas.</p>
  }

  const dadosSemanal = {
    labels: data.evolucao_semanal.map((p) =>
      formatarData(p.semana_inicio, { day: "2-digit", month: "2-digit" }),
    ),
    datasets: [
      {
        label: "Horas por semana",
        data: data.evolucao_semanal.map((p) => p.horas),
        borderColor: COR_INDIGO,
        backgroundColor: COR_INDIGO,
        tension: 0.3,
      },
    ],
  }

  const dadosMensal = {
    labels: data.evolucao_mensal.map((p) =>
      formatarData(p.mes, { month: "short", year: "2-digit" }),
    ),
    datasets: [
      {
        label: "Horas por mês",
        data: data.evolucao_mensal.map((p) => p.horas),
        borderColor: COR_INDIGO,
        backgroundColor: COR_INDIGO,
        tension: 0.3,
      },
    ],
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold">Estatísticas</h1>
        <p className="text-sm text-muted-foreground">
          Seu histórico de estudo e a situação das suas provas ativas. Para o detalhe por
          matéria, abra a prova.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Seu histórico</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <CardMetrica label="Horas estudadas" valor={`${data.total_horas_estudadas}h`} />
          <CardMetrica label="Sessões concluídas" valor={String(data.total_sessoes)} />
          <CardMetrica label="Questões respondidas" valor={String(data.questoes_respondidas)} />
          <CardMetrica
            label="Taxa de acerto"
            valor={formatarPercentual(data.taxa_acerto_questoes)}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-base font-semibold">Evolução semanal</h3>
            <Line data={dadosSemanal} options={OPCOES_GRAFICO} />
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-base font-semibold">Evolução mensal</h3>
            <Line data={dadosMensal} options={OPCOES_GRAFICO} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Situação das provas ativas</h2>
        <div className="grid grid-cols-2 gap-4">
          <CardMetrica
            label="Conteúdos concluídos"
            valor={
              data.total_conteudos === 0
                ? "—"
                : `${data.conteudos_concluidos} de ${data.total_conteudos}`
            }
          />
          <CardMetrica
            label="Revisões em dia"
            valor={formatarPercentual(data.taxa_revisoes_em_dia)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          “Revisões em dia” considera só as revisões que já venceram. As agendadas para o
          futuro não entram na conta.
        </p>

        {comparacao && comparacao.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-base font-semibold">Comparação entre provas</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Prova</th>
                    <th className="pb-2 pr-4">Conteúdos</th>
                    <th className="pb-2 pr-4">Revisões em dia</th>
                    <th className="pb-2 pr-4">Horas</th>
                    <th className="pb-2 pr-4">Sessões</th>
                    <th className="pb-2">Índice</th>
                  </tr>
                </thead>
                <tbody>
                  {comparacao.map((prova) => (
                    <tr key={prova.prova_id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 font-medium">{prova.nome}</td>
                      <td className="py-2 pr-4">{formatarPercentual(prova.cobertura_conteudo)}</td>
                      <td className="py-2 pr-4">
                        {formatarPercentual(prova.taxa_revisoes_em_dia)}
                      </td>
                      <td className="py-2 pr-4">{prova.total_horas_estudadas}h</td>
                      <td className="py-2 pr-4">{prova.total_sessoes}</td>
                      <td className="py-2">
                        <Badge className={CORES_CLASSIFICACAO[prova.classificacao_indice]}>
                          {prova.indice_preparacao}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}