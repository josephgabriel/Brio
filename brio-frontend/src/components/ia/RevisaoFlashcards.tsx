import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  RotateCw,
  SearchX,
  Shuffle,
} from "lucide-react"

import { EstadoVazio } from "@/components/shared/EstadoVazio"
import { Carregando } from "@/components/shared/Skeletons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { plural } from "@/features/cronograma/semana"
import { obterQuestoesDoMaterial } from "@/features/ia/api/ia-api"
import { formatarData } from "@/features/ia/formatacao"
import type { Alternativas, QuestaoRevisao } from "@/features/ia/types"

type Filtro = "todas" | "errei" | "sem_resposta"

// Cada face some quando está de costas. O prefixo -webkit- é para o Safari.
const FACE = "[backface-visibility:hidden] [-webkit-backface-visibility:hidden]"

function embaralhar(ids: number[]): number[] {
  const copia = [...ids]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temporario = copia[i]
    copia[i] = copia[j]
    copia[j] = temporario
  }
  return copia
}

function passaNoFiltro(questao: QuestaoRevisao, filtro: Filtro): boolean {
  if (filtro === "errei") return questao.ultima_acertou === false
  if (filtro === "sem_resposta") return questao.ultima_acertou === null
  return true
}

interface CartaoProps {
  questao: QuestaoRevisao
  numero: number
  total: number
}

// Este componente guarda se o cartão está virado. Como a página o recria a cada questão
// (key), ele sempre começa desvirado, sem animar e sem mostrar a resposta seguinte de relance.
function Cartao({ questao, numero, total }: CartaoProps) {
  const [virado, setVirado] = useState(false)
  const textoCorreta = questao.alternativas[questao.resposta_correta as keyof Alternativas]

  return (
    <div>
      <div className="[perspective:1200px]">
        <div
          onClick={() => setVirado((v) => !v)}
          className={`grid cursor-pointer transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none ${
            virado ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Frente: a pergunta e as alternativas, sem indicar a resposta */}
          <div
            aria-hidden={virado}
            className={`${FACE} rounded-2xl border border-border bg-card p-5 [grid-area:1/1] sm:p-6`}
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Questão {numero} de {total}
            </p>
            <p className="mt-3 font-medium">{questao.enunciado}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {Object.entries(questao.alternativas).map(([letra, texto]) => (
                <li key={letra} className="flex gap-2 rounded-md border border-border p-3 text-sm">
                  <span className="font-medium">{letra})</span>
                  <span className="min-w-0">{texto}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Toque no cartão para ver a resposta
            </p>
          </div>

          {/* Verso: a resposta, a explicação e o que você respondeu da última vez */}
          <div
            aria-hidden={!virado}
            className={`${FACE} rounded-2xl border border-emerald-500/30 bg-card p-5 [grid-area:1/1] [transform:rotateY(180deg)] sm:p-6`}
          >
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Resposta correta
            </p>
            <p className="mt-3 flex gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm font-medium">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              <span className="min-w-0">
                {questao.resposta_correta}) {textoCorreta}
              </span>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {questao.explicacao}
            </p>

            <div className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
              {questao.ultima_acertou === null ? (
                "Você ainda não respondeu esta questão."
              ) : questao.ultima_acertou ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Na última vez ({questao.respondida_em ? formatarData(questao.respondida_em) : ""})
                  você acertou.
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">
                  Na última vez ({questao.respondida_em ? formatarData(questao.respondida_em) : ""})
                  você marcou {questao.ultima_resposta}) e errou.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="mt-4 h-11 w-full sm:h-9"
        onClick={() => setVirado((v) => !v)}
      >
        <RotateCw className="size-4" />
        {virado ? "Ver a pergunta" : "Ver a resposta"}
      </Button>
    </div>
  )
}

interface RevisaoFlashcardsProps {
  materialId: number
  aoVoltar: () => void
}

export function RevisaoFlashcards({ materialId, aoVoltar }: RevisaoFlashcardsProps) {
  const [filtro, setFiltro] = useState<Filtro>("todas")
  const [ordemIds, setOrdemIds] = useState<number[] | null>(null)
  const [indice, setIndice] = useState(0)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["ia-materiais", "questoes", materialId],
    queryFn: () => obterQuestoesDoMaterial(materialId),
  })

  const todas = data?.questoes ?? []
  const contagens: Record<Filtro, number> = {
    todas: todas.length,
    errei: todas.filter((q) => passaNoFiltro(q, "errei")).length,
    sem_resposta: todas.filter((q) => passaNoFiltro(q, "sem_resposta")).length,
  }

  const filtradas = todas.filter((q) => passaNoFiltro(q, filtro))
  const posicoes = ordemIds ? new Map(ordemIds.map((id, i) => [id, i])) : null
  const lista = posicoes
    ? [...filtradas].sort((a, b) => (posicoes.get(a.id) ?? 0) - (posicoes.get(b.id) ?? 0))
    : filtradas

  const posicaoAtual = lista.length > 0 ? Math.min(indice, lista.length - 1) : 0
  const atual = lista.length > 0 ? lista[posicaoAtual] : null
  const ehUltima = posicaoAtual === lista.length - 1

  function mudarFiltro(novo: Filtro) {
    setFiltro(novo)
    setIndice(0)
  }

  function alternarEmbaralhar() {
    setOrdemIds(ordemIds ? null : embaralhar(todas.map((q) => q.id)))
    setIndice(0)
  }

  const FILTROS: { id: Filtro; rotulo: string }[] = [
    { id: "todas", rotulo: "Todas" },
    { id: "errei", rotulo: "Que errei" },
    { id: "sem_resposta", rotulo: "Sem resposta" },
  ]

  const botaoVoltar = (
    <button
      type="button"
      onClick={aoVoltar}
      className="flex min-h-10 cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Voltar ao histórico
    </button>
  )

  if (isLoading) {
    return (
      <Carregando>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </Carregando>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto w-full max-w-2xl rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
        <p className="text-destructive">Não foi possível carregar as questões.</p>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar de novo
          </Button>
          <Button variant="ghost" size="sm" onClick={aoVoltar}>
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <div>
        {botaoVoltar}
        <h2 className="break-words text-lg font-semibold">{data.nome_arquivo}</h2>
        <p className="text-xs text-muted-foreground">
          Gerado em {formatarData(data.criado_em)} · {plural(todas.length, "questão", "questões")}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Filtrar questões"
          className="flex flex-wrap gap-1 rounded-full bg-muted p-1"
        >
          {FILTROS.map(({ id, rotulo }) => (
            <button
              key={id}
              type="button"
              aria-pressed={filtro === id}
              onClick={() => mudarFiltro(id)}
              className={`min-h-9 cursor-pointer rounded-full px-3 text-xs font-medium transition-colors sm:min-h-0 sm:py-1 ${
                filtro === id
                  ? "bg-emerald-500 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {rotulo} ({contagens[id]})
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="min-h-10 sm:min-h-0"
          aria-pressed={ordemIds !== null}
          onClick={alternarEmbaralhar}
          disabled={todas.length < 2}
        >
          {ordemIds ? <RotateCcw className="size-4" /> : <Shuffle className="size-4" />}
          {ordemIds ? "Ordem original" : "Embaralhar"}
        </Button>
      </div>

      {atual === null ? (
        <EstadoVazio
          compacto
          icone={filtro === "todas" ? SearchX : CheckCircle2}
          titulo={
            filtro === "errei"
              ? "Nenhuma questão errada"
              : filtro === "sem_resposta"
                ? "Todas as questões foram respondidas"
                : "Este material não tem questões"
          }
          descricao={
            filtro === "errei"
              ? "Você não errou nenhuma na última tentativa, ou ainda não respondeu."
              : filtro === "sem_resposta"
                ? "Não sobrou nenhuma sem resposta neste material."
                : undefined
          }
          acao={
            filtro === "todas"
              ? undefined
              : { rotulo: "Ver todas", aoClicar: () => mudarFiltro("todas") }
          }
        />
      ) : (
        <>
          <Cartao key={atual.id} questao={atual} numero={posicaoAtual + 1} total={lista.length} />

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-11 flex-1 sm:h-9"
              onClick={() => setIndice(Math.max(0, posicaoAtual - 1))}
              disabled={posicaoAtual === 0}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>

            {ehUltima ? (
              <Button className="h-11 flex-1 sm:h-9" onClick={() => setIndice(0)}>
                <RotateCcw className="size-4" />
                Recomeçar
              </Button>
            ) : (
              <Button
                className="h-11 flex-1 sm:h-9"
                onClick={() => setIndice(posicaoAtual + 1)}
              >
                Próxima
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}