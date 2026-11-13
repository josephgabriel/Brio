import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Play,
  Plus,
} from "lucide-react"

import { FormularioAtividade } from "@/components/cronograma/FormularioAtividade"
import { EstadoVazio } from "@/components/shared/EstadoVazio"
import { HeroPagina, PainelHero } from "@/components/shared/HeroPagina"
import { Carregando } from "@/components/shared/Skeletons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { paraISO } from "@/features/calendario/grade"
import { obterSemanaCronograma } from "@/features/cronograma/api/cronograma-api"
import {
  DIAS_CURTOS,
  dataDeISO,
  diasDaSemana,
  formatarDuracao,
  inicioDaSemana,
  nomeDoDia,
  plural,
  resumoSemana,
  rotuloSemana,
  somarDias,
} from "@/features/cronograma/semana"
import type { OcorrenciaCronograma } from "@/features/cronograma/types"
import { useConcluirAtividade } from "@/features/cronograma/use-concluir-atividade"
import { ICONES_TIPO, corDaAtividade } from "@/features/cronograma/visual"

interface EstadoFormulario {
  atividade: OcorrenciaCronograma | null
}

interface LinhaAtividadeProps {
  atividade: OcorrenciaCronograma
  futura: boolean
  aoEditar: () => void
  aoAlternar: () => void
  aoIniciar: () => void
}

function LinhaAtividade({ atividade, futura, aoEditar, aoAlternar, aoIniciar }: LinhaAtividadeProps) {
  const cor = corDaAtividade(atividade.disciplina_id)
  const Icone = ICONES_TIPO[atividade.tipo]
  const detalhes = [
    atividade.foco,
    atividade.horario_inicio?.slice(0, 5),
    formatarDuracao(atividade.duracao_minutos),
  ]
    .filter(Boolean)
    .join(" · ")

  const podeIniciar =
    atividade.disciplina_id !== null && atividade.prova_id !== null && !atividade.concluido

  return (
    <li className="flex items-center gap-3 py-3">
      <div
        aria-hidden
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${cor.fundo} ${cor.texto}`}
      >
        <Icone className="size-4" />
      </div>

      <button
        type="button"
        onClick={aoEditar}
        title="Editar atividade"
        className="min-w-0 flex-1 cursor-pointer rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <p
          className={`truncate text-sm font-medium ${
            atividade.concluido ? "text-muted-foreground line-through" : ""
          }`}
        >
          {atividade.titulo}
        </p>
        <p className="truncate text-xs text-muted-foreground">{detalhes}</p>
      </button>

      {podeIniciar && (
        <button
          type="button"
          onClick={aoIniciar}
          aria-label={`Iniciar sessão de ${atividade.titulo}`}
          title="Iniciar sessão de estudos"
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Play className="size-4" />
        </button>
      )}

      <button
        type="button"
        disabled={futura}
        onClick={aoAlternar}
        aria-pressed={atividade.concluido}
        aria-label={
          atividade.concluido
            ? `Desmarcar ${atividade.titulo} como concluída`
            : `Marcar ${atividade.titulo} como concluída`
        }
        title={futura ? "Disponível a partir do dia da atividade" : undefined}
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        {atividade.concluido ? (
          <CheckCircle2 className="size-5 text-emerald-500" />
        ) : (
          <span className="size-3.5 rounded-full bg-muted-foreground/40" />
        )}
      </button>
    </li>
  )
}

export function CronogramaPage() {
  const navigate = useNavigate()
  const [inicioSemana, setInicioSemana] = useState(() => inicioDaSemana(new Date()))
  const [diaSelecionado, setDiaSelecionado] = useState(() => paraISO(new Date()))
  const [formulario, setFormulario] = useState<EstadoFormulario | null>(null)

  const hojeISO = paraISO(new Date())
  const dias = diasDaSemana(inicioSemana)
  const inicioISO = paraISO(dias[0])
  const fimISO = paraISO(dias[6])
  const chaveSemana = ["cronograma-semana", inicioISO] as const

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: chaveSemana,
    queryFn: () => obterSemanaCronograma(inicioISO),
  })
  const concluir = useConcluirAtividade(chaveSemana)

  const ocorrencias = data ?? []
  const porDia = new Map<string, OcorrenciaCronograma[]>()
  ocorrencias.forEach((o) => {
    const lista = porDia.get(o.data) ?? []
    lista.push(o)
    porDia.set(o.data, lista)
  })

  const doDia = porDia.get(diaSelecionado) ?? []
  const diaAtual = dataDeISO(diaSelecionado)
  const indiceDiaAtual = (diaAtual.getDay() + 6) % 7
  const minutosDoDia = doDia.reduce((soma, o) => soma + o.duracao_minutos, 0)

  const total = ocorrencias.length
  const concluidas = ocorrencias.filter((o) => o.concluido).length
  const percentual = total > 0 ? Math.round((concluidas / total) * 100) : 0
  const resumo = resumoSemana(ocorrencias, hojeISO, inicioISO, fimISO)

  function irParaSemana(novoInicio: Date) {
    setInicioSemana(novoInicio)
    const novosDias = diasDaSemana(novoInicio)
    // Se a semana tem o dia de hoje, seleciona hoje. Senão, mantém o mesmo dia da semana.
    const hojeNaSemana = novosDias.find((d) => paraISO(d) === hojeISO)
    setDiaSelecionado(paraISO(hojeNaSemana ?? novosDias[indiceDiaAtual]))
  }

  return (
    <div className="flex flex-col gap-8">
      <HeroPagina
        rotulo="Seu cronograma"
        titulo={resumo.titulo}
        texto={resumo.texto}
        carregando={isLoading}
      >
        {total > 0 && (
          <PainelHero
            rotulo="Progresso da semana"
            valor={concluidas}
            unidade={`de ${total}`}
            progresso={{ percentual, rotulo: "Progresso da semana" }}
          />
        )}
      </HeroPagina>

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Minha semana</h2>
            <p className="text-xs text-muted-foreground">{rotuloSemana(dias)}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Semana anterior"
              onClick={() => irParaSemana(somarDias(inicioSemana, -7))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Voltar para hoje"
              title="Hoje"
              onClick={() => irParaSemana(inicioDaSemana(new Date()))}
            >
              <CalendarDays className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Próxima semana"
              onClick={() => irParaSemana(somarDias(inicioSemana, 7))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div role="group" aria-label="Dias da semana" className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
          {dias.map((dia, indice) => {
            const iso = paraISO(dia)
            const atividadesDoDia = porDia.get(iso) ?? []
            const selecionado = iso === diaSelecionado
            const hoje = iso === hojeISO
            const tudoFeito =
              atividadesDoDia.length > 0 && atividadesDoDia.every((o) => o.concluido)
            const destaque = selecionado || hoje

            return (
              <button
                key={iso}
                type="button"
                aria-pressed={selecionado}
                aria-label={`${nomeDoDia(dia)}, ${dia.getDate()}, ${plural(atividadesDoDia.length, "atividade", "atividades")}`}
                onClick={() => setDiaSelecionado(iso)}
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border px-1 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:py-3 ${
                  selecionado
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-border hover:bg-accent"
                }`}
              >
                <span
                  className={`text-[11px] sm:text-xs ${
                    destaque ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                  }`}
                >
                  {DIAS_CURTOS[indice]}
                </span>
                <span
                  className={`text-base font-semibold tabular-nums sm:text-lg ${
                    destaque ? "text-emerald-600 dark:text-emerald-400" : ""
                  }`}
                >
                  {dia.getDate()}
                </span>
                <span aria-hidden className="flex h-1.5 items-center gap-0.5">
                  {Array.from({ length: Math.min(3, atividadesDoDia.length) }, (_, i) => (
                    <span
                      key={i}
                      className={`size-1 rounded-full ${
                        tudoFeito || selecionado ? "bg-emerald-500" : "bg-muted-foreground/50"
                      }`}
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
                {nomeDoDia(diaAtual)}
                {diaSelecionado === hojeISO && (
                  <span className="ml-2 text-xs font-normal text-emerald-600 dark:text-emerald-400">
                    hoje
                  </span>
                )}
              </h3>
              {doDia.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formatarDuracao(minutosDoDia)} planejados
                </p>
              )}
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
              {plural(doDia.length, "atividade", "atividades")}
            </span>
          </div>

          {isLoading ? (
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
          ) : isError ? (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
              <p className="text-destructive">Não foi possível carregar o cronograma.</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
                Tentar de novo
              </Button>
            </div>
          ) : doDia.length === 0 ? (
            <EstadoVazio
              compacto
              className="mt-4"
              icone={CalendarPlus}
              titulo={`Nada planejado para ${nomeDoDia(diaAtual).toLowerCase()}`}
              descricao={
                total === 0
                  ? "Adicione uma atividade e ela se repete toda semana, nesse dia."
                  : undefined
              }
              acao={{ rotulo: "Adicionar atividade", aoClicar: () => setFormulario({ atividade: null }) }}
            />
          ) : (
            <>
              <ul className="mt-2 divide-y divide-border">
                {doDia.map((o) => (
                  <LinhaAtividade
                    key={`${o.item_id}-${o.data}`}
                    atividade={o}
                    futura={o.data > hojeISO}
                    aoEditar={() => setFormulario({ atividade: o })}
                    aoAlternar={() =>
                      concluir.mutate({ itemId: o.item_id, data: o.data, concluido: !o.concluido })
                    }
                    aoIniciar={() =>
                      navigate(`/sessoes?prova_id=${o.prova_id}&disciplina_id=${o.disciplina_id}`)
                    }
                  />
                ))}
              </ul>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFormulario({ atividade: null })}
                >
                  <Plus className="size-4" />
                  Adicionar atividade
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {formulario && (
        <FormularioAtividade
          key={formulario.atividade?.item_id ?? "nova"}
          atividade={formulario.atividade}
          diaPadrao={indiceDiaAtual}
          aoFechar={() => setFormulario(null)}
        />
      )}
    </div>
  )
}