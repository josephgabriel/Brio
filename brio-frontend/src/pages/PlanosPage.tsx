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
    return <p className="p-8 text-muted-foreground">Carregando...</p>
  }

  if (assinaturaEstaValida(assinatura) && assinatura) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-semibold">Sua assinatura está ativa</h1>
        <p className="text-muted-foreground">
          Plano {assinatura.plano === "mensal" ? "Mensal" : "Anual"}, válido até{" "}
          {assinatura.data_expiracao &&
            new Date(`${assinatura.data_expiracao}T00:00:00`).toLocaleDateString("pt-BR")}
          .
        </p>

        <Button
          variant="outline"
          onClick={() => reembolsar.mutate()}
          disabled={reembolsar.isPending}
        >
          {reembolsar.isPending ? "Processando..." : "Solicitar reembolso (garantia de 7 dias)"}
        </Button>
        {reembolsar.isError && (
          <p className="text-sm text-destructive">{reembolsar.error.message}</p>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Escolha seu plano</h1>
        <p className="text-muted-foreground">
          {assinatura?.status === "cancelada" || assinatura?.status === "expirada"
            ? "Sua assinatura não está mais ativa. Renove para continuar usando o Brio."
            : "Assine para começar a usar o Brio."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {PLANOS.map((plano) => (
          <Card key={plano.valor}>
            <CardHeader>
              <CardTitle>{plano.nome}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <span className="text-3xl font-semibold">{plano.preco}</span>
                <span className="text-muted-foreground"> {plano.detalhe}</span>
              </div>
              <ul className="flex flex-col gap-1 text-left text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-primary" /> Provas, matérias e conteúdos
                  ilimitados
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-primary" /> Sessões com Pomodoro e anotações
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-primary" /> Revisão espaçada automática
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-primary" /> Dashboard e estatísticas completas
                </li>
              </ul>
              <Button onClick={() => assinar.mutate(plano.valor)} disabled={assinar.isPending}>
                {assinar.isPending ? "Redirecionando..." : `Assinar ${plano.nome}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {assinar.isError && <p className="text-sm text-destructive">{assinar.error.message}</p>}

      <p className="text-xs text-muted-foreground">
        Garantia de reembolso total em até 7 dias após a contratação.
      </p>
    </div>
  )
}