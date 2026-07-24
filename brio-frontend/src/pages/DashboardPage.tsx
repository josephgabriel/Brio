import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CardMetrica } from "@/components/shared/CardMetrica"
import { obterDashboard } from "@/features/dashboard/api/dashboard-api"

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: obterDashboard,
  })

  if (isLoading) {
    return <p className="text-muted-foreground">Carregando...</p>
  }

  if (isError || !data) {
    return <p className="text-destructive">Não foi possível carregar o dashboard.</p>
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Olá</h1>
        {data.sequencia_dias > 0 && (
          <p className="text-muted-foreground">
             Sequência atual: {data.sequencia_dias}{" "}
            {data.sequencia_dias === 1 ? "dia" : "dias"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <CardMetrica label="Hoje" valor={`${data.horas_hoje}h`} />
        <CardMetrica label="Semana" valor={`${data.horas_semana}h`} />
        <CardMetrica label="Mês" valor={`${data.horas_mes}h`} />
        <CardMetrica
          label="Revisões hoje"
          valor={String(data.revisoes_pendentes_hoje)}
          destaque={data.revisoes_pendentes_hoje > 0}
        />
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link to="/sessoes">Iniciar sessão de estudos</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/revisoes">Ver revisões</Link>
        </Button>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">
          Minhas Provas ({data.provas_ativas})
        </h2>

        {data.provas.length === 0 && (
          <p className="text-muted-foreground">
            Nenhuma prova ativa.{" "}
            <Link to="/provas/nova" className="text-primary hover:underline">
              Cadastre uma
            </Link>
            .
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.provas.map((prova) => (
            <Link key={prova.id} to={`/provas/${prova.id}`}>
              <Card className="transition-colors hover:border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{prova.nome}</CardTitle>
                    <Badge variant="secondary">{prova.tipo}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {prova.dias_restantes >= 0
                      ? `${prova.dias_restantes} dias restantes`
                      : "Prova já passou"}
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