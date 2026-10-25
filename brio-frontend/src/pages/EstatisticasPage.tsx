import { useQuery } from "@tanstack/react-query"
import {
  Brain,
  CheckCircle2,
  Clock,
  Flame,
  Target,
  Timer,
  Trophy,
  type LucideIcon,
} from "lucide-react"

import { CartaoNumero } from "@/components/shared/CartaoNumero"
import { GraficoEvolucao } from "@/components/shared/GraficoEvolucao"
import { GraficoRosca } from "@/components/shared/GraficoRosca"
import { Carregando, SkeletonGrafico, SkeletonMetricas } from "@/components/shared/Skeletons"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { obterDashboard } from "@/features/dashboard/api/dashboard-api"
import {
  obterComparacaoProvas,
  obterEstatisticas,
} from "@/features/estatisticas/api/estatisticas-api"
import {
  calcularTrilhas,
  formatarNumero,
  formatarPercentual,
  formatarQuantidade,
  mensagemMotivacional,
  type ProgressoTrilha,
} from "@/features/estatisticas/motivacao"
import { ESMERALDA, GRADIENTE_HERO } from "@/features/estatisticas/visual"

const CORES_CLASSIFICACAO: Record<string, string> = {
  excelente: "bg-status-excelente text-white",
  atencao: "bg-status-atencao text-white",
  risco: "bg-status-risco text-white",
  critico: "bg-status-critico text-white",
}

const ICONES_TRILHA: Record<string, LucideIcon> = {
  horas: Clock,
  sessoes: Timer,
  questoes: Brain,
  conteudos: CheckCircle2,
}

function LinhaTrilha({ trilha }: { trilha: ProgressoTrilha }) {
  const Icone = ICONES_TRILHA[trilha.id]
  const proxima = trilha.proximaMeta

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icone className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium">{trilha.titulo}</span>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatarQuantidade(trilha.atual, trilha)}
        </span>
      </div>

      <div
        role="img"
        aria-label={`${trilha.conquistadas.length} de ${trilha.metas.length} marcos conquistados`}
        className="flex gap-1"
      >
        {trilha.metas.map((meta) => {
          const preenchimento =
            trilha.atual >= meta ? 100 : meta === proxima ? trilha.percentualAteProxima : 0
          return (
            <div
              key={meta}
              title={formatarQuantidade(meta, trilha)}
              className="h-2 flex-1 overflow-hidden rounded-full bg-emerald-500/20"
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${preenchimento}%` }}
              />
            </div>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        {proxima === null
          ? "Todos os marcos desta trilha foram conquistados"
          : `Faltam ${formatarQuantidade(proxima - trilha.atual, trilha)} para ${formatarQuantidade(proxima, trilha)}`}
      </p>
    </div>
  )
}

export function EstatisticasPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["estatisticas"],
    queryFn: obterEstatisticas,
  })
  const { data: dashboard } = useQuery({ queryKey: ["dashboard"], queryFn: obterDashboard })
  const { data: comparacao } = useQuery({
    queryKey: ["comparacao-provas"],
    queryFn: obterComparacaoProvas,
  })

  if (isLoading) {
    return (
      <Carregando>
        <div className="flex flex-col gap-8">
          <Skeleton className="h-44 w-full rounded-3xl" />
          <SkeletonMetricas className="grid grid-cols-2 gap-4 lg:grid-cols-4" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
          <SkeletonGrafico />
        </div>
      </Carregando>
    )
  }

  if (isError || !data) {
    return <p className="text-destructive">Não foi possível carregar as estatísticas.</p>
  }

  const sequencia = dashboard?.sequencia_dias ?? 0
  const mensagem = mensagemMotivacional(data, sequencia)
  const trilhas = calcularTrilhas(data)
  const totalConquistas = trilhas.reduce((soma, trilha) => soma + trilha.conquistadas.length, 0)

  const emDia = data.taxa_revisoes_em_dia === null ? 0 : Math.round(data.taxa_revisoes_em_dia)
  const erros = data.questoes_respondidas - data.questoes_acertos

  return (
    <div className="flex flex-col gap-10">
      <h1 className="sr-only">Estatísticas</h1>

      <section
        className="relative overflow-hidden rounded-3xl p-8 text-white"
        style={{ background: GRADIENTE_HERO }}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 size-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 right-28 size-40 rounded-full bg-white/10" />

        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-md">
            <p className="text-xs font-medium uppercase tracking-widest text-white/70">
              Sua jornada
            </p>
            <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">{mensagem.titulo}</h2>
            <p className="mt-2 text-sm text-white/85">{mensagem.texto}</p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-black/20 px-5 py-4 backdrop-blur-sm">
            <Flame className="size-8" />
            <div>
              <p className="text-2xl font-semibold leading-none tabular-nums">{sequencia}</p>
              <p className="mt-1 text-xs text-white/80">
                {sequencia === 1 ? "dia seguido" : "dias seguidos"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <CartaoNumero
          icone={Clock}
          rotulo="Horas estudadas"
          valor={`${formatarNumero(data.total_horas_estudadas)} h`}
        />
        <CartaoNumero
          icone={Timer}
          rotulo="Sessões concluídas"
          valor={String(data.total_sessoes)}
        />
        <CartaoNumero
          icone={Brain}
          rotulo="Questões respondidas"
          valor={String(data.questoes_respondidas)}
        />
        <CartaoNumero
          icone={Target}
          rotulo="Taxa de acerto"
          valor={formatarPercentual(data.taxa_acerto_questoes)}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Seu avanço</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <GraficoRosca
            titulo="Conteúdos concluídos"
            fatias={[
              { rotulo: "Concluídos", valor: data.conteudos_concluidos, cor: ESMERALDA.base },
              {
                rotulo: "Restantes",
                valor: data.total_conteudos - data.conteudos_concluidos,
                cor: ESMERALDA.trilho,
              },
            ]}
            textoCentral={formatarPercentual(data.cobertura_conteudo)}
            legendaCentral="concluído"
            mensagemVazia="Cadastre conteúdos nas suas matérias e marque os que você concluir."
          />
          <GraficoRosca
            titulo="Revisões em dia"
            fatias={
              data.taxa_revisoes_em_dia === null
                ? []
                : [
                    { rotulo: "Em dia", valor: emDia, cor: ESMERALDA.base },
                    { rotulo: "Pendentes", valor: 100 - emDia, cor: ESMERALDA.trilho },
                  ]
            }
            textoCentral={`${emDia}%`}
            legendaCentral="em dia"
            sufixo="%"
            mensagemVazia="Nenhuma revisão venceu ainda. Elas aparecem aqui depois da sua primeira sessão."
          />
          <GraficoRosca
            titulo="Acertos nas questões"
            fatias={[
              { rotulo: "Acertos", valor: data.questoes_acertos, cor: ESMERALDA.base },
              { rotulo: "Erros", valor: erros, cor: ESMERALDA.trilho },
            ]}
            textoCentral={formatarPercentual(data.taxa_acerto_questoes)}
            legendaCentral="de acerto"
            mensagemVazia="Responda questões em Questões IA e acompanhe seu desempenho aqui."
          />
        </div>
        <p className="text-xs text-muted-foreground">
          “Revisões em dia” considera só as revisões que já venceram. As agendadas para o
          futuro não entram na conta.
        </p>
      </section>

      <GraficoEvolucao semanal={data.evolucao_semanal} mensal={data.evolucao_mensal} />

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-semibold">Seus marcos</h2>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            {totalConquistas} {totalConquistas === 1 ? "conquistado" : "conquistados"}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {trilhas.map((trilha) => (
            <LinhaTrilha key={trilha.id} trilha={trilha} />
          ))}
        </div>
      </section>

      {comparacao && comparacao.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Comparação entre provas</h2>
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
                    <td className="py-2 pr-4">{formatarPercentual(prova.taxa_revisoes_em_dia)}</td>
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
        </section>
      )}
    </div>
  )
}