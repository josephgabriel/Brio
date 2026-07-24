import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  criarDisciplina,
  deletarDisciplina,
  listarDisciplinas,
} from "@/features/disciplinas/api/disciplinas-api"
import { obterProva } from "@/features/provas/api/provas-api"
import {
  criarTopico,
  deletarTopico,
  listarTopicos,
} from "@/features/topicos/api/topicos-api"

export function ProvaDetalhePage() {
  const { id } = useParams()
  const provaId = Number(id)

  const [disciplinaSelecionadaId, setDisciplinaSelecionadaId] = useState<number | null>(null)
  const [novoNome, setNovoNome] = useState("")
  const queryClient = useQueryClient()

  const { data: prova } = useQuery({
    queryKey: ["provas", provaId],
    queryFn: () => obterProva(provaId),
  })

  const { data: disciplinas } = useQuery({
    queryKey: ["disciplinas", provaId],
    queryFn: () => listarDisciplinas(provaId),
  })

  const disciplinaSelecionada = disciplinas?.find((d) => d.id === disciplinaSelecionadaId)

  const { data: topicos } = useQuery({
    queryKey: ["topicos", disciplinaSelecionadaId],
    queryFn: () => listarTopicos(disciplinaSelecionadaId!),
    enabled: disciplinaSelecionadaId !== null,
  })

  const criarDisciplinaMutation = useMutation({
    mutationFn: () => criarDisciplina(provaId, novoNome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinas", provaId] })
      setNovoNome("")
    },
  })

  const deletarDisciplinaMutation = useMutation({
    mutationFn: deletarDisciplina,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["disciplinas", provaId] }),
  })

  const criarTopicoMutation = useMutation({
    mutationFn: () => criarTopico(disciplinaSelecionadaId!, novoNome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topicos", disciplinaSelecionadaId] })
      setNovoNome("")
    },
  })

  const deletarTopicoMutation = useMutation({
    mutationFn: deletarTopico,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["topicos", disciplinaSelecionadaId] }),
  })

  function handleCriar() {
    if (!novoNome) return
    if (disciplinaSelecionadaId === null) {
      criarDisciplinaMutation.mutate()
    } else {
      criarTopicoMutation.mutate()
    }
  }

  if (!prova) {
    return <p className="text-muted-foreground">Carregando...</p>
  }

  return (
    <div className="flex flex-col gap-6">
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
            {disciplinaSelecionadaId !== null ? disciplinaSelecionada?.nome : prova.nome}
          </h1>
        </div>

        <Button variant="outline" asChild>
          <Link to={`/provas/${provaId}/editar`}>
            <Pencil className="size-4" />
            Editar prova
          </Link>
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder={
            disciplinaSelecionadaId === null
              ? "Nova matéria (ex: Matemática)"
              : "Novo conteúdo (ex: Frações)"
          }
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
        />
        <Button
          type="button"
          onClick={handleCriar}
          disabled={
            !novoNome || criarDisciplinaMutation.isPending || criarTopicoMutation.isPending
          }
        >
          <Plus className="size-4" />
          Adicionar
        </Button>
      </div>

      {disciplinaSelecionadaId === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {disciplinas?.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma matéria cadastrada ainda.</p>
          )}
          {disciplinas?.map((disciplina) => (
            <Card
              key={disciplina.id}
              className="cursor-pointer transition-colors hover:border-primary"
              onClick={() => setDisciplinaSelecionadaId(disciplina.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{disciplina.nome}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      deletarDisciplinaMutation.mutate(disciplina.id)
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${disciplina.nivel_conhecimento}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {disciplina.nivel_conhecimento}%
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topicos?.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum conteúdo cadastrado ainda.</p>
          )}
          {topicos?.map((topico) => (
            <Card key={topico.id}>
              <CardContent className="flex items-center justify-between py-4">
                <span>{topico.nome}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deletarTopicoMutation.mutate(topico.id)}
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