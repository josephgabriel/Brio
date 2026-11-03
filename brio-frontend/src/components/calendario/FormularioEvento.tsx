import { type SubmitEvent, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"

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
} from "@/features/calendario/api/calendario-api"
import { CAMADAS } from "@/features/calendario/camadas"
import type { ItemCalendario, TipoEvento } from "@/features/calendario/types"
import { notificar } from "@/lib/toast"

const OPCOES: { tipo: TipoEvento; rotulo: string }[] = [
  { tipo: "tarefa", rotulo: "Tarefa" },
  { tipo: "evento", rotulo: "Evento" },
]

interface FormularioEventoProps {
  item: ItemCalendario | null
  dataPadrao: string
  aoFechar: () => void
}

export function FormularioEvento({ item, dataPadrao, aoFechar }: FormularioEventoProps) {
  const queryClient = useQueryClient()

  // Só existe enquanto o formulário está aberto, então os valores iniciais vêm do item
  const [tipo, setTipo] = useState<TipoEvento>(item?.tipo === "evento" ? "evento" : "tarefa")
  const [titulo, setTitulo] = useState(item?.titulo ?? "")
  const [data, setData] = useState(item?.data ?? dataPadrao)
  const [descricao, setDescricao] = useState(item?.detalhe ?? "")
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false)

  const podeSalvar = titulo.trim() !== "" && data !== ""

  function aoConcluir() {
    queryClient.invalidateQueries({ queryKey: ["calendario"] })
    aoFechar()
  }

  const salvar = useMutation({
    mutationFn: () => {
      const dados = { titulo: titulo.trim(), data, tipo, descricao: descricao.trim() }
      return item ? atualizarEvento(item.id, dados) : criarEvento(dados)
    },
    onSuccess: () => {
      notificar.sucesso(item ? "Item atualizado" : "Item adicionado")
      aoConcluir()
    },
    onError: (erro) => notificar.erro(erro),
  })

  const remover = useMutation({
    mutationFn: () => excluirEvento(item!.id),
    onSuccess: () => {
      notificar.sucesso("Item removido")
      aoConcluir()
    },
    onError: (erro) => notificar.erro(erro),
  })

  function handleSubmit(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (podeSalvar) salvar.mutate()
  }

  return (
    <Dialog
      open
      onOpenChange={(aberto) => {
        if (!aberto) aoFechar()
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? "Editar item" : "Novo item"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Tipo</Label>
            <div role="group" aria-label="Tipo" className="grid grid-cols-2 gap-2">
              {OPCOES.map(({ tipo: opcao, rotulo }) => {
                const Icone = CAMADAS[opcao].icone
                const ativo = tipo === opcao
                return (
                  <button
                    key={opcao}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => setTipo(opcao)}
                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-sm font-medium transition-colors ${
                      ativo
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <Icone className="size-4" />
                    {rotulo}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="titulo-evento">Título</Label>
            <Input
              id="titulo-evento"
              value={titulo}
              maxLength={200}
              autoFocus
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="data-evento">Data</Label>
            <Input
              id="data-evento"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="descricao-evento">Descrição (opcional)</Label>
            <Input
              id="descricao-evento"
              value={descricao}
              maxLength={1000}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <DialogFooter className="items-center sm:justify-between">
            {item ? (
              confirmandoRemocao ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Remover este item?</span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remover.mutate()}
                    disabled={remover.isPending}
                  >
                    {remover.isPending ? "Removendo..." : "Sim, remover"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmandoRemocao(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => setConfirmandoRemocao(true)}
                >
                  <Trash2 className="size-4" />
                  Remover
                </Button>
              )
            ) : (
              <span />
            )}

            <Button type="submit" disabled={!podeSalvar || salvar.isPending}>
              {salvar.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}