import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react"

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
import {
  atualizarEvento,
  criarEvento,
  excluirEvento,
  obterCalendario,
} from "@/features/calendario/api/calendario-api"
import { gerarDiasDaSemana, gerarDiasDoMes, paraISO } from "@/features/calendario/grade"
import type { ItemCalendario } from "@/features/calendario/types"

type Visualizacao = "mensal" | "semanal"

const CORES_TIPO: Record<string, string> = {
  prova: "bg-primary",
  sessao: "bg-muted-foreground",
  revisao: "bg-status-atencao",
  evento: "bg-status-excelente",
  tarefa: "bg-status-risco",
}

const NOMES_MES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export function CalendarioPage() {
  const [visualizacao, setVisualizacao] = useState<Visualizacao>("mensal")
  const [referencia, setReferencia] = useState(new Date())
  const [modalAberto, setModalAberto] = useState(false)
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null)

  const [tituloForm, setTituloForm] = useState("")
  const [tipoForm, setTipoForm] = useState<"evento" | "tarefa">("evento")
  const [descricaoForm, setDescricaoForm] = useState("")

  const queryClient = useQueryClient()

  const dias = useMemo(
    () =>
      visualizacao === "mensal" ? gerarDiasDoMes(referencia) : gerarDiasDaSemana(referencia),
    [visualizacao, referencia],
  )

  const dataInicio = paraISO(dias[0])
  const dataFim = paraISO(dias[dias.length - 1])

  const { data: itens } = useQuery({
    queryKey: ["calendario", dataInicio, dataFim],
    queryFn: () => obterCalendario(dataInicio, dataFim),
  })

  const itensPorDia = useMemo(() => {
    const mapa = new Map<string, ItemCalendario[]>()
    itens?.forEach((item) => {
      const lista = mapa.get(item.data) ?? []
      lista.push(item)
      mapa.set(item.data, lista)
    })
    return mapa
  }, [itens])

  const criar = useMutation({
    mutationFn: () =>
      criarEvento({
        titulo: tituloForm,
        data: paraISO(diaSelecionado!),
        tipo: tipoForm,
        descricao: descricaoForm,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendario"] })
      setModalAberto(false)
    },
  })

  const alternarConcluido = useMutation({
    mutationFn: ({ id, concluido }: { id: number; concluido: boolean }) =>
      atualizarEvento(id, { concluido }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendario"] }),
  })

  const excluir = useMutation({
    mutationFn: (id: number) => excluirEvento(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendario"] }),
  })

  function abrirNovoEvento(dia: Date) {
    setDiaSelecionado(dia)
    setTituloForm("")
    setTipoForm("evento")
    setDescricaoForm("")
    setModalAberto(true)
  }

  function navegar(direcao: 1 | -1) {
    const nova = new Date(referencia)
    if (visualizacao === "mensal") {
      nova.setMonth(nova.getMonth() + direcao)
    } else {
      nova.setDate(nova.getDate() + direcao * 7)
    }
    setReferencia(nova)
  }

  const hojeISO = paraISO(new Date())

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">
          {visualizacao === "mensal"
            ? `${NOMES_MES[referencia.getMonth()]} de ${referencia.getFullYear()}`
            : `Semana de ${dias[0].toLocaleDateString("pt-BR")}`}
        </h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navegar(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setReferencia(new Date())}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={() => navegar(1)}>
            <ChevronRight className="size-4" />
          </Button>

          <Button
            variant={visualizacao === "mensal" ? "default" : "outline"}
            size="sm"
            onClick={() => setVisualizacao("mensal")}
          >
            Mês
          </Button>
          <Button
            variant={visualizacao === "semanal" ? "default" : "outline"}
            size="sm"
            onClick={() => setVisualizacao("semanal")}
          >
            Semana
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
          <div
            key={dia}
            className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground"
          >
            {dia}
          </div>
        ))}

        {dias.map((dia) => {
          const iso = paraISO(dia)
          const itensDoDia = itensPorDia.get(iso) ?? []
          const foraDoMes = visualizacao === "mensal" && dia.getMonth() !== referencia.getMonth()
          const ehHoje = iso === hojeISO

          return (
            <div
              key={iso}
              className={`flex flex-col gap-1 bg-background p-1.5 ${
                visualizacao === "semanal" ? "min-h-[300px]" : "min-h-[100px]"
              } ${foraDoMes ? "opacity-40" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-xs ${
                    ehHoje ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {dia.getDate()}
                </span>
                <button
                  type="button"
                  onClick={() => abrirNovoEvento(dia)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {itensDoDia.map((item) => (
                  <ItemDoDia
                    key={`${item.tipo}-${item.id}`}
                    item={item}
                    onAlternarConcluido={() =>
                      alternarConcluido.mutate({ id: item.id, concluido: !item.concluido })
                    }
                    onExcluir={() => excluir.mutate(item.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo evento</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={tituloForm}
                onChange={(e) => setTituloForm(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tipo">Tipo</Label>
              <select
                id="tipo"
                value={tipoForm}
                onChange={(e) => setTipoForm(e.target.value as "evento" | "tarefa")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="evento">Evento</option>
                <option value="tarefa">Tarefa</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => criar.mutate()} disabled={!tituloForm || criar.isPending}>
              {criar.isPending ? "Salvando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ItemDoDiaProps {
  item: ItemCalendario
  onAlternarConcluido: () => void
  onExcluir: () => void
}

function ItemDoDia({ item, onAlternarConcluido, onExcluir }: ItemDoDiaProps) {
  const podeEditar = item.tipo === "evento" || item.tipo === "tarefa"

  const conteudo = (
    <div
      className={`group flex items-center gap-1.5 rounded px-1.5 py-1 text-xs text-white ${
        CORES_TIPO[item.tipo]
      } ${item.concluido ? "opacity-50 line-through" : ""}`}
    >
      <span className="flex-1 truncate">{item.titulo}</span>
      {podeEditar && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAlternarConcluido()
            }}
            className="hidden group-hover:block"
          >
            ✓
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onExcluir()
            }}
            className="hidden group-hover:block"
          >
            <Trash2 className="size-3" />
          </button>
        </>
      )}
    </div>
  )

  return item.rota ? <Link to={item.rota}>{conteudo}</Link> : conteudo
}