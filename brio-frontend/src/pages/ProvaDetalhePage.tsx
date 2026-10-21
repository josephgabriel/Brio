import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, BarChart3, Pencil, Plus, Trash2 } from "lucide-react"
import { useConfirmar } from "@/features/confirmacao/confirmacao-context"
import { Button } from "@/components/ui/button"
import { SkeletonCards, Carregando } from "@/components/shared/Skeletons"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { notificar } from "@/lib/toast"
import {
  criarDisciplina,
  deletarDisciplina,
  listarDisciplinas,
  atualizarDisciplina,
} from "@/features/disciplinas/api/disciplinas-api"

import { obterProva } from "@/features/provas/api/provas-api"
import { CheckboxConcluido, ProgressoDisciplina } from "@/components/shared/Progresso"
import { useConcluirTopico } from "@/features/topicos/use-concluir-topico"
import {
  criarTopico,
  deletarTopico,
  listarTopicos,
  atualizarTopico,
} from "@/features/topicos/api/topicos-api"

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
  const { data: prova } = useQuery({
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
  const topicosConcluidos = topicos?.filter((t) => t.concluido).length ?? disciplinaSelecionada?.topicos_concluidos ?? 0
  const progressoPercentual = totalTopicos > 0 ? (topicosConcluidos / totalTopicos) * 100 : (disciplinaSelecionada?.progresso_percentual ?? 0)

  const disciplinaComProgressoAtualizado = disciplinaSelecionada
    ? {
        ...disciplinaSelecionada,
        total_topicos: totalTopicos,
        topicos_concluidos: topicosConcluidos,
        progresso_percentual: progressoPercentual,
      }
    : null

  // Mutações
  const atualizarDisciplinaMutation = useMutation({
    mutationFn: (id: number) => atualizarDisciplina(id, nomeDisciplinaEditado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinas", provaId] })
      notificar.sucesso("Matéria renomeada com sucesso!")
      setEditandoDisciplinaId(null)
    },
    onError: (erro) => notificar.erro(erro),
  })

  const atualizarTopicoMutation = useMutation({
    mutationFn: (id: number) => atualizarTopico(id, nomeTopicoEditado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topicos", disciplinaSelecionadaId] })
      queryClient.invalidateQueries({ queryKey: ["disciplinas", provaId] })
      notificar.sucesso("Conteúdo atualizado com sucesso!")
      setEditandoTopicoId(null)
    },
    onError: (erro) => notificar.erro(erro),
  })

  const criarDisciplinaMutation = useMutation({
    mutationFn: () => criarDisciplina(provaId, novoNome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinas", provaId] })
      setNovoNome("")
      notificar.sucesso("Matéria adicionada com sucesso!")
    },
    onError: (erro) => notificar.erro(erro),
  })

  const deletarDisciplinaMutation = useMutation({
    mutationFn: deletarDisciplina,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinas", provaId] })
      notificar.sucesso("Matéria excluída com sucesso!")
    },
    onError: (erro) => notificar.erro(erro),
  })

  const criarTopicoMutation = useMutation({
    mutationFn: () => criarTopico(disciplinaSelecionadaId!, novoNome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topicos", disciplinaSelecionadaId] })
      queryClient.invalidateQueries({ queryKey: ["disciplinas", provaId] })
      notificar.sucesso("Conteúdo adicionado com sucesso!")
      setNovoNome("")
    },
    onError: (erro) => notificar.erro(erro),
  })

  const deletarTopicoMutation = useMutation({
    mutationFn: deletarTopico,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topicos", disciplinaSelecionadaId] })
      queryClient.invalidateQueries({ queryKey: ["disciplinas", provaId] })
      notificar.sucesso("Conteúdo excluído com sucesso!")
    },
    onError: (erro) => notificar.erro(erro),
  })

  // Handlers
  function handleSalvarDisciplina(disciplina: { id: number; nome: string }) {
    if (!nomeDisciplinaEditado.trim() || nomeDisciplinaEditado === disciplina.nome) {
      setEditandoDisciplinaId(null)
      return
    }
    atualizarDisciplinaMutation.mutate(disciplina.id)
  }

  function handleSalvarTopico(topico: { id: number; nome: string }) {
    if (!nomeTopicoEditado.trim() || nomeTopicoEditado === topico.nome) {
      setEditandoTopicoId(null)
      return
    }
    atualizarTopicoMutation.mutate(topico.id)
  }

  async function handleExcluirDisciplina(disciplinaId: number) {
    const confirmado = await confirmar({
      titulo: "Excluir a matéria?",
      descricao: "Os conteúdos e anotações dela serão apagados. Suas sessões de estudo continuam no histórico",
      textoConfirmar: "Excluir",
      destrutivo: true,
    })
    if (confirmado) {
      deletarDisciplinaMutation.mutate(disciplinaId)
    }
  }

  async function handleExcluirTopico(topicoId: number) {
    const confirmado = await confirmar({
      titulo: "Excluir o tópico?",
      descricao: "Os conteúdos e anotações dele serão apagados. Suas sessões de estudo continuam no histórico.",
      textoConfirmar: "Excluir",
      destrutivo: true,
    })
    if (confirmado) {
      deletarTopicoMutation.mutate(topicoId)
    }
  }

  function handleCriar() {
    if (!novoNome.trim()) return

    if (disciplinaSelecionadaId === null) {
      criarDisciplinaMutation.mutate()
    } else {
      criarTopicoMutation.mutate()
    }
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
      <div className="flex items-center justify-between">
        <div>
          {disciplinaSelecionadaId !== null ? (
            <button
              type="button"
              onClick={() => setDisciplinaSelecionadaId(null)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              {prova.nome}
            </button>
          ) : (
            <p className="text-sm text-muted-foreground">Prova</p>
          )}

          <h1 className="text-2xl font-semibold">
            {disciplinaSelecionadaId !== null
              ? disciplinaSelecionada?.nome
              : prova.nome}
          </h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/provas/${provaId}/estatisticas`}>
              <BarChart3 className="size-4" />
              Estatísticas
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link to={`/provas/${provaId}/editar`}>
              <Pencil className="size-4" />
              Editar prova
            </Link>
          </Button>
        </div>
      </div>

      {/* Barra de Progresso na visão de Tópicos */}
      {disciplinaSelecionadaId !== null && disciplinaComProgressoAtualizado && (
        <Card className="p-4">
          <ProgressoDisciplina disciplina={disciplinaComProgressoAtualizado} />
        </Card>
      )}

      {/* Formulário de criação */}
      <div className="flex gap-2">
        <Input
          placeholder={
            disciplinaSelecionadaId === null
              ? "Nova matéria (ex: Matemática)"
              : "Novo conteúdo (ex: Frações)"
          }
          value={novoNome}
          onChange={(event) => setNovoNome(event.target.value)}
        />

        <Button
          type="button"
          onClick={handleCriar}
          disabled={
            !novoNome.trim() ||
            criarDisciplinaMutation.isPending ||
            criarTopicoMutation.isPending
          }
        >
          <Plus className="size-4" />
          Adicionar
        </Button>
      </div>

      {/* Listas */}
      {disciplinaSelecionadaId === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {disciplinas?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma matéria cadastrada ainda.
            </p>
          )}

          {disciplinas?.map((disciplina) => (
            <Card
              key={disciplina.id}
              className="cursor-pointer transition-colors hover:border-primary"
              onClick={() => setDisciplinaSelecionadaId(disciplina.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  {editandoDisciplinaId === disciplina.id ? (
                    <Input
                      autoFocus
                      value={nomeDisciplinaEditado}
                      onChange={(e) => setNomeDisciplinaEditado(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={() => handleSalvarDisciplina(disciplina)}
                      onKeyDown={(e) => e.key === "Enter" && handleSalvarDisciplina(disciplina)}
                      className="h-7"
                    />
                  ) : (
                    <CardTitle
                      className="flex items-center gap-1.5 text-base"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditandoDisciplinaId(disciplina.id)
                        setNomeDisciplinaEditado(disciplina.nome)
                      }}
                    >
                      {disciplina.nome}
                      <Pencil className="size-3 text-muted-foreground" />
                    </CardTitle>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleExcluirDisciplina(disciplina.id)
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <ProgressoDisciplina disciplina={disciplina} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Lista de tópicos */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topicos?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum conteúdo cadastrado ainda.
            </p>
          )}

          {topicos?.map((topico) => (
            <Card
              key={topico.id}
              className="cursor-pointer transition-colors hover:border-primary"
              onClick={() => navigate(`/topicos/${topico.id}/anotacao`)}
            >
              <CardContent className="flex items-center justify-between py-4">
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
                      className="h-7"
                    />
                  ) : (
                    <span
                      className="flex items-center gap-1.5"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditandoTopicoId(topico.id)
                        setNomeTopicoEditado(topico.nome)
                      }}
                    >
                      {topico.nome}
                      <Pencil className="size-3 text-muted-foreground" />
                    </span>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExcluirTopico(topico.id)
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}