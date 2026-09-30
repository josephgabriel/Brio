import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  atualizarDisciplina,
  criarDisciplina,
  deletarDisciplina,
  listarDisciplinas,
} from "@/features/disciplinas/api/disciplinas-api"
import type { Disciplina } from "@/features/disciplinas/types"
import {
  atualizarTopico,
  criarTopico,
  deletarTopico,
  listarTopicos,
} from "@/features/topicos/api/topicos-api"
import type { Topico } from "@/features/topicos/types"

interface GerenciadorMateriasProps {
  provaId: number
  onSelecionarTopico?: (topico: Topico) => void
}

export function GerenciadorMaterias({ provaId, onSelecionarTopico }: GerenciadorMateriasProps) {
  const [disciplinaExpandidaId, setDisciplinaExpandidaId] = useState<number | null>(null)
  const [novaDisciplina, setNovaDisciplina] = useState("")
  const queryClient = useQueryClient()

  const { data: disciplinas } = useQuery({
    queryKey: ["disciplinas", provaId],
    queryFn: () => listarDisciplinas(provaId),
  })

  const criarDisciplinaMutation = useMutation({
    mutationFn: () => criarDisciplina(provaId, novaDisciplina),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinas", provaId] })
      setNovaDisciplina("")
    },
  })

  const deletarDisciplinaMutation = useMutation({
    mutationFn: deletarDisciplina,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinas", provaId] })
    },
  })

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Matérias e Conteúdos</h2>

      <div className="flex gap-2">
        <Input
          placeholder="Nome da matéria (ex: Matemática)"
          value={novaDisciplina}
          onChange={(e) => setNovaDisciplina(e.target.value)}
        />
        <Button
          type="button"
          onClick={() => criarDisciplinaMutation.mutate()}
          disabled={!novaDisciplina || criarDisciplinaMutation.isPending}
        >
          <Plus className="size-4" />
          Adicionar
        </Button>
      </div>

      {disciplinas?.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma matéria cadastrada ainda.</p>
      )}

      <div className="flex flex-col gap-2">
        {disciplinas?.map((disciplina) => (
          <DisciplinaItem
            key={disciplina.id}
            disciplina={disciplina}
            expandida={disciplinaExpandidaId === disciplina.id}
            onToggle={() =>
              setDisciplinaExpandidaId(
                disciplinaExpandidaId === disciplina.id ? null : disciplina.id,
              )
            }
            onExcluir={() => deletarDisciplinaMutation.mutate(disciplina.id)}
            onSelecionarTopico={onSelecionarTopico}
          />
        ))}
      </div>
    </div>
  )
}

interface DisciplinaItemProps {
  disciplina: Disciplina
  expandida: boolean
  onToggle: () => void
  onExcluir: () => void
  onSelecionarTopico?: (topico: Topico) => void
}

function DisciplinaItem({
  disciplina,
  expandida,
  onToggle,
  onExcluir,
  onSelecionarTopico,
}: DisciplinaItemProps) {
  const [novoTopico, setNovoTopico] = useState("")
  const [editandoDisciplina, setEditandoDisciplina] = useState(false)
  const [nomeDisciplinaEditado, setNomeDisciplinaEditado] = useState(disciplina.nome)
  const queryClient = useQueryClient()

  const { data: topicos } = useQuery({
    queryKey: ["topicos", disciplina.id],
    queryFn: () => listarTopicos(disciplina.id),
    enabled: expandida,
  })

  const criarTopicoMutation = useMutation({
    mutationFn: () => criarTopico(disciplina.id, novoTopico),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topicos", disciplina.id] })
      setNovoTopico("")
    },
  })

  const atualizarDisciplinaMutation = useMutation({
    mutationFn: () => atualizarDisciplina(disciplina.id, nomeDisciplinaEditado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinas"] })
      setEditandoDisciplina(false)
    },
  })

  function handleSalvarDisciplina() {
    if (!nomeDisciplinaEditado.trim() || nomeDisciplinaEditado === disciplina.nome) {
      setEditandoDisciplina(false)
      setNomeDisciplinaEditado(disciplina.nome)
      return
    }
    atualizarDisciplinaMutation.mutate()
  }

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between p-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-2 text-left"
        >
          {expandida ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          {editandoDisciplina ? (
            <Input
              autoFocus
              value={nomeDisciplinaEditado}
              onChange={(e) => setNomeDisciplinaEditado(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onBlur={handleSalvarDisciplina}
              onKeyDown={(e) => e.key === "Enter" && handleSalvarDisciplina()}
              className="h-7"
            />
          ) : (
            <span
              className="font-medium"
              onClick={(e) => {
                e.stopPropagation()
                setEditandoDisciplina(true)
              }}
            >
              {disciplina.nome}
            </span>
          )}
        </button>

        <Button type="button" variant="ghost" size="sm" onClick={onExcluir}>
          <Trash2 className="size-4" />
        </Button>
      </div>

      {expandida && (
        <div className="flex flex-col gap-2 border-t border-border p-3">
          {topicos?.map((topico) =>
            onSelecionarTopico ? (
              <TopicoLinha
                key={topico.id}
                topico={topico}
                disciplinaId={disciplina.id}
                onSelecionar={() => onSelecionarTopico(topico)}
              />
            ) : (
              <TopicoLinha key={topico.id} topico={topico} disciplinaId={disciplina.id} />
            ),
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Novo conteúdo (ex: Frações)"
              value={novoTopico}
              onChange={(e) => setNovoTopico(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              onClick={() => criarTopicoMutation.mutate()}
              disabled={!novoTopico || criarTopicoMutation.isPending}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

interface TopicoLinhaProps {
  topico: Topico
  disciplinaId: number
  onSelecionar?: () => void
}

function TopicoLinha({ topico, disciplinaId, onSelecionar }: TopicoLinhaProps) {
  const [editando, setEditando] = useState(false)
  const [nomeEditado, setNomeEditado] = useState(topico.nome)
  const queryClient = useQueryClient()

  const atualizarTopicoMutation = useMutation({
    mutationFn: () => atualizarTopico(topico.id, nomeEditado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topicos", disciplinaId] })
      setEditando(false)
    },
  })

  const deletarTopicoMutation = useMutation({
    mutationFn: deletarTopico,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topicos", disciplinaId] })
    },
  })

  function handleSalvar() {
    if (!nomeEditado.trim() || nomeEditado === topico.nome) {
      setEditando(false)
      setNomeEditado(topico.nome)
      return
    }
    atualizarTopicoMutation.mutate()
  }

  if (editando) {
    return (
      <div className="flex items-center gap-1.5">
        <Input
          autoFocus
          value={nomeEditado}
          onChange={(e) => setNomeEditado(e.target.value)}
          onBlur={handleSalvar}
          onKeyDown={(e) => e.key === "Enter" && handleSalvar()}
          className="h-7"
        />
      </div>
    )
  }

  if (onSelecionar) {
    return (
      <button
        type="button"
        onClick={onSelecionar}
        className="flex items-center justify-between rounded-md p-1.5 text-left text-sm hover:bg-accent"
      >
        <span
          onClick={(e) => {
            e.stopPropagation()
            setEditando(true)
          }}
        >
          {topico.nome}
        </span>
        <Trash2
          className="size-3.5 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            deletarTopicoMutation.mutate(topico.id)
          }}
        />
      </button>
    )
  }

  return (
    <div className="flex items-center justify-between text-sm">
      <span onClick={() => setEditando(true)} className="cursor-pointer">
        {topico.nome}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => deletarTopicoMutation.mutate(topico.id)}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  )
}