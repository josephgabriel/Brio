import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { concluirRevisao, listarRevisoes } from "@/features/revisoes/api/revisoes-api"
import type { StatusRevisao } from "@/features/revisoes/types"

type FiltroStatus = "ativas" | "pendente" | "atrasada" | "concluida" | "todas"
type Periodo = "todas" | "hoje" | "7dias" | "30dias"

const FILTROS_STATUS: { valor: FiltroStatus; label: string }[] = [
  { valor: "ativas", label: "Ativas" },
  { valor: "pendente", label: "Pendentes" },
  { valor: "atrasada", label: "Atrasadas" },
  { valor: "concluida", label: "Concluídas" },
  { valor: "todas", label: "Todas" },
]

const PERIODOS: { valor: Periodo; label: string }[] = [
  { valor: "todas", label: "Todas as datas" },
  { valor: "hoje", label: "Hoje" },
  { valor: "7dias", label: "Próximos 7 dias" },
  { valor: "30dias", label: "Próximos 30 dias" },
]

function paraISO(data: Date): string {
  return data.toISOString().slice(0, 10)
}

function calcularIntervalo(periodo: Periodo): { dataInicio?: string; dataFim?: string } {
  if (periodo === "todas") return {}

  const hoje = new Date()
  if (periodo === "hoje") {
    const hojeISO = paraISO(hoje)
    return { dataInicio: hojeISO, dataFim: hojeISO }
  }

  const dias = periodo === "7dias" ? 6 : 29
  const fim = new Date(hoje)
  fim.setDate(fim.getDate() + dias)
  return { dataInicio: paraISO(hoje), dataFim: paraISO(fim) }
}

function corDoStatus(status: StatusRevisao) {
  if (status === "concluida") return "bg-status-excelente text-white"
  if (status === "atrasada") return "bg-status-critico text-white"
  return "bg-status-atencao text-white"
}

function formatarData(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR")
}

export function RevisoesPage() {
  const navigate = useNavigate()
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("ativas")
  const [periodo, setPeriodo] = useState<Periodo>("todas")
  const queryClient = useQueryClient()

  const { data: revisoes, isLoading } = useQuery({
    queryKey: ["revisoes", periodo],
    queryFn: () => listarRevisoes(calcularIntervalo(periodo)),
  })

  const concluir = useMutation({
    mutationFn: concluirRevisao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revisoes"] })
    },
  })

  const revisoesFiltradas = revisoes?.filter((revisao) => {
    if (filtroStatus === "todas") return true
    if (filtroStatus === "ativas") return revisao.status !== "concluida"
    return revisao.status === filtroStatus
  })

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Revisões</h1>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Prazo</p>
        <div className="flex flex-wrap gap-2">
          {PERIODOS.map(({ valor, label }) => (
            <Button
              key={valor}
              variant={periodo === valor ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriodo(valor)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Status</p>
        <div className="flex flex-wrap gap-2">
          {FILTROS_STATUS.map(({ valor, label }) => (
            <Button
              key={valor}
              variant={filtroStatus === valor ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltroStatus(valor)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-muted-foreground">Carregando...</p>}

      {revisoesFiltradas?.length === 0 && (
        <p className="text-muted-foreground">Nenhuma revisão encontrada nesse filtro.</p>
      )}

      <div className="flex flex-col gap-3">
        {revisoesFiltradas?.map((revisao) => (
          <Card 
          key={revisao.id}
          className={revisao.topico_id ? "cursor-pointer transition-colors hover:border-primary" : ""}
            onClick={() => {
              if (revisao.topico_id) navigate(`/topicos/${revisao.topico_id}/anotacao`)
            }}
            >
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Badge className={corDoStatus(revisao.status)}>{revisao.status}</Badge>
                <div>
                  <p className="font-medium">
                    {revisao.disciplina} — {revisao.assunto}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Revisão {revisao.intervalo_numero} de 4 · agendada para{" "}
                    {formatarData(revisao.data_agendada)}
                  </p>
                </div>
              </div>

              {revisao.status !== "concluida" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => concluir.mutate(revisao.id)}
                  disabled={concluir.isPending}
                >
                  <Check className="size-4" />
                  Concluir
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}