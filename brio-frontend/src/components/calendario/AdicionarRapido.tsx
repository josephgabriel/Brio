import { type SubmitEvent, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { criarEvento } from "@/features/calendario/api/calendario-api"
import { CAMADAS } from "@/features/calendario/camadas"
import type { TipoEvento } from "@/features/calendario/types"
import { notificar } from "@/lib/toast"

const OPCOES: { tipo: TipoEvento; rotulo: string }[] = [
  { tipo: "tarefa", rotulo: "Tarefa" },
  { tipo: "evento", rotulo: "Evento" },
]

interface AdicionarRapidoProps {
  dataISO: string
  rotuloDia: string
}

export function AdicionarRapido({ dataISO, rotuloDia }: AdicionarRapidoProps) {
  const queryClient = useQueryClient()
  const [titulo, setTitulo] = useState("")
  const [tipo, setTipo] = useState<TipoEvento>("tarefa")

  const criar = useMutation({
    mutationFn: () => criarEvento({ titulo: titulo.trim(), data: dataISO, tipo, descricao: "" }),
    onSuccess: () => {
      setTitulo("")
      queryClient.invalidateQueries({ queryKey: ["calendario"] })
    },
    onError: (erro) => notificar.erro(erro),
  })

  function enviar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (titulo.trim() && !criar.isPending) criar.mutate()
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        value={titulo}
        maxLength={200}
        aria-label={`Adicionar para ${rotuloDia}`}
        placeholder={`Adicionar para ${rotuloDia}…`}
        onChange={(e) => setTitulo(e.target.value)}
        className="flex-1"
      />

      <div className="flex items-center gap-2">
        <div role="group" aria-label="Tipo" className="flex gap-1 rounded-full bg-muted p-1">
          {OPCOES.map(({ tipo: opcao, rotulo }) => {
            const Icone = CAMADAS[opcao].icone
            return (
              <button
                key={opcao}
                type="button"
                aria-pressed={tipo === opcao}
                onClick={() => setTipo(opcao)}
                className={`flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  tipo === opcao
                    ? "bg-emerald-500 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icone className="size-3.5" />
                {rotulo}
              </button>
            )
          })}
        </div>

        <Button type="submit" disabled={!titulo.trim() || criar.isPending}>
          <Plus className="size-4" />
          Adicionar
        </Button>
      </div>
    </form>
  )
}