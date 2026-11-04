import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { GraduationCap } from "lucide-react"

import { CardMetrica } from "@/components/shared/CardMetrica"
import { EstadoVazio } from "@/components/shared/EstadoVazio"
import { NumeroAnimado } from "@/components/shared/NumeroAnimado"
import { Carregando, SkeletonCards, SkeletonMetricas } from "@/components/shared/Skeletons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { obterDashboard } from "@/features/dashboard/api/dashboard-api"

function variantePrioridade(
  prioridade: string,
): "prioridade_alta" | "prioridade_media" | "prioridade_baixa" {
  if (prioridade === "alta") return "prioridade_alta"
  if (prioridade === "media") return "prioridade_media"
  return "prioridade_baixa"
}

function textoDiasRestantes(dias: number | null): string {
  if (dias === null) return "Data não definida"
  if (dias < 0) return "Prova já passou"
  if (dias === 0) return "A prova é hoje"
  return dias === 1 ? "Falta 1 dia" : `Faltam ${dias} dias`
}

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: obterDashboard,
  })

  if (isLoading) {
    return (
      <Carregando>
        <div className="flex flex-col gap-8">
          <div>
            <Skeleton className="mb-2 h-8 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <SkeletonMetricas />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-11 w-full sm:h-9 sm:w-48" />
            <Skeleton className="h-11 w-full sm:h-9 sm:w-32" />
          </div>
          <div>
            <Skeleton className="mb-4 h-6 w-40" />
            <SkeletonCards />
          </div>
        </div>
      </Carregando>
    )
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
        <p className="text-destructive">Não foi possível carregar o dashboard.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          Tentar de novo
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">Seja bem-vindo!</h1>
        {data.sequencia_dias > 0 && (
          <p className="text-muted-foreground">
            Sequência atual: {data.sequencia_dias} {data.sequencia_dias === 1 ? "dia" : "dias"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <CardMetrica
          label="Hoje"
          valor={<NumeroAnimado valor={data.horas_hoje} casas={1} sufixo="h" />}
        />
        <CardMetrica
          label="Semana"
          valor={<NumeroAnimado valor={data.horas_semana} casas={1} sufixo="h" />}
        />
        <CardMetrica
          label="Mês"
          valor={<NumeroAnimado valor={data.horas_mes} casas={1} sufixo="h" />}
        />
        <CardMetrica
          label="Revisões hoje"
          valor={<NumeroAnimado valor={data.revisoes_pendentes_hoje} />}
          destaque={data.revisoes_pendentes_hoje > 0}
        />
      </div>

      {data.disciplinas_hoje.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            MATÉRIAS PARA ESTUDAR HOJE:
          </p>
          <div className="flex flex-wrap gap-2">
            {data.disciplinas_hoje.map((nome) => (
              <span
                key={nome}
                className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
              >
                {nome}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="min-h-11 w-full sm:min-h-0 sm:w-auto" asChild>
          <Link to="/sessoes">Iniciar sessão de estudos</Link>
        </Button>
        <Button variant="outline" className="min-h-11 w-full sm:min-h-0 sm:w-auto" asChild>
          <Link to="/revisoes">Ver revisões</Link>
        </Button>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Minhas Provas ({data.provas_ativas})</h2>

        {data.provas.length === 0 && (
          <EstadoVazio
            icone={GraduationCap}
            titulo="Nenhuma prova ativa"
            descricao="Cadastre uma prova para começar a organizar seus estudos e ver suas estatísticas aqui."
            acao={{ rotulo: "Cadastrar prova", para: "/provas/nova" }}
          />
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.provas.map((prova) => (
            <Link key={prova.id} to={`/provas/${prova.id}`} className="block">
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="min-w-0 flex-1 truncate text-base" title={prova.nome}>
                      {prova.nome}
                    </CardTitle>
                    <div className="flex shrink-0 gap-1.5">
                      <Badge variant={variantePrioridade(prova.prioridade)}>
                        {prova.prioridade}
                      </Badge>
                      <Badge variant={prova.status === "ativa" ? "default" : "secondary"}>
                        {prova.status}
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
    </div>
  )
}