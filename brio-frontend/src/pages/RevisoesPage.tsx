import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { concluirRevisao, listarRevisoes } from "@/features/revisoes/api/revisoes-api"
import type { StatusRevisao } from "@/features/revisoes/types"

type Filtro = "todas" | "pendente" | "atrasada" | "concluida"

const FILTROS: { valor: Filtro; label: string }[] = [
  { valor: "todas", label: "Todas" },
  { valor: "pendente", label: "Pendentes" },
  { valor: "atrasada", label: "Atrasadas" },
  { valor: "concluida", label: "Concluídas" },
]

function corDoStatus(status: StatusRevisao) {
  if (status === "concluida") return "bg-status-excelente text-white"
  if (status === "atrasada") return "bg-status-critico text-white"
  return "bg-status-atencao text-white"
}

function formatarData(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR")
}

export function RevisoesPage() {
  const [filtro, setFiltro] = useState<Filtro>("todas")
  const queryClient = useQueryClient()

  const { data: revisoes, isLoading } = useQuery({
    queryKey: ["revisoes"],
    queryFn: listarRevisoes,
  })

  const concluir = useMutation({
    mutationFn: concluirRevisao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revisoes"] })
    },
  })

  const revisoesFiltradas = revisoes?.filter((revisao) =>
    filtro === "todas" ? true : revisao.status === filtro,
  )

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Revisões</h1>

      <div className="flex gap-2">
        {FILTROS.map(({ valor, label }) => (
          <Button
            key={valor}
            variant={filtro === valor ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltro(valor)}
          >
            {label}
          </Button>
        ))}
      </div>

      {isLoading && <p className="text-muted-foreground">Carregando...</p>}

      {revisoesFiltradas?.length === 0 && (
        <p className="text-muted-foreground">Nenhuma revisão encontrada nesse filtro.</p>
      )}

      <div className="flex flex-col gap-3">
        {revisoesFiltradas?.map((revisao) => (
          <Card key={revisao.id}>
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