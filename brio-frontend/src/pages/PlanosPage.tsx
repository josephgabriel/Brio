import { Link } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Check, Sparkles } from "lucide-react"

import { SeloConfianca } from "@/components/shared/SeloConfianca"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { criarAssinatura, obterMinhaAssinatura } from "@/features/assinatura/api/assinatura-api"
import { assinaturaEstaValida } from "@/features/assinatura/regras"
import type { Plano } from "@/features/assinatura/types"
import { useAuth } from "@/features/auth/auth-context"
import { useForceDarkMode } from "@/hooks/useForceDarkMode"
import { notificar } from "@/lib/toast"

interface PlanoInfo {
  valor: Plano
  nome: string
  preco: string
  periodo: string
  observacao?: string
  destaque?: boolean
}

const PLANOS: PlanoInfo[] = [
  {
    valor: "mensal",
    nome: "Mensal",
    preco: "R$ 9,90",
    periodo: "/mês",
  },
  {
    valor: "anual",
    nome: "Anual",
    preco: "R$ 99,00",
    periodo: "/ano",
    observacao: "Economize 2 meses em relação ao mensal",
    destaque: true,
  },
]

const BENEFICIOS = [
  "Provas, matérias e conteúdos ilimitados",
  "Sessões com Pomodoro e anotações",
  "Revisão espaçada automática",
  "Calendário personalizado",
  "Cronograma de estudos",
  "Dashboard e estatísticas completas",
  "Gerador de Questões com IA (BrioIA)",
  "Resumos de PDF com IA (BrioIA)",
]

export function PlanosPage() {
  useForceDarkMode()
  const { logout } = useAuth()

  const { data: assinatura, isLoading } = useQuery({
    queryKey: ["assinatura"],
    queryFn: obterMinhaAssinatura,
  })

  const assinar = useMutation({
    mutationFn: (plano: Plano) => criarAssinatura(plano),
    onSuccess: (checkoutUrl) => {
      window.location.href = checkoutUrl
    },
    onError: (erro) => notificar.erro(erro),
  })

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-muted-foreground">
        <p className="animate-pulse">Carregando planos...</p>
      </div>
    )
  }

  if (assinaturaEstaValida(assinatura) && assinatura) {
    return (
      <div className="relative flex min-h-dvh w-full items-center justify-center bg-background px-4 text-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />

        <div className="relative z-10 mx-auto flex w-full max-w-md animate-[slideDown_0.6s_ease-out] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-xl motion-reduce:animate-none sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Sua assinatura está ativa
          </h1>
          <p className="text-sm text-muted-foreground">
            Plano {assinatura.plano === "mensal" ? "Mensal" : "Anual"}, válido até{" "}
            <span className="font-medium text-foreground">
              {assinatura.data_expiracao &&
                new Date(`${assinatura.data_expiracao}T00:00:00`).toLocaleDateString("pt-BR")}
            </span>
            .
          </p>

          <div className="mt-2 flex w-full flex-col gap-3">
            <Button className="h-11 w-full" asChild>
              <Link to="/dashboard">Ir para o Dashboard</Link>
            </Button>
            <Button variant="outline" className="h-11 w-full" asChild>
              <Link to="/conta">Gerenciar minha assinatura</Link>
            </Button>
          </div>
        </div>

        <style>{`
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-50px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground sm:py-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-8 text-center">
        <div className="animate-[slideDown_0.6s_ease-out_both] motion-reduce:animate-none">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Escolha seu plano
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
            {assinatura?.status === "cancelada" || assinatura?.status === "expirada"
              ? "Sua assinatura não está mais ativa. Renove para continuar seus estudos no Brio."
              : "Assine para desbloquear todas as ferramentas de estudo da plataforma Brio."}
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          {PLANOS.map((plano, index) => {
            const esteEstaSendoContratado = assinar.isPending && assinar.variables === plano.valor

            return (
              <Card
                key={plano.valor}
                style={{ animationDelay: `${(index + 1) * 150}ms` }}
                className={`relative flex animate-[slideDown_0.6s_ease-out_both] flex-col justify-between border-border bg-card p-2 text-card-foreground shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl motion-reduce:animate-none ${
                  plano.destaque ? "border-primary/60 ring-1 ring-primary/40" : ""
                }`}
              >
                {plano.destaque && (
                  <div className="absolute left-1/2 top-2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground shadow">
                    <Sparkles className="h-3 w-3" /> Mais vantajoso
                  </div>
                )}

                <CardHeader className="pt-6">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {plano.nome}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col gap-6">
                  <div>
                    <span className="text-4xl font-black tracking-tight text-primary">
                      {plano.preco}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {" "}
                      {plano.periodo}
                    </span>
                    {plano.observacao && (
                      <p className="mt-1 text-xs font-medium text-emerald-500">
                        {plano.observacao}
                      </p>
                    )}
                  </div>

                  <ul className="flex flex-col gap-3 text-left text-sm text-muted-foreground">
                    {BENEFICIOS.map((beneficio) => (
                      <li key={beneficio} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        {beneficio}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => assinar.mutate(plano.valor)}
                    disabled={assinar.isPending}
                    className="mt-2 h-12 w-full text-base font-semibold transition-all sm:h-11"
                    variant={plano.destaque ? "default" : "outline"}
                  >
                    {esteEstaSendoContratado ? "Redirecionando..." : `Assinar ${plano.nome}`}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <SeloConfianca className="w-full" />

        <p className="text-xs text-muted-foreground">
          Ao assinar, você concorda com os{" "}
          <a
            href="/termos"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Termos de Uso
          </a>{" "}
          e a{" "}
          <a
            href="/privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Política de Privacidade
          </a>
          .
        </p>

        <button
          type="button"
          onClick={logout}
          className="inline-flex min-h-10 cursor-pointer items-center text-sm text-muted-foreground underline hover:text-foreground"
        >
          Sair da conta
        </button>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-50px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}