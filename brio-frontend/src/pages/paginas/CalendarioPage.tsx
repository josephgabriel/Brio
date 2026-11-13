import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { CalendarCheck, CalendarPlus, ChevronLeft, ChevronRight, Plus } from "lucide-react"

import { AdicionarRapido } from "@/components/calendario/AdicionarRapido"
import { FormularioEvento } from "@/components/calendario/FormularioEvento"
import { ItemDoDia } from "@/components/calendario/ItemDoDia"
import { Abas } from "@/components/shared/Abas"
import { EstadoVazio } from "@/components/shared/EstadoVazio"
import { HeroPagina, PainelHero } from "@/components/shared/HeroPagina"
import { Carregando } from "@/components/shared/Skeletons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { obterCalendario } from "@/features/calendario/api/calendario-api"
import {
  CAMADAS,
  ORDEM_CAMADAS,
  ehAtrasado,
  lerCamadas,
  ordenar,
  salvarCamadas,
  type Camadas,
} from "@/features/calendario/camadas"
import {
  dataCurta,
  dataLonga,
  diasEntre,
  rotuloMes,
  rotuloRelativo,
} from "@/features/calendario/datas"
import { gerarDiasDoMes, paraISO } from "@/features/calendario/grade"
import { resumoCalendario } from "@/features/calendario/resumo"
import type { ItemCalendario, TipoItemCalendario } from "@/features/calendario/types"
import { useConcluirItem } from "@/features/calendario/use-concluir-item"
import { plural, somarDias } from "@/features/cronograma/semana"

type Visao = "mes" | "agenda"

interface EstadoFormulario {
  item: ItemCalendario | null
  data: string
}

const CABECALHO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const DIAS_ATRAS = 90
const DIAS_FRENTE = 400 // longe o bastante para a contagem regressiva da próxima prova
const DIAS_AGENDA = 60
const MAX_CHIPS = 3

function agruparPorData(itens: ItemCalendario[]): [string, ItemCalendario[]][] {
  const mapa = new Map<string, ItemCalendario[]>()
  itens.forEach((item) => {
    const lista = mapa.get(item.data) ?? []
    lista.push(item)
    mapa.set(item.data, lista)
  })
  return [...mapa.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, lista]): [string, ItemCalendario[]] => [data, ordenar(lista)])
}

function EsqueletoLista() {
  return (
    <Carregando>
      <ul className="mt-2 divide-y divide-border">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-center gap-3 py-3">
            <Skeleton className="size-9 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="size-8 rounded-full" />
          </li>
        ))}
      </ul>
    </Carregando>
  )
}

function ErroLista({ aoTentar }: { aoTentar: () => void }) {
  return (
    <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
      <p className="text-destructive">Não foi possível carregar o calendário.</p>
      <Button variant="outline" size="sm" className="mt-3" onClick={aoTentar}>
        Tentar de novo
      </Button>
    </div>
  )
}

interface SecaoAgendaProps {
  titulo: string
  itens: ItemCalendario[]
  hojeISO: string
  atrasadas?: boolean
  vazio?: string
  aoAbrir: (item: ItemCalendario) => void
  aoAlternar: (item: ItemCalendario, concluido: boolean) => void
}

function SecaoAgenda({
  titulo,
  itens,
  hojeISO,
  atrasadas = false,
  vazio,
  aoAbrir,
  aoAlternar,
}: SecaoAgendaProps) {
  return (
    <section className="mt-6 first:mt-0">
      <div className="flex items-center justify-between gap-2">
        <h3 className={`text-sm font-semibold ${atrasadas ? "text-destructive" : ""}`}>
          {titulo}
        </h3>
        <span className="text-xs text-muted-foreground">{plural(itens.length, "item", "itens")}</span>
      </div>
      {itens.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{vazio}</p>
      ) : (
        <ul className="mt-1 divide-y divide-border">
          {itens.map((item) => (
            <ItemDoDia
              key={`${item.tipo}-${item.id}`}
              item={item}
              hojeISO={hojeISO}
              mostrarAtraso={atrasadas}
              aoAbrir={aoAbrir}
              aoAlternar={aoAlternar}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

export function CalendarioPage() {
  const navigate = useNavigate()
  const hoje = new Date()
  const hojeISO = paraISO(hoje)

  const [visao, setVisao] = useState<Visao>("mes")
  const [mesVisivel, setMesVisivel] = useState(
    () => new Date(hoje.getFullYear(), hoje.getMonth(), 1),
  )
  const [diaSelecionado, setDiaSelecionado] = useState(hojeISO)
  const [camadas, setCamadas] = useState<Camadas>(lerCamadas)
  const [formulario, setFormulario] = useState<EstadoFormulario | null>(null)

  const diasGrade = gerarDiasDoMes(mesVisivel)
  const inicioGrade = paraISO(diasGrade[0])
  const fimGrade = paraISO(diasGrade[diasGrade.length - 1])
  const janelaInicio = paraISO(somarDias(hoje, -DIAS_ATRAS))
  const janelaFim = paraISO(somarDias(hoje, DIAS_FRENTE))

  // O mês busca só a grade que está na tela. A janela alimenta o topo e a Agenda.
  // As duas chaves começam com "calendario", então uma mudança atualiza as duas.
  const mesQuery = useQuery({
    queryKey: ["calendario", "mes", inicioGrade, fimGrade],
    queryFn: () => obterCalendario(inicioGrade, fimGrade),
  })
  const janelaQuery = useQuery({
    queryKey: ["calendario", "janela", janelaInicio, janelaFim],
    queryFn: () => obterCalendario(janelaInicio, janelaFim),
  })
  const concluir = useConcluirItem()

  const itensMes = mesQuery.data ?? []
  const janela = janelaQuery.data ?? []
  const visivel = (itens: ItemCalendario[]) => itens.filter((i) => camadas[i.tipo])

  // Topo: não depende das camadas ligadas, para o resumo ser sempre fiel
  const proximaProva = janela
    .filter((i) => i.tipo === "prova" && i.data >= hojeISO)
    .sort((a, b) => a.data.localeCompare(b.data))[0]
  const proxima = proximaProva
    ? { nome: proximaProva.titulo, dias: diasEntre(hojeISO, proximaProva.data) }
    : null
  const pendentesHoje = janela.filter(
    (i) =>
      i.data === hojeISO &&
      i.concluido === false &&
      (i.tipo === "tarefa" || i.tipo === "revisao"),
  ).length
  const totalAtrasadas = janela.filter((i) => ehAtrasado(i, hojeISO)).length
  const resumo = resumoCalendario(proxima, pendentesHoje, totalAtrasadas)

  // Mês
  const porDia = new Map(agruparPorData(visivel(itensMes)))
  const doDia = porDia.get(diaSelecionado) ?? []
  const escondidos = itensMes.filter((i) => i.data === diaSelecionado).length - doDia.length

  // Agenda
  const atrasadasVisiveis = visivel(janela)
    .filter((i) => ehAtrasado(i, hojeISO))
    .sort((a, b) => a.data.localeCompare(b.data))
  const gruposAgenda = agruparPorData(
    visivel(janela).filter((i) => i.data >= hojeISO && diasEntre(hojeISO, i.data) <= DIAS_AGENDA),
  )
  const itensHoje = gruposAgenda.find(([data]) => data === hojeISO)?.[1] ?? []
  const outrosDias = gruposAgenda.filter(([data]) => data !== hojeISO)

  function tituloAgenda(iso: string): string {
    const relativo = rotuloRelativo(iso, hojeISO)
    return relativo === "Hoje" || relativo === "Amanhã" ? `${relativo} · ${dataCurta(iso)}` : relativo
  }

  function abrir(item: ItemCalendario) {
    if (item.tipo === "tarefa" || item.tipo === "evento") {
      setFormulario({ item, data: item.data })
    } else if (item.rota) {
      navigate(item.rota)
    }
  }

  function alternar(item: ItemCalendario, concluido: boolean) {
    concluir.mutate({ item, concluido })
  }

  function alternarCamada(tipo: TipoItemCalendario) {
    // Preferência só é salva quando o usuário clica, nunca ao carregar a página
    const novas = { ...camadas, [tipo]: !camadas[tipo] }
    setCamadas(novas)
    salvarCamadas(novas)
  }

  function irParaMes(deslocamento: number) {
    const novo = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() + deslocamento, 1)
    setMesVisivel(novo)
    const ehMesDeHoje =
      novo.getFullYear() === hoje.getFullYear() && novo.getMonth() === hoje.getMonth()
    setDiaSelecionado(ehMesDeHoje ? hojeISO : paraISO(novo))
  }

  function irParaHoje() {
    setMesVisivel(new Date(hoje.getFullYear(), hoje.getMonth(), 1))
    setDiaSelecionado(hojeISO)
  }

  function selecionarDia(dia: Date) {
    setDiaSelecionado(paraISO(dia))
    // Tocar num dia de outro mês leva a grade para aquele mês
    if (dia.getMonth() !== mesVisivel.getMonth()) {
      setMesVisivel(new Date(dia.getFullYear(), dia.getMonth(), 1))
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <HeroPagina
        rotulo="Seu calendário"
        titulo={resumo.titulo}
        texto={resumo.texto}
        carregando={janelaQuery.isLoading}
      >
        {proximaProva && proxima && (
          <PainelHero
            grande
            rotulo="Próxima prova"
            valor={proxima.dias}
            unidade={proxima.dias === 1 ? "dia" : "dias"}
          >
            <p className="mt-2 truncate text-sm text-white/85">
              {proxima.nome} · {dataCurta(proximaProva.data)}
            </p>
          </PainelHero>
        )}
      </HeroPagina>

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {visao === "mes" ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Mês anterior"
                  onClick={() => irParaMes(-1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Próximo mês"
                  onClick={() => irParaMes(1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
                <h2 className="ml-1 text-lg font-semibold">{rotuloMes(mesVisivel)}</h2>
              </>
            ) : (
              <h2 className="text-lg font-semibold">Agenda</h2>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {visao === "mes" && (
              <Button variant="outline" size="sm" onClick={irParaHoje}>
                Hoje
              </Button>
            )}
            <Abas<Visao>
              compacto
              rotuloGrupo="Visão do calendário"
              valor={visao}
              aoMudar={setVisao}
              opcoes={[
                { id: "mes", rotulo: "Mês" },
                { id: "agenda", rotulo: "Agenda" },
              ]}
            />
            <Button
              size="sm"
              onClick={() =>
                setFormulario({ item: null, data: visao === "mes" ? diaSelecionado : hojeISO })
              }
            >
              <Plus className="size-4" />
              Novo item
            </Button>
          </div>
        </div>

        <div role="group" aria-label="Camadas do calendário" className="mt-4 flex flex-wrap gap-2">
          {ORDEM_CAMADAS.map((tipo) => {
            const camada = CAMADAS[tipo]
            const ativa = camadas[tipo]
            return (
              <button
                key={tipo}
                type="button"
                aria-pressed={ativa}
                onClick={() => alternarCamada(tipo)}
                className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  ativa
                    ? "border-border"
                    : "border-transparent bg-muted text-muted-foreground opacity-60"
                }`}
              >
                <span
                  aria-hidden
                  className={`size-2 rounded-full ${ativa ? camada.ponto : "bg-muted-foreground/40"}`}
                />
                {camada.rotulo}
              </button>
            )
          })}
        </div>

        {visao === "mes" ? (
          <>
            <div className="mt-4 grid grid-cols-7 text-center text-xs text-muted-foreground">
              {CABECALHO.map((dia) => (
                <span key={dia} className="pb-2">
                  {dia}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border bg-border">
              {diasGrade.map((dia) => {
                const iso = paraISO(dia)
                const itens = porDia.get(iso) ?? []
                const foraDoMes = dia.getMonth() !== mesVisivel.getMonth()
                const selecionado = iso === diaSelecionado
                const ehHoje = iso === hojeISO

                return (
                  <button
                    key={iso}
                    type="button"
                    aria-pressed={selecionado}
                    aria-current={ehHoje ? "date" : undefined}
                    aria-label={`${dataLonga(iso)}, ${plural(itens.length, "item", "itens")}`}
                    onClick={() => selecionarDia(dia)}
                    className={`flex min-h-[4.5rem] cursor-pointer flex-col items-stretch gap-1 p-1 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:min-h-24 ${
                      selecionado
                        ? "bg-emerald-50 dark:bg-emerald-950/40"
                        : "bg-card hover:bg-accent"
                    }`}
                  >
                    <span
                      className={`flex size-6 items-center justify-center rounded-full text-xs font-medium tabular-nums ${
                        ehHoje
                          ? "bg-emerald-500 text-white"
                          : foraDoMes
                            ? "text-muted-foreground/60"
                            : ""
                      }`}
                    >
                      {dia.getDate()}
                    </span>

                    <span className="hidden flex-col gap-0.5 sm:flex">
                      {itens.slice(0, MAX_CHIPS).map((item) => (
                        <span
                          key={`${item.tipo}-${item.id}`}
                          className={`truncate rounded px-1.5 py-0.5 text-[11px] font-medium ${
                            CAMADAS[item.tipo].chip
                          } ${item.concluido === true ? "line-through opacity-60" : ""} ${
                            foraDoMes ? "opacity-60" : ""
                          }`}
                        >
                          {item.titulo}
                        </span>
                      ))}
                      {itens.length > MAX_CHIPS && (
                        <span className="px-1 text-[11px] text-muted-foreground">
                          +{itens.length - MAX_CHIPS} mais
                        </span>
                      )}
                    </span>

                    <span aria-hidden className="flex flex-wrap gap-0.5 px-0.5 sm:hidden">
                      {itens.slice(0, 4).map((item) => (
                        <span
                          key={`${item.tipo}-${item.id}`}
                          className={`size-1.5 rounded-full ${CAMADAS[item.tipo].ponto}`}
                        />
                      ))}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold">
                    {dataLonga(diaSelecionado)}
                    {diaSelecionado === hojeISO && (
                      <span className="ml-2 text-xs font-normal text-emerald-600 dark:text-emerald-400">
                        hoje
                      </span>
                    )}
                  </h3>
                  {escondidos > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {plural(escondidos, "item escondido", "itens escondidos")} pelas camadas
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {plural(doDia.length, "item", "itens")}
                </span>
              </div>

              <div className="mt-4">
                <AdicionarRapido
                  dataISO={diaSelecionado}
                  rotuloDia={rotuloRelativo(diaSelecionado, hojeISO).toLowerCase()}
                />
              </div>

              {mesQuery.isLoading ? (
                <EsqueletoLista />
              ) : mesQuery.isError ? (
                <ErroLista aoTentar={() => mesQuery.refetch()} />
              ) : doDia.length === 0 ? (
                <EstadoVazio
                  compacto
                  className="mt-4"
                  icone={CalendarPlus}
                  titulo="Nada neste dia"
                  descricao="Use o campo acima para adicionar uma tarefa ou um evento."
                />
              ) : (
                <ul className="mt-2 divide-y divide-border">
                  {doDia.map((item) => (
                    <ItemDoDia
                      key={`${item.tipo}-${item.id}`}
                      item={item}
                      hojeISO={hojeISO}
                      aoAbrir={abrir}
                      aoAlternar={alternar}
                    />
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <div className="mt-5">
            <AdicionarRapido dataISO={hojeISO} rotuloDia="hoje" />

            {janelaQuery.isLoading ? (
              <EsqueletoLista />
            ) : janelaQuery.isError ? (
              <ErroLista aoTentar={() => janelaQuery.refetch()} />
            ) : atrasadasVisiveis.length === 0 && gruposAgenda.length === 0 ? (
              <EstadoVazio
                className="mt-6"
                icone={CalendarCheck}
                titulo="Nada na agenda"
                descricao="Adicione uma tarefa acima, ou marque a data de uma prova para ver a contagem regressiva."
              />
            ) : (
              <div className="mt-6">
                {atrasadasVisiveis.length > 0 && (
                  <SecaoAgenda
                    atrasadas
                    titulo="Atrasadas"
                    itens={atrasadasVisiveis}
                    hojeISO={hojeISO}
                    aoAbrir={abrir}
                    aoAlternar={alternar}
                  />
                )}
                <SecaoAgenda
                  titulo={tituloAgenda(hojeISO)}
                  itens={itensHoje}
                  hojeISO={hojeISO}
                  vazio="Nada para hoje."
                  aoAbrir={abrir}
                  aoAlternar={alternar}
                />
                {outrosDias.map(([data, itens]) => (
                  <SecaoAgenda
                    key={data}
                    titulo={tituloAgenda(data)}
                    itens={itens}
                    hojeISO={hojeISO}
                    aoAbrir={abrir}
                    aoAlternar={alternar}
                  />
                ))}
                {outrosDias.length === 0 && (
                  <p className="mt-6 text-sm text-muted-foreground">
                    Nada agendado para os próximos {DIAS_AGENDA} dias.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {formulario && (
        <FormularioEvento
          key={formulario.item?.id ?? "novo"}
          item={formulario.item}
          dataPadrao={formulario.data}
          aoFechar={() => setFormulario(null)}
        />
      )}
    </div>
  )
}