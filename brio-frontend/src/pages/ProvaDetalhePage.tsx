import { type FormEvent, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, BarChart3, BookOpen, FileText, Pencil, Play, Plus, Trash2 } from "lucide-react"

import { EstadoVazio } from "@/components/shared/EstadoVazio"
import { CheckboxConcluido, ProgressoDisciplina } from "@/components/shared/Progresso"
import { Carregando, SkeletonCards } from "@/components/shared/Skeletons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useConfirmar } from "@/features/confirmacao/confirmacao-context"
import {
  atualizarDisciplina,
  criarDisciplina,
  deletarDisciplina,
  listarDisciplinas,
} from "@/features/disciplinas/api/disciplinas-api"
import { obterProva } from "@/features/provas/api/provas-api"
import {
  ROTULO_PRIORIDADE,
  textoDiasRestantes,
  variantePrioridade,
} from "@/features/provas/apresentacao"
import {
  atualizarTopico,
  criarTopico,
  deletarTopico,
  listarTopicos,
} from "@/features/topicos/api/topicos-api"
import { useConcluirTopico } from "@/features/topicos/use-concluir-topico"
import { notificar } from "@/lib/toast"

const ROTULO_TIPO: Record<string, string> = {
  enem: "ENEM",
  vestibular: "Vestibular",
  concurso: "Concurso",
}

const CLASSE_BOTAO_CARTAO =
  "min-w-0 flex-1 cursor-pointer truncate text-left outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring"

export function ProvaDetalhePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const provaId = Number(id)
  const queryClient = useQueryClient()

  const confirmar = useConfirmar()

  // Estados
  const [disciplinaSelecionadaId, setDisciplinaSelecionadaId] = useState<number | null>(null)
  const [novoNome, setNovoNome] = useState("")
  const [editandoDisciplinaId, setEditandoDisciplinaId] = useState<number | null>(null)
  const [nomeDisciplinaEditado, setNomeDisciplinaEditado] = useState("")
  const [editandoTopicoId, setEditandoTopicoId] = useState<number | null>(null)
  const [nomeTopicoEditado, setNomeTopicoEditado] = useState("")
  const concluirTopico = useConcluirTopico(disciplinaSelecionadaId)

  // Queries
  const { data: prova, isError: erroProva } = useQuery({
    queryKey: ["provas", provaId],
    queryFn: () => obterProva(provaId),
  })

  const { data: disciplinas } = useQuery({
    queryKey: ["disciplinas", provaId],
    queryFn: () => listarDisciplinas(provaId),
  })

  const disciplinaSelecionada = disciplinas?.find(
    (disciplina) => disciplina.id === disciplinaSelecionadaId,
  )

  const { data: topicos } = useQuery({
    queryKey: ["topicos", disciplinaSelecionadaId],
    queryFn: () => listarTopicos(disciplinaSelecionadaId!),
    enabled: disciplinaSelecionadaId !== null,
  })

  // Cálculo em tempo real do progresso da disciplina selecionada com base nos tópicos
  const totalTopicos = topicos?.length ?? disciplinaSelecionada?.total_topicos ?? 0
  const topicosConcluidos =
    topicos?.filter((t) => t.concluido).length ?? disciplinaSelecionada?.topicos_concluidos ?? 0
  const progressoPercentual =
    totalTopicos > 0
      ? (topicosConcluidos / totalTopicos) * 100
      : (disciplinaSelecionada?.progresso_percentual ?? 0)

  const disciplinaComProgressoAtualizado = disciplinaSelecionada
    ? {
        ...disciplinaSelecionada,
        total_topicos: totalTopicos,
        topicos_concluidos: topicosConcluidos,
        progresso_percentual: progressoPercentual,
      }
    : null

  // Excluir uma matéria ou conteúdo apaga revisões e atividades ligadas a ele:
  // as outras telas que mostram esses dados precisam ser atualizadas
  function invalidarTelasRelacionadas() {
    queryClient.invalidateQueries({ queryKey: ["revisoes"] })
    queryClient.invalidateQueries({ queryKey: ["calendario"] })
    queryClient.invalidateQueries({ queryKey: ["cronograma-semana"] })
    queryClient.invalidateQueries({ queryKey: ["dashboard"] })
  }

  // Mutações
  const atualizarDisciplinaMutation = useMutation({
    mutationFn: (id: number) => atualizarDisciplina(id, nomeDisciplinaEditado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinas", provaId] })
      notificar.sucesso("Matéria renomeada")
      setEditandoDisciplinaId(null)
    },
    onError: (erro) => notificar.erro(erro),
  })

  const atualizarTopicoMutation = useMutation({
    mutationFn: (id: number) => atualizarTopico(id, nomeTopicoEditado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topicos", disciplinaSelecionadaId] })
      queryClient.invalidateQueries({ queryKey: ["disciplinas", provaId] })
      notificar.sucesso("Conteúdo renomeado")
      setEditandoTopicoId(null)
    },
    onError: (erro) => notificar.erro(erro),
  })

  const criarDisciplinaMutation = useMutation({
    mutationFn: () => criarDisciplina(provaId, novoNome.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinas", provaId] })
      setNovoNome("")
      notificar.sucesso("Matéria adicionada")
    },
    onError: (erro) => notificar.erro(erro),
  })

  const deletarDisciplinaMutation = useMutation({
    mutationFn: deletarDisciplina,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinas", provaId] })
      invalidarTelasRelacionadas()
      notificar.sucesso("Matéria excluída")
    },
    onError: (erro) => notificar.erro(erro),
  })

  const criarTopicoMutation = useMutation({
    mutationFn: () => criarTopico(disciplinaSelecionadaId!, novoNome.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topicos", disciplinaSelecionadaId] })
      queryClient.invalidateQueries({ queryKey: ["disciplinas", provaId] })
      notificar.sucesso("Conteúdo adicionado")
      setNovoNome("")
    },
    onError: (erro) => notificar.erro(erro),
  })

  const deletarTopicoMutation = useMutation({
    mutationFn: deletarTopico,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topicos", disciplinaSelecionadaId] })
      queryClient.invalidateQueries({ queryKey: ["disciplinas", provaId] })
      invalidarTelasRelacionadas()
      notificar.sucesso("Conteúdo excluído")
    },
    onError: (erro) => notificar.erro(erro),
  })

  // Handlers
  function handleSalvarDisciplina(disciplina: { id: number; nome: string }) {
    if (atualizarDisciplinaMutation.isPending) return
    if (!nomeDisciplinaEditado.trim() || nomeDisciplinaEditado === disciplina.nome) {
      setEditandoDisciplinaId(null)
      return
    }
    atualizarDisciplinaMutation.mutate(disciplina.id)
  }

  function handleSalvarTopico(topico: { id: number; nome: string }) {
    if (atualizarTopicoMutation.isPending) return
    if (!nomeTopicoEditado.trim() || nomeTopicoEditado === topico.nome) {
      setEditandoTopicoId(null)
      return
    }
    atualizarTopicoMutation.mutate(topico.id)
  }

  async function handleExcluirDisciplina(disciplinaId: number) {
    const confirmado = await confirmar({
      titulo: "Excluir a matéria?",
      descricao:
        "Os conteúdos, as anotações, as revisões agendadas e as atividades do cronograma dessa matéria serão apagados. Suas sessões de estudo continuam no histórico.",
      textoConfirmar: "Excluir",
      destrutivo: true,
    })
    if (confirmado) {
      deletarDisciplinaMutation.mutate(disciplinaId)
    }
  }

  async function handleExcluirTopico(topicoId: number) {
    const confirmado = await confirmar({
      titulo: "Excluir o conteúdo?",
      descricao:
        "A anotação e as revisões agendadas dele serão apagadas. Suas sessões de estudo continuam no histórico.",
      textoConfirmar: "Excluir",
      destrutivo: true,
    })
    if (confirmado) {
      deletarTopicoMutation.mutate(topicoId)
    }
  }

  function handleCriar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!novoNome.trim()) return

    if (disciplinaSelecionadaId === null) {
      criarDisciplinaMutation.mutate()
    } else {
      criarTopicoMutation.mutate()
    }
  }

  if (erroProva) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
        <p className="text-destructive">Não foi possível carregar esta prova.</p>
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <Link to="/provas">Voltar para as provas</Link>
        </Button>
      </div>
    )
  }

  if (!prova) {
    return (
      <Carregando>
        <SkeletonCards quantidade={6} />
      </Carregando>
    )
  }

  const naVisaoDeConteudos = disciplinaSelecionadaId !== null
  const dadosDaProva = [
    ROTULO_TIPO[prova.tipo] ?? prova.tipo,
    prova.instituicao_banca,
    prova.cargo,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {naVisaoDeConteudos ? (
            <button
              type="button"
              onClick={() => {
                setDisciplinaSelecionadaId(null)
                setNovoNome("")
              }}
              className="flex min-h-10 max-w-full cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4 shrink-0" />
              <span className="truncate">{prova.nome}</span>
            </button>
          ) : (
            <Link
              to="/provas"
              className="flex min-h-10 w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Minhas provas
            </Link>
          )}

          <h1 className="break-words text-xl font-semibold sm:text-2xl">
            {naVisaoDeConteudos ? disciplinaSelecionada?.nome : prova.nome}
          </h1>

          {!naVisaoDeConteudos && (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {dadosDaProva && <span>{dadosDaProva}</span>}
              <span>{textoDiasRestantes(prova.dias_restantes ?? null)}</span>
              <Badge variant={variantePrioridade(prova.prioridade)}>
                <span className="sr-only">Prioridade </span>
                {ROTULO_PRIORIDADE[prova.prioridade] ?? prova.prioridade}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {naVisaoDeConteudos && (
            <Button className="min-h-10 sm:min-h-0" asChild>
              <Link
                to={`/sessoes?prova_id=${provaId}&disciplina_id=${disciplinaSelecionadaId}`}
              >
                <Play className="size-4" />
                Estudar esta matéria
              </Link>
            </Button>
          )}

          <Button variant="outline" className="min-h-10 sm:min-h-0" asChild>
            <Link to={`/provas/${provaId}/estatisticas`}>
              <BarChart3 className="size-4" />
              Estatísticas
            </Link>
          </Button>

          <Button variant="outline" className="min-h-10 sm:min-h-0" asChild>
            <Link to={`/provas/${provaId}/editar`}>
              <Pencil className="size-4" />
              Editar prova
            </Link>
          </Button>
        </div>
      </div>

      {/* Barra de progresso na visão de conteúdos */}
      {naVisaoDeConteudos && disciplinaComProgressoAtualizado && (
        <Card className="p-4">
          <ProgressoDisciplina disciplina={disciplinaComProgressoAtualizado} />
        </Card>
      )}

      {/* Formulário de criação: o Enter do teclado do celular também adiciona */}
      <form onSubmit={handleCriar} className="flex gap-2">
        <Input
          aria-label={disciplinaSelecionadaId === null ? "Nova matéria" : "Novo conteúdo"}
          placeholder={
            disciplinaSelecionadaId === null
              ? "Nova matéria (ex: Matemática)"
              : "Novo conteúdo (ex: Frações)"
          }
          value={novoNome}
          onChange={(event) => setNovoNome(event.target.value)}
          className="min-w-0 flex-1 text-base md:text-sm"
        />

        <Button
          type="submit"
          className="min-h-10 shrink-0 sm:min-h-0"
          disabled={
            !novoNome.trim() ||
            criarDisciplinaMutation.isPending ||
            criarTopicoMutation.isPending
          }
        >
          <Plus className="size-4" />
          Adicionar
        </Button>
      </form>

      {/* Listas */}
      {disciplinaSelecionadaId === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {disciplinas?.length === 0 && (
            <EstadoVazio
              compacto
              className="col-span-full"
              icone={BookOpen}
              titulo="Nenhuma matéria ainda"
              descricao="Escreva o nome da primeira no campo acima e clique em Adicionar."
            />
          )}

          {disciplinas?.map((disciplina) => (
            // O nome é um botão esticado sobre o card: o card inteiro abre a matéria,
            // com foco de teclado, e renomear/excluir ficam acima (z-10)
            <Card
              key={disciplina.id}
              className="relative transition-colors hover:border-primary"
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  {editandoDisciplinaId === disciplina.id ? (
                    <Input
                      autoFocus
                      value={nomeDisciplinaEditado}
                      onChange={(e) => setNomeDisciplinaEditado(e.target.value)}
                      onBlur={() => handleSalvarDisciplina(disciplina)}
                      onKeyDown={(e) => e.key === "Enter" && handleSalvarDisciplina(disciplina)}
                      className="relative z-10 h-9 min-w-0 flex-1 text-base sm:h-7 sm:text-sm"
                    />
                  ) : (
                    <CardTitle className="min-w-0 flex-1 text-base">
                      <button
                        type="button"
                        title={disciplina.nome}
                        className={CLASSE_BOTAO_CARTAO}
                        onClick={() => {
                          setDisciplinaSelecionadaId(disciplina.id)
                          setNovoNome("")
                        }}
                      >
                        {disciplina.nome}
                      </button>
                    </CardTitle>
                  )}

                  <div className="relative z-10 flex shrink-0 items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-10 sm:size-8"
                      aria-label={`Renomear ${disciplina.nome}`}
                      title="Renomear"
                      onClick={() => {
                        setEditandoDisciplinaId(disciplina.id)
                        setNomeDisciplinaEditado(disciplina.nome)
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-10 sm:size-8"
                      aria-label={`Excluir ${disciplina.nome}`}
                      title="Excluir"
                      onClick={() => handleExcluirDisciplina(disciplina.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <ProgressoDisciplina disciplina={disciplina} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Lista de conteúdos: muitos itens curtos leem melhor numa lista só do que em cards */
        <>
          {topicos?.length === 0 && (
            <EstadoVazio
              compacto
              icone={FileText}
              titulo="Nenhum conteúdo nesta matéria"
              descricao="Adicione o primeiro no campo acima. Cada conteúdo ganha uma anotação própria e uma caixa para marcar como concluído."
            />
          )}

          {topicos && topicos.length > 0 && (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {topicos.map((topico) => (
                <li
                  key={topico.id}
                  className="relative flex items-center gap-2 px-3 transition-colors hover:bg-accent/50"
                >
                  <div className="relative z-10 flex shrink-0 items-center">
                    <CheckboxConcluido
                      checked={topico.concluido}
                      rotulo={`Marcar "${topico.nome}" como concluído`}
                      onChange={(concluido) =>
                        concluirTopico.mutate({ topicoId: topico.id, concluido })
                      }
                    />
                  </div>

                  {editandoTopicoId === topico.id ? (
                    <Input
                      autoFocus
                      value={nomeTopicoEditado}
                      onChange={(e) => setNomeTopicoEditado(e.target.value)}
                      onBlur={() => handleSalvarTopico(topico)}
                      onKeyDown={(e) => e.key === "Enter" && handleSalvarTopico(topico)}
                      className="relative z-10 my-2 h-9 min-w-0 flex-1 text-base sm:h-7 sm:text-sm"
                    />
                  ) : (
                    <button
                      type="button"
                      title={topico.nome}
                      className={`${CLASSE_BOTAO_CARTAO} py-4 after:rounded-none ${
                        topico.concluido ? "text-muted-foreground" : ""
                      }`}
                      onClick={() => navigate(`/topicos/${topico.id}/anotacao`)}
                    >
                      {topico.nome}
                    </button>
                  )}

                  <div className="relative z-10 flex shrink-0 items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-10 sm:size-8"
                      aria-label={`Renomear ${topico.nome}`}
                      title="Renomear"
                      onClick={() => {
                        setEditandoTopicoId(topico.id)
                        setNomeTopicoEditado(topico.nome)
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-10 sm:size-8"
                      aria-label={`Excluir ${topico.nome}`}
                      title="Excluir"
                      onClick={() => handleExcluirTopico(topico.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
