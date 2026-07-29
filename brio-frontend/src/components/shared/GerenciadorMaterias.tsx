import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  criarDisciplina,
  deletarDisciplina,
  listarDisciplinas,
} from "@/features/disciplinas/api/disciplinas-api"
import type { Disciplina } from "@/features/disciplinas/types"
import {
  criarTopico,
  deletarTopico,
  listarTopicos,
} from "@/features/topicos/api/topicos-api"
import type { Topico } from "@/features/topicos/types"
import { obterProva } from "@/features/provas/api/provas-api"

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

  const { data: prova } = useQuery({
    queryKey: ["provas", provaId],
    queryFn: () => obterProva(provaId),
  })

  const podeSelecionarTopico = prova?.status === "ativa"

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
    <div className="flex flex-col gap-3 p-6">
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
            onSelecionarTopico={podeSelecionarTopico ? onSelecionarTopico : undefined}
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

  const deletarTopicoMutation = useMutation({
    mutationFn: deletarTopico,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topicos", disciplina.id] })
    },
  })

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between p-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-2 text-left"
        >
          {expandida ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          <span className="font-medium">{disciplina.nome}</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${disciplina.nivel_conhecimento}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {disciplina.nivel_conhecimento}%
            </span>
          </div>
         
        </div>
      </div>

      {expandida && (
        <div className="flex flex-col gap-2 border-t border-border p-3">
          {topicos?.map((topico) =>
            onSelecionarTopico ? (
              <button
                key={topico.id}
                type="button"
                onClick={() => onSelecionarTopico(topico)}
                className="flex items-center justify-between rounded-md p-1.5 text-left text-sm hover:bg-accent"
              >
                <span>{topico.nome}</span>
              </button>
            ) : (
              <div key={topico.id} className="flex items-center justify-between text-sm">
                <span>{topico.nome}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => deletarTopicoMutation.mutate(topico.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
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