import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useForceDarkMode } from "@/hooks/useForceDarkMode"
import {
  criarAssinatura,
  obterMinhaAssinatura,
  solicitarReembolso,
} from "@/features/assinatura/api/assinatura-api"
import { assinaturaEstaValida } from "@/features/assinatura/regras"
import type { Plano } from "@/features/assinatura/types"

const PLANOS: {
  valor: Plano
  nome: string
  preco: string
  detalhe: string
  destaque?: boolean
}[] = [
  {
    valor: "mensal",
    nome: "Mensal",
    preco: "R$ 9,90",
    detalhe: "por mês",
  },
  {
    valor: "anual",
    nome: "Anual",
    preco: "R$ 99,00",
    detalhe: "anual (economize 2 meses!)",
    destaque: true,
  },
]

export function PlanosPage() {
  useForceDarkMode()
  const queryClient = useQueryClient()

  const { data: assinatura, isLoading } = useQuery({
    queryKey: ["assinatura"],
    queryFn: obterMinhaAssinatura,
  })

  const assinar = useMutation({
    mutationFn: (plano: Plano) => criarAssinatura(plano),
    onSuccess: (checkoutUrl) => {
      window.location.href = checkoutUrl
    },
  })

  const reembolsar = useMutation({
    mutationFn: solicitarReembolso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assinatura"] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <p className="animate-pulse">Carregando planos...</p>
      </div>
    )
  }

  if (assinaturaEstaValida(assinatura) && assinatura) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center bg-background px-4 text-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />

        <div className="relative z-10 mx-auto flex max-w-md animate-[slideDown_0.6s_ease-out] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-8 shadow-xl text-center">
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

          <Button
            variant="outline"
            onClick={() => reembolsar.mutate()}
            disabled={reembolsar.isPending}
            className="mt-2 w-full border-border bg-background hover:bg-accent"
          >
            {reembolsar.isPending ? "Processando..." : "Solicitar reembolso (garantia de 7 dias)"}
          </Button>

          {reembolsar.isError && (
            <p className="text-sm text-destructive">{reembolsar.error.message}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background px-4 py-12 text-foreground overflow-hidden">
     
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background pointer-events-none" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center gap-8 text-center">
        
        <div className="animate-[slideDown_0.6s_ease-out_both]">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Escolha seu plano
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg max-w-xl mx-auto">
            {assinatura?.status === "cancelada" || assinatura?.status === "expirada"
              ? "Sua assinatura não está mais ativa. Renove para continuar seus estudos no Brio."
              : "Assine para desbloquear todas as ferramentas de estudo da plataforma Brio."}
          </p>
        </div>

        {/* Grid dos Cards com animação cascata vindo de cima */}
        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          {PLANOS.map((plano, index) => (
            <Card
              key={plano.valor}
              style={{ animationDelay: `${(index + 1) * 150}ms` }}
              className={`relative flex flex-col justify-between border-border bg-card p-2 text-card-foreground shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl animate-[slideDown_0.6s_ease-out_both] ${
                plano.destaque ? "border-primary/60 ring-1 ring-primary/40" : ""
              }`}
            >
              {plano.destaque && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground shadow flex items-center gap-1">
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
                    / {plano.detalhe}
                  </span>
                </div>

                <ul className="flex flex-col gap-3 text-left text-sm text-muted-foreground">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-emerald-500 font-bold" /> Provas, matérias e conteúdos ilimitados
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-emerald-500 font-bold" /> Sessões com Pomodoro e anotações
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-emerald-500 font-bold" /> Revisão espaçada automática
                  </li>
                    <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-emerald-500 font-bold" /> Calendário personalizado
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-emerald-500 font-bold" /> Cronograma de estudos
                  </li>
                    <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-emerald-500 font-bold" /> Dashboard e estatísticas completas
                  </li>
                </ul>

                <Button
                  onClick={() => assinar.mutate(plano.valor)}
                  disabled={assinar.isPending}
                  className="mt-2 h-11 w-full text-base font-semibold transition-all"
                  variant={plano.destaque ? "default" : "outline"}
                >
                  {assinar.isPending ? "Redirecionando..." : `Assinar ${plano.nome}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {assinar.isError && (
          <p className="text-sm text-destructive font-medium">
            {assinar.error.message}
          </p>
        )}

        <p className="text-xs text-muted-foreground animate-[slideDown_0.6s_ease-out_both_600ms]">
          Garantia de reembolso total em até 7 dias.
        </p>
      </div>

      {/* Animação slideDown idêntica ao padrão da aplicação */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}