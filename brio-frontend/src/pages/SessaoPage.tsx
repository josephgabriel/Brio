import { type FormEvent, useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import { BookOpen, Download, Pause, Play, RotateCcw, SkipForward } from "lucide-react"

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
import { SkeletonEditor } from "@/components/shared/Skeletons"
import {
  exportarAnotacaoPdf,
  obterAnotacao,
  salvarAnotacao,
} from "@/features/anotacoes/api/anotacoes-api"
import { useConfirmar } from "@/features/confirmacao/confirmacao-context"
import { listarDisciplinas } from "@/features/disciplinas/api/disciplinas-api"
import { listarProvas } from "@/features/provas/api/provas-api"
import {
  cancelarSessao,
  finalizarSessao,
  iniciarSessao,
} from "@/features/sessoes/api/sessoes-api"
import { useSessaoAtiva } from "@/features/sessoes/sessao-ativa-context"
import { listarTopicos, obterContextoTopico } from "@/features/topicos/api/topicos-api"
import type { Topico } from "@/features/topicos/types"
import { type ConfigPomodoro } from "@/hooks/usePomodoro"
import { notificar } from "@/lib/toast"

const ROTULO_FASE: Record<string, string> = {
  foco: "Foco",
  pausa_curta: "Pausa curta",
  pausa_longa: "Pausa longa",
}

// O servidor responde "já foi finalizada" (ou "finalizado", conforme o texto)
const JA_ENCERRADA = /já foi finalizad[ao]/

export function SessaoPage() {
  // ==========================================
  // 1. TODOS OS HOOKS NO TOPO
  // ==========================================
  const { sessaoAtiva, pomodoro, iniciarSessaoAtiva, encerrarSessaoAtiva } = useSessaoAtiva()

  const [searchParams] = useSearchParams()
  const topicoIdPreSelecionado = searchParams.get("topico_id")
  const provaIdPreSelecionada = searchParams.get("prova_id")
  const disciplinaIdPreSelecionada = searchParams.get("disciplina_id")

  const [provaId, setProvaId] = useState("")
  const [disciplinaId, setDisciplinaId] = useState("")
  const [topicoId, setTopicoId] = useState("")
  const [objetivo, setObjetivo] = useState("")

  const [focoMinutos, setFocoMinutos] = useState("25")
  const [pausaCurtaMinutos, setPausaCurtaMinutos] = useState("5")
  const [pausaLongaMinutos, setPausaLongaMinutos] = useState("10")
  const [ciclosAtePausaLonga, setCiclosAtePausaLonga] = useState("2")
  const [configAberta, setConfigAberta] = useState(false)

  const confirmar = useConfirmar()
  const [exportando, setExportando] = useState(false)

  const [menuAberto, setMenuAberto] = useState(false)
  const [topicoVisualizado, setTopicoVisualizado] = useState<{
    id: number
    nome: string
  } | null>(null)

  useEffect(() => {
    setTopicoVisualizado(null)
  }, [sessaoAtiva?.id])

  useEffect(() => {
    if (!topicoIdPreSelecionado) return
    obterContextoTopico(Number(topicoIdPreSelecionado)).then((contexto) => {
      setProvaId(String(contexto.prova_id))
      setDisciplinaId(String(contexto.disciplina_id))
      setTopicoId(String(contexto.topico_id))
    })
  }, [topicoIdPreSelecionado])

  useEffect(() => {
    if (!provaIdPreSelecionada || !disciplinaIdPreSelecionada) return
    setProvaId(provaIdPreSelecionada)
    setDisciplinaId(disciplinaIdPreSelecionada)
    setTopicoId("")
  }, [provaIdPreSelecionada, disciplinaIdPreSelecionada])

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

  const { data: anotacao, isLoading: carregandoAnotacao } = useQuery({
    queryKey: ["anotacao", topicoAtual?.id],
    queryFn: () => obterAnotacao(topicoAtual!.id),
    enabled: !!topicoAtual,
    staleTime: Infinity,
    gcTime: 0,
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

      iniciarSessaoAtiva({
        id: sessao.id,
        provaId: Number(provaId),
        topicoId: Number(topicoId),
        iniciada_em: sessao.iniciada_em,
        disciplina: sessao.disciplina,
        assunto: sessao.assunto,
        configPomodoro,
      })
    },
    onError: (erro) => notificar.erro(erro),
  })

  const finalizar = useMutation({
    mutationFn: () => finalizarSessao(sessaoAtiva!.id, pomodoro.segundosFoco),
    onSuccess: () => {
      encerrarSessaoAtiva()
      setProvaId("")
      setDisciplinaId("")
      setTopicoId("")
      setObjetivo("")
      notificar.sucesso("Sessão finalizada. Suas revisões foram agendadas.")
    },
    onError: (erro: Error) => {
      if (JA_ENCERRADA.test(erro.message)) {
        // A sessão já estava encerrada no servidor: só limpa o estado local
        encerrarSessaoAtiva()
        notificar.info("Esta sessão já tinha sido finalizada.")
      } else {
        notificar.erro(erro)
      }
    },
  })

  const cancelar = useMutation({
    mutationFn: () => cancelarSessao(sessaoAtiva!.id),
    onSuccess: () => {
      encerrarSessaoAtiva()
      notificar.sucesso("Sessão cancelada.")
    },
    onError: (erro: Error) => {
      if (JA_ENCERRADA.test(erro.message)) {
        encerrarSessaoAtiva()
      } else {
        notificar.erro(erro)
      }
    },
  })

  // ==========================================
  // FUNÇÕES AUXILIARES
  // ==========================================
  function handleIniciar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    iniciar.mutate()
  }

  async function handleFinalizar() {
    // Um toque sem querer não deve gerar uma sessão vazia com 4 revisões
    if (pomodoro.segundosFoco < 60) {
      const confirmado = await confirmar({
        titulo: "Finalizar com menos de 1 minuto de foco?",
        descricao:
          "A sessão será registrada com 0 minuto e as 4 revisões serão agendadas mesmo assim. Se foi sem querer, continue estudando ou cancele a sessão.",
        textoConfirmar: "Finalizar mesmo assim",
        textoCancelar: "Continuar estudando",
      })
      if (!confirmado) return
    }
    finalizar.mutate()
  }

  async function handleCancelar() {
    const confirmado = await confirmar({
      titulo: "Cancelar esta sessão?",
      descricao: "O tempo estudado até agora não será registrado e nenhuma revisão será agendada.",
      textoConfirmar: "Cancelar sessão",
      textoCancelar: "Continuar estudando",
      destrutivo: true,
    })
    if (confirmado) cancelar.mutate()
  }

  function handleSelecionarTopico(topico: Topico) {
    setTopicoVisualizado({ id: topico.id, nome: topico.nome })
    setMenuAberto(false)
  }

  async function handleExportarPdf() {
    if (!topicoAtual) return
    setExportando(true)
    try {
      await exportarAnotacaoPdf(topicoAtual.id, `anotacao-topico-${topicoAtual.id}`)
      notificar.sucesso("PDF exportado")
    } catch (erro) {
      notificar.erro(erro)
    } finally {
      setExportando(false)
    }
  }

  // ==========================================
  // 2. RETORNOS CONDICIONAIS (APÓS TODOS OS HOOKS)
  // ==========================================
  if (sessaoAtiva) {
    return (
      // pt-*: a barra global do cronômetro fica logo acima da página, então o conteúdo precisa de respiro
      <div className="relative pt-5 sm:pt-7">
        <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
          <SheetContent side="left" className="w-80 max-w-[90vw] overflow-y-auto">
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

        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="break-words text-xl font-semibold sm:text-2xl">{sessaoAtiva.assunto}</h1>
            <p className="text-sm text-muted-foreground">{sessaoAtiva.disciplina}</p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 shrink-0 sm:h-8"
            onClick={() => setMenuAberto(true)}
          >
            <BookOpen className="size-4" />
            Matérias e conteúdos
          </Button>
        </div>

        {/* min-w-0 nos filhos: sem ele, o conteúdo largo do editor alarga a grade inteira */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Anotações: abaixo do cronômetro no celular, à esquerda no desktop */}
          <div className="order-2 min-w-0 text-left lg:order-1">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h2 className="min-w-0 flex-1 truncate text-sm font-medium text-muted-foreground">
                Anotações — {topicoAtual?.nome}
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={handleExportarPdf}
                disabled={exportando || !anotacao}
              >
                <Download className="size-4" />
                {exportando ? "Exportando..." : "Exportar PDF"}
              </Button>
            </div>

            {carregandoAnotacao && <SkeletonEditor />}

            {anotacao && (
              <EditorAnotacao
                key={topicoAtual?.id}
                conteudoInicial={anotacao.conteudo_html}
                chaveRascunho={`topico-${topicoAtual?.id}`}
                onSalvar={(html) => salvarAnotacaoMutation.mutateAsync(html)}
              />
            )}
          </div>

          {/* Cronômetro e controles: primeiro no celular, à direita (e fixo ao rolar) no desktop */}
          <div className="order-1 flex min-w-0 flex-col items-center gap-6 text-center lg:order-2 lg:sticky lg:top-6 lg:self-start">
            <div className="flex w-full flex-col items-center gap-4">
              <LiquidTimer
                progresso={pomodoro.progresso}
                tempoFormatado={pomodoro.tempoFormatado}
                label={ROTULO_FASE[pomodoro.fase]}
              />

              <p className="text-sm text-muted-foreground">
                Ciclo {pomodoro.cicloAtual} de {sessaoAtiva.configPomodoro.ciclosAtePausaLonga}
              </p>

              {pomodoro.pausado ? (
                <p
                  role="status"
                  className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400"
                >
                  Cronômetro pausado: o tempo não está sendo contado
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Tempo de foco registrado: {Math.floor(pomodoro.segundosFoco / 60)} min
                </p>
              )}
            </div>

            <div className="flex w-full flex-col items-center gap-6">
              <div className="flex flex-wrap justify-center gap-2">
                {pomodoro.pausado ? (
                  <Button type="button" className="h-11 sm:h-9" onClick={pomodoro.retomar}>
                    <Play className="size-4" />
                    Retomar
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 sm:h-9"
                    onClick={pomodoro.pausar}
                  >
                    <Pause className="size-4" />
                    Pausar
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 sm:h-9"
                  onClick={pomodoro.pularFase}
                >
                  <SkipForward className="size-4" />
                  Pular
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 sm:h-9"
                  onClick={pomodoro.reiniciar}
                >
                  <RotateCcw className="size-4" />
                  Reiniciar
                </Button>
              </div>

              <div className="w-full border-t border-border pt-6">
                <Button
                  type="button"
                  className="h-12 w-full text-base sm:h-9 sm:text-sm"
                  onClick={handleFinalizar}
                  disabled={finalizar.isPending}
                >
                  {finalizar.isPending ? "Finalizando..." : "Finalizar sessão"}
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  As revisões deste conteúdo serão agendadas automaticamente.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-muted-foreground hover:text-destructive"
                  onClick={handleCancelar}
                  disabled={cancelar.isPending}
                >
                  Cancelar sessão
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Pomodoro: só mostra os campos quando a pessoa quer mudar. Se algum valor ficar
  // inválido, o painel fica aberto e o botão de iniciar espera a correção.
  const configValida = [
    focoMinutos,
    pausaCurtaMinutos,
    pausaLongaMinutos,
    ciclosAtePausaLonga,
  ].every((valor) => Number(valor) >= 1)
  const mostrarConfig = configAberta || !configValida

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-xl font-semibold sm:text-2xl">Nova Sessão de Estudos</h1>

      <form onSubmit={handleIniciar} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
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
            <Input
              id="objetivo"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Ex.: resolver 10 questões"
              className="text-base md:text-sm"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">Pomodoro</p>
              {!mostrarConfig && (
                <p className="text-sm text-muted-foreground">
                  Foco de {focoMinutos} min, pausa de {pausaCurtaMinutos} min. Pausa longa de{" "}
                  {pausaLongaMinutos} min a cada {ciclosAtePausaLonga}{" "}
                  {Number(ciclosAtePausaLonga) === 1 ? "ciclo" : "ciclos"}.
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0"
              aria-expanded={mostrarConfig}
              aria-controls="config-pomodoro"
              disabled={!configValida}
              onClick={() => setConfigAberta((aberta) => !aberta)}
            >
              {mostrarConfig ? "Fechar" : "Alterar"}
            </Button>
          </div>

          {mostrarConfig && (
            <div id="config-pomodoro" className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="foco">Foco (min)</Label>
                <Input
                  id="foco"
                  type="number"
                  inputMode="numeric"
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
                  inputMode="numeric"
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
                  inputMode="numeric"
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
                  inputMode="numeric"
                  min="1"
                  value={ciclosAtePausaLonga}
                  onChange={(e) => setCiclosAtePausaLonga(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="h-12 sm:h-11"
          disabled={!topicoId || !configValida || iniciar.isPending}
        >
          {iniciar.isPending ? "Iniciando..." : "Iniciar sessão"}
        </Button>
      </form>
    </div>
  )
}