import { type FormEvent, useEffect, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Menu, Pause, Play, RotateCcw, SkipForward } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { EditorAnotacao } from "@/components/shared/EditorAnotacao"
import { GerenciadorMaterias } from "@/components/shared/GerenciadorMaterias"
import { LiquidTimer } from "@/components/shared/LiquidTimer"
import { obterAnotacao, salvarAnotacao } from "@/features/anotacoes/api/anotacoes-api"
import { listarDisciplinas } from "@/features/disciplinas/api/disciplinas-api"
import { listarProvas } from "@/features/provas/api/provas-api"
import {
  cancelarSessao,
  finalizarSessao,
  iniciarSessao,
} from "@/features/sessoes/api/sessoes-api"
import { useSessaoAtiva } from "@/features/sessoes/sessao-ativa-context"
import { listarTopicos } from "@/features/topicos/api/topicos-api"
import type { Topico } from "@/features/topicos/types"
import { type ConfigPomodoro } from "@/hooks/usePomodoro"
import { Link } from "react-router-dom"

const ROTULO_FASE: Record<string, string> = {
  foco: "Foco",
  pausa_curta: "Pausa curta",
  pausa_longa: "Pausa longa",
}

// Variants aceleradas para alta responsividade
const formVariants = {
  initial: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
}

const anotacoesVariants = {
  hidden: { opacity: 0, x: -25 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
}

const controlesVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
}

export function SessaoPage() {
  const { sessaoAtiva, pomodoro, iniciarSessaoAtiva, encerrarSessaoAtiva } = useSessaoAtiva()

  const [provaId, setProvaId] = useState("")
  const [disciplinaId, setDisciplinaId] = useState("")
  const [topicoId, setTopicoId] = useState("")
  const [objetivo, setObjetivo] = useState("")

  const [focoMinutos, setFocoMinutos] = useState("25")
  const [pausaCurtaMinutos, setPausaCurtaMinutos] = useState("5")
  const [pausaLongaMinutos, setPausaLongaMinutos] = useState("10")
  const [ciclosAtePausaLonga, setCiclosAtePausaLonga] = useState("2")

  const [concentracao, setConcentracao] = useState("3")
  const [dificuldade, setDificuldade] = useState("3")
  const [aprendizado, setAprendizado] = useState("70")

  const [menuAberto, setMenuAberto] = useState(false)
  const [topicoVisualizado, setTopicoVisualizado] = useState<{
    id: number
    nome: string
  } | null>(null)

  // Controle de animação ultrarrápida
  const [animandoEntrada, setAnimandoEntrada] = useState(false)
  const [etapaAnimacao, setEtapaAnimacao] = useState<"centro" | "layout">("layout")

  useEffect(() => {
    setTopicoVisualizado(null)
  }, [sessaoAtiva?.id])

  const { data: provas } = useQuery({ queryKey: ["provas"], queryFn: listarProvas })
  const provasAtivas = provas?.filter((prova) => prova.status === "ativa")

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

  const topicoAtual = sessaoAtiva
    ? (topicoVisualizado ?? { id: sessaoAtiva.topicoId, nome: sessaoAtiva.assunto })
    : null

  const { data: anotacao } = useQuery({
    queryKey: ["anotacao", topicoAtual?.id],
    queryFn: () => obterAnotacao(topicoAtual!.id),
    enabled: !!topicoAtual,
  })

  const salvarAnotacaoMutation = useMutation({
    mutationFn: (html: string) => salvarAnotacao(topicoAtual!.id, html),
  })

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

      setAnimandoEntrada(true)
      setEtapaAnimacao("centro")

      iniciarSessaoAtiva({
        id: sessao.id,
        provaId: Number(provaId),
        topicoId: Number(topicoId),
        iniciada_em: sessao.iniciada_em,
        disciplina: sessao.disciplina,
        assunto: sessao.assunto,
        configPomodoro,
      })

      // Permanece no centro por apenas 200ms
      setTimeout(() => {
        setEtapaAnimacao("layout")
      }, 200)

      // Libera o estado de animação em 550ms
      setTimeout(() => {
        setAnimandoEntrada(false)
      }, 550)
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
      encerrarSessaoAtiva()
      setProvaId("")
      setDisciplinaId("")
      setTopicoId("")
      setObjetivo("")
    },
    onError: (erro: Error) => {
      if (erro.message.includes("já foi finalizada")) {
        encerrarSessaoAtiva()
      }
    },
  })

  const cancelar = useMutation({
    mutationFn: () => cancelarSessao(sessaoAtiva!.id),
    onSuccess: () => encerrarSessaoAtiva(),
    onError: (erro: Error) => {
      if (erro.message.includes("já foi finalizado")) {
        encerrarSessaoAtiva()
      }
    },
  })

  function handleIniciar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    iniciar.mutate()
  }

  function handleFinalizar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    finalizar.mutate()
  }

  function handleSelecionarTopico(topico: Topico) {
    setTopicoVisualizado({ id: topico.id, nome: topico.nome })
    setMenuAberto(false)
  }

  if (sessaoAtiva) {
    const mostrarPaineisLaterais = !animandoEntrada || etapaAnimacao === "layout"

    return (
      <div className="relative">
        <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Matérias e Conteúdos</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <GerenciadorMaterias
                provaId={sessaoAtiva.provaId}
                onSelecionarTopico={handleSelecionarTopico}
              />
            </div>
          </SheetContent>
        </Sheet>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="mb-6"
          onClick={() => setMenuAberto(true)}
        >
          <Menu className="size-4" />
        </Button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Painel de Anotações */}
          <AnimatePresence>
            {mostrarPaineisLaterais && (
              <motion.div
                key="painel-anotacoes"
                variants={anotacoesVariants}
                initial={animandoEntrada ? "hidden" : false}
                animate="visible"
                className="text-left"
              >
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Anotações — {topicoAtual?.nome}
                </p>
                {anotacao && (
                  <EditorAnotacao
                    conteudoInicial={anotacao.conteudo_html}
                    onSalvar={(html) => salvarAnotacaoMutation.mutate(html)}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cronômetro Deslocando */}
          <div className="flex flex-col items-center gap-6 text-center">
            <motion.div
              layout
              transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              className="flex flex-col items-center gap-6 text-center w-full"
            >
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
            </motion.div>

            {/* Controles & Form */}
            <AnimatePresence>
              {mostrarPaineisLaterais && (
                <motion.div
                  key="painel-controles"
                  variants={controlesVariants}
                  initial={animandoEntrada ? "hidden" : false}
                  animate="visible"
                  className="flex w-full flex-col items-center gap-6"
                >
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
                    <p className="text-sm text-muted-foreground">
                      Terminou de estudar? Avalie a sessão:
                    </p>

                    <div className="flex flex-col gap-1.5 text-left">
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
                    <div className="flex flex-col gap-1.5 text-left">
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
                    <div className="flex flex-col gap-1.5 text-left">
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="form-iniciar-sessao"
        variants={formVariants}
        initial="initial"
        exit="exit"
        className="mx-auto max-w-md"
      >
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
                <SelectValue placeholder="Selecione uma prova">
                  {provasAtivas?.find((p) => String(p.id) === provaId)?.nome}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {provasAtivas?.map((prova) => (
                  <SelectItem key={prova.id} value={String(prova.id)}>
                    {prova.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {provasAtivas !== undefined && provasAtivas.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma prova cadastrada.{" "}
                <Link to="/provas/nova" className="text-primary hover:underline">
                  Cadastre uma
                </Link>
                .
              </p>
            )}
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
                <SelectValue placeholder="Selecione uma matéria">
                  {disciplinas?.find((d) => String(d.id) === disciplinaId)?.nome}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {disciplinas?.map((disciplina) => (
                  <SelectItem key={disciplina.id} value={String(disciplina.id)}>
                    {disciplina.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {provaId && disciplinas !== undefined && disciplinas.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma matéria cadastrada.{" "}
                <Link to={`/provas/${provaId}`} className="text-primary hover:underline">
                  Cadastre uma
                </Link>
                .
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Conteúdo</Label>
            <Select value={topicoId} onValueChange={setTopicoId} disabled={!disciplinaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um conteúdo">
                  {topicos?.find((t) => String(t.id) === topicoId)?.nome}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {topicos?.map((topico) => (
                  <SelectItem key={topico.id} value={String(topico.id)}>
                    {topico.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {disciplinaId && topicos !== undefined && topicos.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum tópico cadastrado.{" "}
                <Link to={`/provas/${provaId}`} className="text-primary hover:underline">
                  Cadastre um
                </Link>
                .
              </p>
            )}
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

          {iniciar.isError && (
            <p className="text-sm text-destructive">{iniciar.error.message}</p>
          )}

          <Button type="submit" disabled={!topicoId || iniciar.isPending}>
            {iniciar.isPending ? "Iniciando..." : "Iniciar sessão"}
          </Button>
        </form>
      </motion.div>
    </AnimatePresence>
  )
}