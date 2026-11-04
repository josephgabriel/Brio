import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { GraduationCap, Plus } from "lucide-react"

import { EstadoVazio } from "@/components/shared/EstadoVazio"
import { Carregando, SkeletonCards } from "@/components/shared/Skeletons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listarProvas } from "@/features/provas/api/provas-api"

function variantePrioridade(
  prioridade: string,
): "prioridade_alta" | "prioridade_media" | "prioridade_baixa" {
  if (prioridade === "alta") return "prioridade_alta"
  if (prioridade === "media") return "prioridade_media"
  return "prioridade_baixa"
}

// O sistema guarda "media" e "ativa": aqui eles viram o texto que a pessoa lê.
// Se aparecer um valor novo, o texto cru é mostrado como reserva.
const ROTULO_PRIORIDADE: Record<string, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
}

const ROTULO_STATUS: Record<string, string> = {
  ativa: "Ativa",
  arquivada: "Arquivada",
  concluida: "Concluída",
}

function textoDiasRestantes(dias: number | null): string {
  if (dias === null) return "Data não definida"
  if (dias < 0) return "Prova já passou"
  if (dias === 0) return "A prova é hoje"
  return dias === 1 ? "Falta 1 dia" : `Faltam ${dias} dias`
}

export function ProvasPage() {
  const {
    data: provas,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["provas"],
    queryFn: listarProvas,
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold sm:text-2xl">Minhas Provas</h1>
        <Button className="min-h-10 sm:min-h-0" asChild>
          <Link to="/provas/nova">
            <Plus className="size-4" />
            Nova prova
          </Link>
        </Button>
      </div>

      {isLoading && (
        <Carregando>
          <SkeletonCards quantidade={6} />
        </Carregando>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <p className="text-destructive">Erro ao carregar as provas.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            Tentar de novo
          </Button>
        </div>
      )}

      {provas && provas.length === 0 && (
        <EstadoVazio
          icone={GraduationCap}
          titulo="Nenhuma prova por aqui ainda"
          descricao="Cadastre a prova que você está preparando. Depois, adicione as matérias e os conteúdos para acompanhar seu avanço."
          acao={{ rotulo: "Cadastrar minha primeira prova", para: "/provas/nova" }}
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {provas?.map((prova) => (
          <Link key={prova.id} to={`/provas/${prova.id}`} className="block">
            <Card className="h-full transition-colors hover:border-primary">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="min-w-0 flex-1 truncate text-base" title={prova.nome}>
                    {prova.nome}
                  </CardTitle>
                  <div className="flex shrink-0 gap-1.5">
                    <Badge variant={variantePrioridade(prova.prioridade)}>
                      {ROTULO_PRIORIDADE[prova.prioridade] ?? prova.prioridade}
                    </Badge>
                    <Badge variant={prova.status === "ativa" ? "default" : "secondary"}>
                      {ROTULO_STATUS[prova.status] ?? prova.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {textoDiasRestantes(prova.dias_restantes)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}