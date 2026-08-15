import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { listarDisciplinas } from "@/features/disciplinas/api/disciplinas-api"
import {
  criarItemCronograma,
  excluirItemCronograma,
  listarCronograma,
} from "@/features/cronograma/api/cronograma-api"
import { listarProvas } from "@/features/provas/api/provas-api"

const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]

function formatarHorario(horario: string | null): string {
  if (!horario) return ""
  return horario.slice(0, 5)
}

export function CronogramaPage() {
  const [modalAberto, setModalAberto] = useState(false)
  const [diaSelecionado, setDiaSelecionado] = useState(0)

  const [provaId, setProvaId] = useState("")
  const [disciplinaId, setDisciplinaId] = useState("")
  const [horario, setHorario] = useState("")
  const [duracao, setDuracao] = useState("60")

  const queryClient = useQueryClient()

  const { data: itens } = useQuery({ queryKey: ["cronograma"], queryFn: listarCronograma })
  const { data: provas } = useQuery({ queryKey: ["provas"], queryFn: listarProvas })
  const { data: disciplinas } = useQuery({
    queryKey: ["disciplinas", provaId],
    queryFn: () => listarDisciplinas(Number(provaId)),
    enabled: !!provaId,
  })

  const criar = useMutation({
    mutationFn: () =>
      criarItemCronograma({
        disciplina_id: Number(disciplinaId),
        dia_semana: diaSelecionado,
        duracao_minutos: Number(duracao),
        horario_inicio: horario || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cronograma"] })
      setModalAberto(false)
    },
  })

  const excluir = useMutation({
    mutationFn: excluirItemCronograma,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cronograma"] }),
  })

  function abrirModal(dia: number) {
    setDiaSelecionado(dia)
    setProvaId("")
    setDisciplinaId("")
    setHorario("")
    setDuracao("60")
    setModalAberto(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Cronograma de Estudos</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
        {DIAS_SEMANA.map((nomeDia, dia) => {
          const itensDoDia = itens
            ?.filter((item) => item.dia_semana === dia)
            .sort((a, b) => (a.horario_inicio ?? "").localeCompare(b.horario_inicio ?? ""))

          return (
            <div key={dia} className="flex flex-col gap-2 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{nomeDia}</p>
                <button
                  type="button"
                  onClick={() => abrirModal(dia)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {itensDoDia?.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nada planejado</p>
                )}
                {itensDoDia?.map((item) => (
                  <div
                    key={item.id}
                    className="group flex flex-col gap-0.5 rounded-md bg-muted p-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-medium">{item.disciplina_nome}</span>
                      <button
                        type="button"
                        onClick={() => excluir.mutate(item.id)}
                        className="hidden text-muted-foreground hover:text-destructive group-hover:block"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                    <span className="text-muted-foreground">{item.prova_nome}</span>
                    <span className="text-muted-foreground">
                      {item.horario_inicio && `${formatarHorario(item.horario_inicio)} · `}
                      {item.duracao_minutos} min
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo item — {DIAS_SEMANA[diaSelecionado]}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="prova">Prova</Label>
              <select
                id="prova"
                value={provaId}
                onChange={(e) => {
                  setProvaId(e.target.value)
                  setDisciplinaId("")
                }}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione uma prova</option>
                {provas
                  ?.filter((p) => p.status === "ativa")
                  .map((prova) => (
                    <option key={prova.id} value={String(prova.id)}>
                      {prova.nome}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="disciplina">Matéria</Label>
              <select
                id="disciplina"
                value={disciplinaId}
                onChange={(e) => setDisciplinaId(e.target.value)}
                disabled={!provaId}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione uma matéria</option>
                {disciplinas?.map((disciplina) => (
                  <option key={disciplina.id} value={String(disciplina.id)}>
                    {disciplina.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="horario">Horário (opcional)</Label>
                <Input
                  id="horario"
                  type="time"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="duracao">Duração (min)</Label>
                <Input
                  id="duracao"
                  type="number"
                  min="1"
                  value={duracao}
                  onChange={(e) => setDuracao(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => criar.mutate()} disabled={!disciplinaId || criar.isPending}>
              {criar.isPending ? "Salvando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}