import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  criarAssinatura,
  obterMinhaAssinatura,
  solicitarReembolso,
} from "@/features/assinatura/api/assinatura-api"
import { assinaturaEstaValida } from "@/features/assinatura/regras"
import type { Plano } from "@/features/assinatura/types"

const PLANOS: { valor: Plano; nome: string; preco: string; detalhe: string }[] = [
  { valor: "mensal", nome: "Mensal", preco: "R$ 9,90", detalhe: "por mês" },
  { valor: "anual", nome: "Anual", preco: "R$ 99,00", detalhe: "por ano (economize 2 meses)" },
]

export function PlanosPage() {
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
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-400">
        <p>Carregando...</p>
      </div>
    )
  }

  if (assinaturaEstaValida(assinatura) && assinatura) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-black px-4 text-zinc-100">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sua assinatura está ativa</h1>
          <p className="text-zinc-400">
            Plano {assinatura.plano === "mensal" ? "Mensal" : "Anual"}, válido até{" "}
            {assinatura.data_expiracao &&
              new Date(`${assinatura.data_expiracao}T00:00:00`).toLocaleDateString("pt-BR")}
            .
          </p>

          <Button
            variant="outline"
            onClick={() => reembolsar.mutate()}
            disabled={reembolsar.isPending}
            className="border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white"
          >
            {reembolsar.isPending ? "Processando..." : "Solicitar reembolso (garantia de 7 dias)"}
          </Button>
          {reembolsar.isError && (
            <p className="text-sm text-red-400">{reembolsar.error.message}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    /* ALTERAÇÃO 1: Fundo principal bem escuro (bg-black ou bg-zinc-950) */
    <div className="flex min-h-screen w-full items-center justify-center bg-black px-4 py-12 text-zinc-100">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-8 text-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Escolha seu plano</h1>
          <p className="mt-2 text-zinc-400">
            {assinatura?.status === "cancelada" || assinatura?.status === "expirada"
              ? "Sua assinatura não está mais ativa. Renove para continuar usando o Brio."
              : "Assine para começar a usar o Brio."}
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          {PLANOS.map((plano) => (
            /* ALTERAÇÃO 2: Cor mantida do Card (bg-zinc-900 e borda border-zinc-800) */
            <Card 
              key={plano.valor} 
              className="border-zinc-800 bg-zinc-900 text-zinc-100 shadow-xl"
            >
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">{plano.nome}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div>
                  <span className="text-4xl font-extrabold text-white">{plano.preco}</span>
                  <span className="text-sm text-zinc-400"> {plano.detalhe}</span>
                </div>
                <ul className="flex flex-col gap-2.5 text-left text-sm text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-emerald-400" /> Provas, matérias e conteúdos ilimitados
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-emerald-400" /> Sessões com Pomodoro e anotações
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-emerald-400" /> Revisão espaçada automática
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-emerald-400" /> Dashboard e estatísticas completas
                  </li>
                </ul>
                <Button 
                  onClick={() => assinar.mutate(plano.valor)} 
                  disabled={assinar.isPending}
                  className="w-full bg-white font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors"
                >
                  {assinar.isPending ? "Redirecionando..." : `Assinar ${plano.nome}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {assinar.isError && <p className="text-sm text-red-400">{assinar.error.message}</p>}

        <p className="text-xs text-zinc-500">
          Garantia de reembolso total em até 7 dias após a contratação.
        </p>
      </div>
    </div>
  )
}