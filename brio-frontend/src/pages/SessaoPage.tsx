import { type SubmitEvent, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GerenciadorMaterias } from "@/components/shared/GerenciadorMaterias"
import { LiquidTimer } from "@/components/shared/LiquidTimer"
import { listarDisciplinas } from "@/features/disciplinas/api/disciplinas-api"
import { listarProvas } from "@/features/provas/api/provas-api"
import {
  cancelarSessao,
  finalizarSessao,
  iniciarSessao,
} from "@/features/sessoes/api/sessoes-api"
import { listarTopicos } from "@/features/topicos/api/topicos-api"
import { type ConfigPomodoro, usePomodoro } from "@/hooks/usePomodoro"

const CHAVE_SESSAO_ATIVA = "brio_sessao_ativa"

interface SessaoAtiva {
  id: number
  provaId: number
  iniciada_em: string
  disciplina: string
  assunto: string
  configPomodoro: ConfigPomodoro
}

function lerSessaoAtiva(): SessaoAtiva | null {
  const salvo = localStorage.getItem(CHAVE_SESSAO_ATIVA)
  return salvo ? JSON.parse(salvo) : null
}

const CONFIG_PADRAO: ConfigPomodoro = {
  focoMinutos: 25,
  pausaCurtaMinutos: 5,
  pausaLongaMinutos: 10,
  ciclosAtePausaLonga: 2,
}

const ROTULO_FASE: Record<string, string> = {
  foco: "Foco",
  pausa_curta: "Pausa curta",
  pausa_longa: "Pausa longa",
}

export function SessaoPage() {
  const [sessaoAtiva, setSessaoAtiva] = useState<SessaoAtiva | null>(lerSessaoAtiva)

  const [provaId, setProvaId] = useState("")
  const [disciplinaId, setDisciplinaId] = useState("")
  const [topicoId, setTopicoId] = useState("")
  const [objetivo, setObjetivo] = useState("")

  const [focoMinutos, setFocoMinutos] = useState(String(CONFIG_PADRAO.focoMinutos))
  const [pausaCurtaMinutos, setPausaCurtaMinutos] = useState(
    String(CONFIG_PADRAO.pausaCurtaMinutos),
  )
  const [pausaLongaMinutos, setPausaLongaMinutos] = useState(
    String(CONFIG_PADRAO.pausaLongaMinutos),
  )
  const [ciclosAtePausaLonga, setCiclosAtePausaLonga] = useState(
    String(CONFIG_PADRAO.ciclosAtePausaLonga),
  )

  const [concentracao, setConcentracao] = useState("3")
  const [dificuldade, setDificuldade] = useState("3")
  const [aprendizado, setAprendizado] = useState("70")

  const { data: provas } = useQuery({ queryKey: ["provas"], queryFn: listarProvas })

  const { data: disciplinas } = useQuery({
    queryKey: ["disciplinas", provaId],
    queryFn: () => listarDisciplinas(Number(provaId)),
    enabled: !!provaId,
  })

  const { data: topicos } = useQuery({
    queryKey: ["topicos", disciplinaId],
    queryFn: () => listarTopicos(Number(disciplinaId)),
    enabled: !!disciplinaId,
  })

  const pomodoro = usePomodoro(
    sessaoAtiva?.configPomodoro ?? CONFIG_PADRAO,
    sessaoAtiva?.id ?? null,
  )

  const iniciar = useMutation({
    mutationFn: () =>
      iniciarSessao({
        disciplina_id: Number(disciplinaId),
        topico_id: Number(topicoId),
        objetivo,
      }),
    onSuccess: (sessao) => {
      const configPomodoro: ConfigPomodoro = {
        focoMinutos: Number(focoMinutos),
        pausaCurtaMinutos: Number(pausaCurtaMinutos),
        pausaLongaMinutos: Number(pausaLongaMinutos),
        ciclosAtePausaLonga: Number(ciclosAtePausaLonga),
      }
      const nova: SessaoAtiva = {
        id: sessao.id,
        provaId: Number(provaId),
        iniciada_em: sessao.iniciada_em,
        disciplina: sessao.disciplina,
        assunto: sessao.assunto,
        configPomodoro,
      }
      localStorage.setItem(CHAVE_SESSAO_ATIVA, JSON.stringify(nova))
      setSessaoAtiva(nova)
    },
  })

  const finalizar = useMutation({
    mutationFn: () =>
      finalizarSessao(sessaoAtiva!.id, {
        concentracao: Number(concentracao),
        dificuldade: Number(dificuldade),
        aprendizado_percentual: Number(aprendizado),
      }),
    onSuccess: () => {
      localStorage.removeItem(CHAVE_SESSAO_ATIVA)
      if (sessaoAtiva) {
        localStorage.removeItem(`brio_pomodoro_estado_${sessaoAtiva.id}`)
      }
      setSessaoAtiva(null)
      setProvaId("")
      setDisciplinaId("")
      setTopicoId("")
      setObjetivo("")
    },
  })

  const cancelar = useMutation({
    mutationFn: () => cancelarSessao(sessaoAtiva!.id),
    onSuccess: () => {
      localStorage.removeItem(CHAVE_SESSAO_ATIVA)
      if (sessaoAtiva) {
        localStorage.removeItem(`brio_pomodoro_estado_${sessaoAtiva.id}`)
      }
      setSessaoAtiva(null)
    },
  })

  function handleIniciar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    iniciar.mutate()
  }

  function handleFinalizar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    finalizar.mutate()
  }

  if (sessaoAtiva) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <GerenciadorMaterias provaId={sessaoAtiva.provaId} />
        </div>

        <div className="order-1 flex flex-col items-center gap-6 text-center lg:order-2">
          <div>
            <p className="text-sm text-muted-foreground">
              {sessaoAtiva.disciplina} — {sessaoAtiva.assunto}
            </p>
            <p className="text-xs text-muted-foreground">
              Ciclo {pomodoro.cicloAtual} de {sessaoAtiva.configPomodoro.ciclosAtePausaLonga}
            </p>
          </div>

          <LiquidTimer
            progresso={pomodoro.progresso}
            tempoFormatado={pomodoro.tempoFormatado}
            label={ROTULO_FASE[pomodoro.fase]}
          />

          <div className="flex flex-wrap justify-center gap-2">
            {pomodoro.pausado ? (
              <Button type="button" variant="outline" onClick={pomodoro.retomar}>
                <Play className="size-4" />
                Retomar
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={pomodoro.pausar}>
                <Pause className="size-4" />
                Pausar
              </Button>
            )}
            <Button type="button" variant="outline" onClick={pomodoro.pularFase}>
              <SkipForward className="size-4" />
              Pular
            </Button>
            <Button type="button" variant="outline" onClick={pomodoro.reiniciar}>
              <RotateCcw className="size-4" />
              Reiniciar
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => cancelar.mutate()}
              disabled={cancelar.isPending}
            >
              Cancelar sessão
            </Button>
          </div>

          <form
            onSubmit={handleFinalizar}
            className="flex w-full flex-col gap-4 border-t border-border pt-6"
          >
            <p className="text-sm text-muted-foreground">Terminou de estudar? Avalie a sessão:</p>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="concentracao">Concentração (1-5)</Label>
              <Input
                id="concentracao"
                type="number"
                min="1"
                max="5"
                value={concentracao}
                onChange={(e) => setConcentracao(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dificuldade">Dificuldade (1-5)</Label>
              <Input
                id="dificuldade"
                type="number"
                min="1"
                max="5"
                value={dificuldade}
                onChange={(e) => setDificuldade(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="aprendizado">Aprendizado (0-100%)</Label>
              <Input
                id="aprendizado"
                type="number"
                min="0"
                max="100"
                value={aprendizado}
                onChange={(e) => setAprendizado(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={finalizar.isPending}>
              {finalizar.isPending ? "Finalizando..." : "Finalizar sessão"}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-semibold">Nova Sessão de Estudos</h1>

      <form onSubmit={handleIniciar} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Prova</Label>
          <Select
            value={provaId}
            onValueChange={(v) => {
              setProvaId(v)
              setDisciplinaId("")
              setTopicoId("")
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma prova" />
            </SelectTrigger>
            <SelectContent>
              {provas?.map((prova) => (
                <SelectItem key={prova.id} value={String(prova.id)}>
                  {prova.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Matéria</Label>
          <Select
            value={disciplinaId}
            onValueChange={(v) => {
              setDisciplinaId(v)
              setTopicoId("")
            }}
            disabled={!provaId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma matéria" />
            </SelectTrigger>
            <SelectContent>
              {disciplinas?.map((disciplina) => (
                <SelectItem key={disciplina.id} value={String(disciplina.id)}>
                  {disciplina.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Conteúdo</Label>
          <Select value={topicoId} onValueChange={setTopicoId} disabled={!disciplinaId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um conteúdo" />
            </SelectTrigger>
            <SelectContent>
              {topicos?.map((topico) => (
                <SelectItem key={topico.id} value={String(topico.id)}>
                  {topico.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="objetivo">Objetivo (opcional)</Label>
          <Input id="objetivo" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} />
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="mb-3 text-sm font-medium">Configuração do Pomodoro</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="foco">Foco (min)</Label>
              <Input
                id="foco"
                type="number"
                min="1"
                value={focoMinutos}
                onChange={(e) => setFocoMinutos(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pausaCurta">Pausa curta (min)</Label>
              <Input
                id="pausaCurta"
                type="number"
                min="1"
                value={pausaCurtaMinutos}
                onChange={(e) => setPausaCurtaMinutos(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pausaLonga">Pausa longa (min)</Label>
              <Input
                id="pausaLonga"
                type="number"
                min="1"
                value={pausaLongaMinutos}
                onChange={(e) => setPausaLongaMinutos(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ciclos">Ciclos até pausa longa</Label>
              <Input
                id="ciclos"
                type="number"
                min="1"
                value={ciclosAtePausaLonga}
                onChange={(e) => setCiclosAtePausaLonga(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={!topicoId || iniciar.isPending}>
          {iniciar.isPending ? "Iniciando..." : "Iniciar sessão"}
        </Button>
      </form>
    </div>
  )
}