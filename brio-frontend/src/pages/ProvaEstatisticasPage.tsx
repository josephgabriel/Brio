import { Link, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Lightbulb,
  Timer,
} from "lucide-react"

import { CartaoNumero } from "@/components/shared/CartaoNumero"
import { GraficoEvolucao } from "@/components/shared/GraficoEvolucao"
import { GraficoRosca } from "@/components/shared/GraficoRosca"
import { BarraProgresso } from "@/components/shared/Progresso"
import { Carregando, SkeletonGrafico, SkeletonMetricas } from "@/components/shared/Skeletons"
import { Skeleton } from "@/components/ui/skeleton"
import { listarDisciplinas } from "@/features/disciplinas/api/disciplinas-api"
import { obterEstatisticasProva } from "@/features/estatisticas/api/estatisticas-api"
import { formatarNumero, formatarPercentual } from "@/features/estatisticas/motivacao"
import type { ClassificacaoIndice } from "@/features/estatisticas/types"
import { ESMERALDA, GRADIENTE_HERO } from "@/features/estatisticas/visual"
import { obterProva } from "@/features/provas/api/provas-api"

const ROTULOS_CLASSIFICACAO: Record<ClassificacaoIndice, string> = {
  excelente: "Excelente",
  atencao: "Atenção",
  risco: "Em risco",
  critico: "Crítico",
}

function textoContagem(dias: number | null | undefined): string {
  if (dias === null || dias === undefined) return "Data da prova ainda não definida"
  if (dias < 0) return "Prova já realizada"
  if (dias === 0) return "A prova é hoje"
  return dias === 1 ? "Falta 1 dia para a prova" : `Faltam ${dias} dias para a prova`
}

function arredondar(valor: number): number {
  return Math.round(valor * 10) / 10
}

export function ProvaEstatisticasPage() {
  const { id } = useParams()
  const provaId = Number(id)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["estatisticas-prova", provaId],
    queryFn: () => obterEstatisticasProva(provaId),
  })
  const { data: prova, isLoading: carregandoProva } = useQuery({
    queryKey: ["provas", provaId],
    queryFn: () => obterProva(provaId),
  })
  const { data: disciplinas, isLoading: carregandoDisciplinas } = useQuery({
    queryKey: ["disciplinas", provaId],
    queryFn: () => listarDisciplinas(provaId),
  })

  if (isLoading || carregandoProva || carregandoDisciplinas) {
    return (
      <Carregando>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-44 w-full rounded-3xl" />
          </div>
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
    return (
      <div className="flex flex-col gap-3">
        <p className="text-destructive">Não foi possível carregar as estatísticas desta prova.</p>
        <Link to="/provas" className="text-sm text-primary hover:underline">
          Voltar para as provas
        </Link>
      </div>
    )
  }

  // Conteúdos: tudo vem da lista de matérias (mesma fonte da barra de cada matéria),
  // assim os números desta tela nunca divergem entre si.
  const materias = disciplinas ?? []
  const totalConteudos = materias.reduce((soma, m) => soma + m.total_topicos, 0)
  const conteudosConcluidos = materias.reduce((soma, m) => soma + m.topicos_concluidos, 0)
  const percentualConteudos =
    totalConteudos > 0 ? (conteudosConcluidos / totalConteudos) * 100 : null

  const emDia = data.taxa_revisoes_em_dia === null ? 0 : Math.round(data.taxa_revisoes_em_dia)

  const semanas = data.evolucao_semanal
  const estaSemana = semanas.length > 0 ? semanas[semanas.length - 1].horas : 0
  const metaSemanal = prova ? prova.horas_disponiveis_dia * prova.dias_disponiveis_semana : 0
  const percentualMeta = metaSemanal > 0 ? Math.min(100, (estaSemana / metaSemanal) * 100) : 0

  const tempoPorMateria = Object.entries(data.horas_por_disciplina).sort((a, b) => b[1] - a[1])
  const horasRemovidas = data.horas_materias_removidas
  const totalTempo =
    tempoPorMateria.reduce((soma, [, horas]) => soma + horas, 0) + horasRemovidas

  const semHistorico = data.total_sessoes === 0
  const indice = semHistorico ? null : data.indice_preparacao
  const rotuloIndice = data.classificacao_indice
    ? ROTULOS_CLASSIFICACAO[data.classificacao_indice]
    : null

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <Link
          to={`/provas/${provaId}`}
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para a prova
        </Link>

        <section
          className="relative overflow-hidden rounded-3xl p-8 text-white"
          style={{ background: GRADIENTE_HERO }}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 size-56 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 right-28 size-40 rounded-full bg-white/10" />

          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-md">
              <p className="text-xs font-medium uppercase tracking-widest text-white/70">
                Estatísticas da prova
              </p>
              <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
                {prova?.nome ?? "Sua prova"}
              </h1>
              <p className="mt-3 flex items-center gap-2 text-sm text-white/85">
                <CalendarDays className="size-4" />
                {textoContagem(prova?.dias_restantes)}
              </p>
              {metaSemanal > 0 && (
                <p className="mt-1 text-sm text-white/85">
                  Esta semana: {formatarNumero(estaSemana)} h de {formatarNumero(metaSemanal)} h
                  planejadas
                </p>
              )}
            </div>

            <div className="w-full rounded-2xl bg-black/20 p-5 backdrop-blur-sm sm:w-64">
              <p className="text-xs font-medium uppercase tracking-widest text-white/70">
                Índice de preparação
              </p>
              {indice === null ? (
                <p className="mt-2 text-sm text-white/85">
                  {semHistorico
                    ? "Seu índice aparece depois da primeira sessão de estudos nesta prova."
                    : "Ainda sem dados suficientes."}
                </p>
              ) : (
                <>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-5xl font-semibold leading-none tabular-nums">
                      {indice}
                    </span>
                    <span className="text-sm text-white/70">/ 100</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={indice}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Índice de preparação"
                    className="mt-3 h-2 overflow-hidden rounded-full bg-white/20"
                  >
                    <div
                      className="h-full rounded-full bg-white transition-all duration-700"
                      style={{ width: `${indice}%` }}
                    />
                  </div>
                  {rotuloIndice && (
                    <span className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                      {rotuloIndice}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      {!semHistorico && data.motivos.length > 0 && (
        <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="size-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-semibold">Leitura do seu índice</h2>
          </div>
          <ul className="flex flex-col gap-2 text-sm">
            {data.motivos.map((motivo) => (
              <li key={motivo} className="flex gap-2">
                <span aria-hidden className="text-emerald-500">
                  •
                </span>
                {motivo}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            O índice combina conteúdos concluídos, revisões em dia e sua constância semanal. Ele
            não é uma previsão de aprovação: mostra o quanto seu ritmo está alinhado à meta que
            você definiu.
          </p>
        </section>
      )}

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
          icone={CheckCircle2}
          rotulo="Conteúdos concluídos"
          valor={totalConteudos === 0 ? "—" : `${conteudosConcluidos} de ${totalConteudos}`}
        />
        <CartaoNumero icone={BookOpen} rotulo="Matérias" valor={String(materias.length)} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Seu avanço</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <GraficoRosca
            titulo="Conteúdos concluídos"
            fatias={[
              { rotulo: "Concluídos", valor: conteudosConcluidos, cor: ESMERALDA.base },
              {
                rotulo: "Restantes",
                valor: totalConteudos - conteudosConcluidos,
                cor: ESMERALDA.trilho,
              },
            ]}
            textoCentral={formatarPercentual(percentualConteudos)}
            legendaCentral="concluído"
            mensagemVazia="Cadastre conteúdos nas matérias desta prova e marque os que você concluir."
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
            mensagemVazia="Nenhuma revisão desta prova venceu ainda. Elas aparecem depois da sua primeira sessão."
          />
          <GraficoRosca
            titulo="Meta da semana"
            fatias={
              metaSemanal > 0
                ? [
                    {
                      rotulo: "Estudado",
                      valor: arredondar(Math.min(estaSemana, metaSemanal)),
                      cor: ESMERALDA.base,
                    },
                    {
                      rotulo: "Falta",
                      valor: arredondar(Math.max(metaSemanal - estaSemana, 0)),
                      cor: ESMERALDA.trilho,
                    },
                  ]
                : []
            }
            textoCentral={`${Math.round(percentualMeta)}%`}
            legendaCentral="da meta"
            sufixo=" h"
            mensagemVazia="Defina as horas por dia e os dias por semana na prova para acompanhar sua meta."
          />
        </div>
        <p className="text-xs text-muted-foreground">
          “Revisões em dia” considera só as revisões que já venceram. A meta da semana usa as
          horas por dia e os dias por semana que você definiu na prova.
        </p>
      </section>

      <GraficoEvolucao semanal={data.evolucao_semanal} mensal={data.evolucao_mensal} />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Progresso por matéria</h2>
          {materias.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Esta prova ainda não tem matérias.{" "}
              <Link to={`/provas/${provaId}`} className="text-primary hover:underline">
                Cadastre a primeira
              </Link>
              .
            </p>
          ) : (
            <ul className="flex flex-col gap-5">
              {materias.map((materia) => (
                <li key={materia.id} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium">{materia.nome}</span>
                    {materia.total_topicos > 0 && (
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {materia.topicos_concluidos} de {materia.total_topicos}
                      </span>
                    )}
                  </div>
                  {materia.total_topicos === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Cadastre conteúdos para acompanhar o progresso
                    </p>
                  ) : (
                    <BarraProgresso
                      percentual={materia.progresso_percentual}
                      rotulo={`Progresso em ${materia.nome}`}
                      corPreenchimento="bg-emerald-500"
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

              <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-1 text-lg font-semibold">Onde seu tempo foi</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Quanto do seu tempo de estudo nesta prova foi para cada matéria
          </p>
          {totalTempo === 0 ? (
            <p className="text-sm text-muted-foreground">
              Finalize uma sessão nesta prova para ver como seu tempo se distribui entre as
              matérias.
            </p>
          ) : (
            <>
              <ul className="flex flex-col gap-5">
                {tempoPorMateria.map(([nome, horas]) => {
                  const parte = (horas / totalTempo) * 100
                  return (
                    <li key={nome} className="flex flex-col gap-1.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-medium">{nome}</span>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {formatarNumero(horas)} h · {Math.round(parte)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-emerald-500/20">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${parte}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
              {horasRemovidas > 0 && (
                <p className="mt-5 text-xs text-muted-foreground">
                  Mais {formatarNumero(horasRemovidas)} h ({Math.round((horasRemovidas / totalTempo) * 100)}
                  % do total) foram estudadas em matérias removidas ou sem vínculo.
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}