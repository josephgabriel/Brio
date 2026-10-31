import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { notificar } from "@/lib/toast"
import { Badge } from "@/components/ui/badge"
import { SkeletonLista, Carregando } from "@/components/shared/Skeletons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { concluirRevisao, listarRevisoes } from "@/features/revisoes/api/revisoes-api"
import type { StatusRevisao } from "@/features/revisoes/types"
import { paraISO } from "@/features/calendario/grade"
import { CheckCircle2, RotateCcw, SearchX } from "lucide-react"
import { EstadoVazio } from "@/components/shared/EstadoVazio"

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
      notificar.sucesso("Revisão concluída")
    },
    onError: (erro) => notificar.erro(erro),
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

      {
      isLoading && <Carregando>
        <SkeletonLista quantidade={5} />
        </Carregando>
        }

            {revisoesFiltradas?.length === 0 &&
        (revisoes?.length === 0 && periodo === "todas" ? (
          <EstadoVazio
            icone={RotateCcw}
            titulo="Nenhuma revisão agendada"
            descricao="Cada sessão finalizada agenda 4 revisões automáticas, em 1, 7, 16 e 35 dias. Elas aparecem aqui."
            acao={{ rotulo: "Iniciar uma sessão", para: "/sessoes" }}
          />
        ) : filtroStatus === "ativas" && periodo === "todas" ? (
          <EstadoVazio
            icone={CheckCircle2}
            titulo="Tudo em dia"
            descricao="Você concluiu todas as revisões disponíveis. Novas aparecem conforme você finalizar sessões."
            acao={{ rotulo: "Ver as concluídas", aoClicar: () => setFiltroStatus("concluida") }}
          />
        ) : (
          <EstadoVazio
            icone={SearchX}
            titulo="Nenhuma revisão neste filtro"
            descricao="Tente outro prazo ou outro status."
            acao={{
              rotulo: "Limpar filtros",
              aoClicar: () => {
                setFiltroStatus("todas")
                setPeriodo("todas")
              },
            }}
          />
        ))}

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