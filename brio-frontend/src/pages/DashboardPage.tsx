import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Flame, GraduationCap } from "lucide-react"

import { CardMetrica } from "@/components/shared/CardMetrica"
import { CartaoProva } from "@/components/shared/CartaoProva"
import { EstadoVazio } from "@/components/shared/EstadoVazio"
import { NumeroAnimado } from "@/components/shared/NumeroAnimado"
import { Carregando, SkeletonCards, SkeletonMetricas } from "@/components/shared/Skeletons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { obterDashboard } from "@/features/dashboard/api/dashboard-api"

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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">Seja bem-vindo!</h1>
          {data.sequencia_dias > 0 && (
            <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
              <Flame aria-hidden className="size-4 text-amber-500" />
              Sequência atual: {data.sequencia_dias} {data.sequencia_dias === 1 ? "dia" : "dias"}
            </p>
          )}
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button className="min-h-11 w-full sm:min-h-0 sm:w-auto" asChild>
            <Link to="/sessoes">Iniciar sessão de estudos</Link>
          </Button>
          <Button variant="outline" className="min-h-11 w-full sm:min-h-0 sm:w-auto" asChild>
            <Link to="/revisoes">
              Ver revisões
              {data.revisoes_pendentes_hoje > 0 && ` (${data.revisoes_pendentes_hoje})`}
            </Link>
          </Button>
        </div>
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
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            Matérias para estudar hoje
          </h2>
          <ul className="flex flex-wrap gap-2">
            {data.disciplinas_hoje.map((nome) => (
              <li
                key={nome}
                className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
              >
                {nome}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold">Minhas Provas ({data.provas_ativas})</h2>
          {data.provas.length > 0 && (
            <Link
              to="/provas"
              className="inline-flex min-h-10 items-center text-sm text-muted-foreground hover:text-foreground hover:underline sm:min-h-0"
            >
              Ver todas
            </Link>
          )}
        </div>

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
            <CartaoProva key={prova.id} prova={prova} />
          ))}
        </div>
      </section>
    </div>
  )
}
