import { type FormEvent, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, BarChart3, BookOpen, FileText, Pencil, Plus, Trash2 } from "lucide-react"

import { EstadoVazio } from "@/components/shared/EstadoVazio"
import { CheckboxConcluido, ProgressoDisciplina } from "@/components/shared/Progresso"
import { Carregando, SkeletonCards } from "@/components/shared/Skeletons"
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
  atualizarTopico,
  criarTopico,
  deletarTopico,
  listarTopicos,
} from "@/features/topicos/api/topicos-api"
import { useConcluirTopico } from "@/features/topicos/use-concluir-topico"
import { notificar } from "@/lib/toast"

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

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          {disciplinaSelecionadaId !== null ? (
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
            <p className="text-sm text-muted-foreground">Prova</p>
          )}

          <h1 className="break-words text-xl font-semibold sm:text-2xl">
            {disciplinaSelecionadaId !== null ? disciplinaSelecionada?.nome : prova.nome}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
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
      {disciplinaSelecionadaId !== null && disciplinaComProgressoAtualizado && (
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
            <Card
              key={disciplina.id}
              className="cursor-pointer transition-colors hover:border-primary"
              onClick={() => {
                setDisciplinaSelecionadaId(disciplina.id)
                setNovoNome("")
              }}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  {editandoDisciplinaId === disciplina.id ? (
                    <Input
                      autoFocus
                      value={nomeDisciplinaEditado}
                      onChange={(e) => setNomeDisciplinaEditado(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={() => handleSalvarDisciplina(disciplina)}
                      onKeyDown={(e) => e.key === "Enter" && handleSalvarDisciplina(disciplina)}
                      className="h-9 min-w-0 flex-1 text-base sm:h-7 sm:text-sm"
                    />
                  ) : (
                    <CardTitle
                      className="min-w-0 flex-1 truncate text-base"
                      title={disciplina.nome}
                    >
                      {disciplina.nome}
                    </CardTitle>
                  )}

                  <div className="flex shrink-0 items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-10 sm:size-8"
                      aria-label={`Renomear ${disciplina.nome}`}
                      title="Renomear"
                      onClick={(event) => {
                        event.stopPropagation()
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
                      onClick={(event) => {
                        event.stopPropagation()
                        handleExcluirDisciplina(disciplina.id)
                      }}
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
        /* Lista de conteúdos */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topicos?.length === 0 && (
            <EstadoVazio
              compacto
              className="col-span-full"
              icone={FileText}
              titulo="Nenhum conteúdo nesta matéria"
              descricao="Adicione o primeiro no campo acima. Cada conteúdo ganha uma anotação própria e uma caixa para marcar como concluído."
            />
          )}

          {topicos?.map((topico) => (
            <Card
              key={topico.id}
              className="cursor-pointer transition-colors hover:border-primary"
              onClick={() => navigate(`/topicos/${topico.id}/anotacao`)}
            >
              <CardContent className="flex items-center justify-between gap-2 py-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <CheckboxConcluido
                    checked={topico.concluido}
                    rotulo={`Marcar "${topico.nome}" como concluído`}
                    onChange={(concluido) =>
                      concluirTopico.mutate({ topicoId: topico.id, concluido })
                    }
                  />

                  {editandoTopicoId === topico.id ? (
                    <Input
                      autoFocus
                      value={nomeTopicoEditado}
                      onChange={(e) => setNomeTopicoEditado(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={() => handleSalvarTopico(topico)}
                      onKeyDown={(e) => e.key === "Enter" && handleSalvarTopico(topico)}
                      className="h-9 min-w-0 flex-1 text-base sm:h-7 sm:text-sm"
                    />
                  ) : (
                    <span className="min-w-0 flex-1 truncate" title={topico.nome}>
                      {topico.nome}
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 sm:size-8"
                    aria-label={`Renomear ${topico.nome}`}
                    title="Renomear"
                    onClick={(e) => {
                      e.stopPropagation()
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
                    onClick={(e) => {
                      e.stopPropagation()
                      handleExcluirTopico(topico.id)
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}