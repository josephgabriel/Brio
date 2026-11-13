import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { CheckCircle2, FileText, RotateCcw } from "lucide-react"

import { Abas } from "@/components/shared/Abas"
import { EstadoVazio } from "@/components/shared/EstadoVazio"
import { HeroPagina, PainelHero } from "@/components/shared/HeroPagina"
import { Carregando } from "@/components/shared/Skeletons"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { dataCurta, dataLonga, diasEntre, rotuloRelativo } from "@/features/calendario/datas"
import { paraISO } from "@/features/calendario/grade"
import { plural } from "@/features/cronograma/semana"
import { listarProvas } from "@/features/provas/api/provas-api"
import {
  CHAVE_REVISOES,
  buscarRevisoes,
  useConcluirRevisao,
  type RevisaoItem,
} from "@/features/revisoes/revisoes-lista"

type Aba = "fazer" | "proximas" | "concluidas"

function agrupar<T>(itens: T[], chave: (item: T) => string): [string, T[]][] {
  const mapa = new Map<string, T[]>()
  itens.forEach((item) => {
    const k = chave(item)
    mapa.set(k, [...(mapa.get(k) ?? []), item])
  })
  return [...mapa.entries()]
}

function porData(a: RevisaoItem, b: RevisaoItem): number {
  return (
    a.data_agendada.localeCompare(b.data_agendada) ||
    a.intervalo_numero - b.intervalo_numero ||
    a.id - b.id
  )
}

function dataDaConclusao(r: RevisaoItem): string {
  return paraISO(new Date(r.concluida_em as string))
}

function SerieDePontos({ serie, atualId }: { serie: RevisaoItem[]; atualId: number }) {
  const porNumero = new Map(serie.map((r) => [r.intervalo_numero, r]))
  return (
    <span aria-hidden title="Série de 4 revisões deste estudo" className="inline-flex items-center gap-1">
      {[1, 2, 3, 4].map((n) => {
        const r = porNumero.get(n)
        return (
          <span
            key={n}
            className={`size-1.5 rounded-full ${
              r?.concluida_em ? "bg-emerald-500" : "bg-muted-foreground/40"
            } ${r?.id === atualId ? "ring-2 ring-amber-500/60" : ""}`}
          />
        )
      })}
    </span>
  )
}

interface LinhaRevisaoProps {
  revisao: RevisaoItem
  serie?: RevisaoItem[]
  hojeISO: string
  aoAbrir: (revisao: RevisaoItem) => void
  aoConcluir: (revisao: RevisaoItem) => void
}

function LinhaRevisao({ revisao, serie, hojeISO, aoAbrir, aoConcluir }: LinhaRevisaoProps) {
  const feita = revisao.concluida_em !== null
  const diasAtraso = !feita ? diasEntre(revisao.data_agendada, hojeISO) : 0

  return (
    <li className="flex items-center gap-3 py-3">
      <div
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400"
      >
        <RotateCcw className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${
            feita ? "text-muted-foreground line-through" : ""
          }`}
        >
          {revisao.assunto}
        </p>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="min-w-0 truncate">
            {revisao.disciplina} · Revisão {revisao.intervalo_numero} de 4
          </span>
          {serie && serie.length > 1 && <SerieDePontos serie={serie} atualId={revisao.id} />}
          {diasAtraso > 0 && (
            <span className="text-destructive">
              {diasAtraso === 1 ? "venceu ontem" : `venceu há ${diasAtraso} dias`}
            </span>
          )}
        </p>
      </div>

      {revisao.topico_id !== null && (
        <button
          type="button"
          onClick={() => aoAbrir(revisao)}
          aria-label={`Abrir anotação de ${revisao.assunto}`}
          title="Abrir anotação"
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <FileText className="size-4" />
        </button>
      )}

      <button
        type="button"
        disabled={feita}
        onClick={() => aoConcluir(revisao)}
        aria-pressed={feita}
        aria-label={feita ? `${revisao.assunto}: revisão concluída` : `Concluir revisão de ${revisao.assunto}`}
        title={feita ? "Revisão concluída" : "Marcar como concluída"}
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:hover:bg-transparent"
      >
        {feita ? (
          <CheckCircle2 className="size-5 text-emerald-500" />
        ) : (
          <span
            className={`size-4 rounded-full border-2 ${
              diasAtraso > 0 ? "border-destructive" : "border-muted-foreground/50"
            }`}
          />
        )}
      </button>
    </li>
  )
}

interface SecaoProps extends Omit<LinhaRevisaoProps, "revisao" | "serie"> {
  titulo: string
  itens: RevisaoItem[]
  series: Map<number, RevisaoItem[]>
  atrasadas?: boolean
}

function Secao({ titulo, itens, series, atrasadas = false, ...acoes }: SecaoProps) {
  return (
    <section className="mt-6 first:mt-0">
      <div className="flex items-center justify-between gap-2">
        <h3 className={`text-sm font-semibold ${atrasadas ? "text-destructive" : ""}`}>{titulo}</h3>
        <span className="text-xs text-muted-foreground">{plural(itens.length, "revisão", "revisões")}</span>
      </div>
      <ul className="mt-1 divide-y divide-border">
        {itens.map((revisao) => (
          <LinhaRevisao
            key={revisao.id}
            revisao={revisao}
            serie={revisao.sessao_estudo_id ? series.get(revisao.sessao_estudo_id) : undefined}
            {...acoes}
          />
        ))}
      </ul>
    </section>
  )
}

export function RevisoesPage() {
  const navigate = useNavigate()
  const hojeISO = paraISO(new Date())
  const [aba, setAba] = useState<Aba>("fazer")
  const [provaFiltro, setProvaFiltro] = useState("todas")
  const [limiteConcluidas, setLimiteConcluidas] = useState(30)

  const revisoesQuery = useQuery({ queryKey: CHAVE_REVISOES, queryFn: buscarRevisoes })
  const provasQuery = useQuery({ queryKey: ["provas"], queryFn: listarProvas })
  const concluir = useConcluirRevisao()

  const provasAtivas = (provasQuery.data ?? []).filter((p) => p.status === "ativa")
  const idsAtivas = new Set(provasAtivas.map((p) => p.id))
  const carregando = revisoesQuery.isLoading || provasQuery.isLoading

  const todas = (revisoesQuery.data ?? []).filter(
    (r) => idsAtivas.has(r.prova_id) && (provaFiltro === "todas" || String(r.prova_id) === provaFiltro),
  )
  const pendentes = todas.filter((r) => r.concluida_em === null)
  const paraFazer = pendentes.filter((r) => r.data_agendada <= hojeISO).sort(porData)
  const atrasadas = paraFazer.filter((r) => r.data_agendada < hojeISO)
  const deHoje = paraFazer.filter((r) => r.data_agendada === hojeISO)
  const proximas = pendentes.filter((r) => r.data_agendada > hojeISO).sort(porData)
  const concluidas = todas
    .filter((r) => r.concluida_em !== null)
    .sort((a, b) => new Date(b.concluida_em as string).getTime() - new Date(a.concluida_em as string).getTime())

  const agendadasHoje = todas.filter((r) => r.data_agendada === hojeISO)
  const feitasHoje = agendadasHoje.filter((r) => r.concluida_em !== null).length
  const percentualHoje =
    agendadasHoje.length > 0 ? Math.round((feitasHoje / agendadasHoje.length) * 100) : 0

  const series = new Map<number, RevisaoItem[]>()
  todas.forEach((r) => {
    if (r.sessao_estudo_id) series.set(r.sessao_estudo_id, [...(series.get(r.sessao_estudo_id) ?? []), r])
  })

  let titulo: string
  let texto: string
  if (todas.length === 0) {
    titulo = "Suas revisões aparecem aqui"
    texto = "Cada sessão finalizada agenda 4 revisões automáticas, em 1, 7, 16 e 35 dias."
  } else if (atrasadas.length > 0) {
    titulo = plural(atrasadas.length, "revisão atrasada", "revisões atrasadas")
    texto =
      deHoje.length > 0
        ? `E mais ${plural(deHoje.length, "revisão", "revisões")} para hoje. Comece pela mais antiga.`
        : "Faça uma de cada vez, começando pela mais antiga."
  } else if (deHoje.length > 0) {
    titulo = `${plural(deHoje.length, "revisão", "revisões")} para hoje`
    texto = "Revisar no dia certo é o que faz o conteúdo ficar."
  } else if (agendadasHoje.length > 0) {
    titulo = "Revisões de hoje concluídas"
    texto = "Bom trabalho. O que você revisou hoje fica mais firme na memória."
  } else {
    titulo = "Nada para revisar hoje"
    texto =
      proximas.length > 0
        ? `Próxima revisão: ${rotuloRelativo(proximas[0].data_agendada, hojeISO).toLowerCase()}.`
        : "Finalize uma sessão de estudos para agendar novas revisões."
  }

  function tituloData(iso: string): string {
    const relativo = rotuloRelativo(iso, hojeISO)
    return relativo === "Hoje" || relativo === "Amanhã" || relativo === "Ontem"
      ? `${relativo} · ${dataCurta(iso)}`
      : relativo
  }

  const acoes = {
    hojeISO,
    series,
    aoAbrir: (r: RevisaoItem) => navigate(`/topicos/${r.topico_id}/anotacao`),
    aoConcluir: (r: RevisaoItem) => concluir.mutate(r.id),
  }

  const ABAS: { id: Aba; rotulo: string; total: number }[] = [
    { id: "fazer", rotulo: "Para fazer", total: paraFazer.length },
    { id: "proximas", rotulo: "Próximas", total: proximas.length },
    { id: "concluidas", rotulo: "Concluídas", total: concluidas.length },
  ]

  return (
    <div className="flex flex-col gap-8">
      <HeroPagina rotulo="Suas revisões" titulo={titulo} texto={texto} carregando={carregando}>
        {agendadasHoje.length > 0 && (
          <PainelHero
            rotulo="Hoje"
            valor={feitasHoje}
            unidade={`de ${agendadasHoje.length}`}
            progresso={{ percentual: percentualHoje, rotulo: "Revisões de hoje" }}
          />
        )}
      </HeroPagina>

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Abas<Aba>
            compacto
            rotuloGrupo="Filtrar revisões"
            valor={aba}
            aoMudar={setAba}
            opcoes={ABAS.map(({ id, rotulo, total }) => ({ id, rotulo: `${rotulo} (${total})` }))}
          />

          {provasAtivas.length > 1 && (
            <Select value={provaFiltro} onValueChange={setProvaFiltro}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue>
                  {provaFiltro === "todas"
                    ? "Todas as provas"
                    : provasAtivas.find((p) => String(p.id) === provaFiltro)?.nome}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as provas</SelectItem>
                {provasAtivas.map((prova) => (
                  <SelectItem key={prova.id} value={String(prova.id)}>
                    {prova.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="mt-5">
          {carregando ? (
            <Carregando>
              <ul className="divide-y divide-border">
                {[0, 1, 2, 3].map((i) => (
                  <li key={i} className="flex items-center gap-3 py-3">
                    <Skeleton className="size-9 rounded-lg" />
                    <div className="flex flex-1 flex-col gap-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="size-8 rounded-full" />
                  </li>
                ))}
              </ul>
            </Carregando>
          ) : revisoesQuery.isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
              <p className="text-destructive">Não foi possível carregar as revisões.</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => revisoesQuery.refetch()}>
                Tentar de novo
              </Button>
            </div>
          ) : todas.length === 0 ? (
            <EstadoVazio
              icone={RotateCcw}
              titulo="Nenhuma revisão agendada"
              descricao="Cada sessão finalizada agenda 4 revisões automáticas, em 1, 7, 16 e 35 dias. Elas aparecem aqui."
              acao={{ rotulo: "Iniciar uma sessão", para: "/sessoes" }}
            />
          ) : aba === "fazer" ? (
            paraFazer.length === 0 ? (
              <EstadoVazio
                icone={CheckCircle2}
                titulo="Tudo em dia"
                descricao="Você não tem revisões pendentes para hoje."
                acao={
                  proximas.length > 0
                    ? { rotulo: "Ver as próximas", aoClicar: () => setAba("proximas") }
                    : { rotulo: "Iniciar uma sessão", para: "/sessoes" }
                }
              />
            ) : (
              <>
                {atrasadas.length > 0 && (
                  <Secao atrasadas titulo="Atrasadas" itens={atrasadas} {...acoes} />
                )}
                {deHoje.length > 0 && (
                  <Secao titulo={`Hoje · ${dataCurta(hojeISO)}`} itens={deHoje} {...acoes} />
                )}
              </>
            )
          ) : aba === "proximas" ? (
            proximas.length === 0 ? (
              <EstadoVazio
                icone={RotateCcw}
                titulo="Nenhuma revisão futura"
                descricao="Novas revisões aparecem quando você finaliza sessões de estudo."
                acao={{ rotulo: "Iniciar uma sessão", para: "/sessoes" }}
              />
            ) : (
              agrupar(proximas, (r) => r.data_agendada).map(([data, itens]) => (
                <Secao key={data} titulo={tituloData(data)} itens={itens} {...acoes} />
              ))
            )
          ) : concluidas.length === 0 ? (
            <EstadoVazio
              icone={CheckCircle2}
              titulo="Nenhuma revisão concluída ainda"
              descricao="As revisões que você concluir ficam registradas aqui."
            />
          ) : (
            <>
              {agrupar(concluidas.slice(0, limiteConcluidas), dataDaConclusao).map(([data, itens]) => (
                <Secao
                  key={data}
                  titulo={data === hojeISO ? "Concluídas hoje" : `Concluídas · ${dataLonga(data)}`}
                  itens={itens}
                  {...acoes}
                />
              ))}
              {concluidas.length > limiteConcluidas && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setLimiteConcluidas((n) => n + 30)}
                >
                  Mostrar mais
                </Button>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}