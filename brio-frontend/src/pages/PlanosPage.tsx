import { Link } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import { CheckCircle2, Check, Loader2 } from "lucide-react"

import logo3 from "@/assets/logo3.png"
import { CartaoPlano } from "@/components/shared/CartaoPlano"
import { SeloConfianca } from "@/components/shared/SeloConfianca"
import { TelaStatus } from "@/components/shared/TelaStatus"
import { Button } from "@/components/ui/button"
import { criarAssinatura, obterMinhaAssinatura } from "@/features/assinatura/api/assinatura-api"
import { BENEFICIOS_PLANO } from "@/features/assinatura/beneficios"
import {
  EQUIVALENTE_MENSAL_ANUAL,
  PERCENTUAL_ECONOMIA,
  PRECOS,
  formatarReais,
} from "@/features/assinatura/precos"
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
  selo?: string
  destaque?: boolean
}

const PLANOS: PlanoInfo[] = [
  {
    valor: "mensal",
    nome: "Mensal",
    preco: formatarReais(PRECOS.mensal),
    periodo: "/mês",
  },
  {
    valor: "anual",
    nome: "Anual",
    preco: formatarReais(PRECOS.anual),
    periodo: "/ano",
    observacao: `Equivale a ${formatarReais(EQUIVALENTE_MENSAL_ANUAL)}/mês, economia de ${PERCENTUAL_ECONOMIA}%`,
    selo: "Mais vantajoso",
    destaque: true,
  },
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
    return <TelaStatus icone={Loader2} girando titulo="Carregando planos..." />
  }

  if (assinaturaEstaValida(assinatura) && assinatura) {
    return (
      <TelaStatus
        cartao
        icone={CheckCircle2}
        tom="sucesso"
        titulo="Sua assinatura está ativa"
        texto={
          <>
            Plano {assinatura.plano === "mensal" ? "Mensal" : "Anual"}, válido até{" "}
            <span className="font-medium text-foreground">
              {assinatura.data_expiracao &&
                new Date(`${assinatura.data_expiracao}T00:00:00`).toLocaleDateString("pt-BR")}
            </span>
            .
          </>
        }
      >
        <div className="flex w-full flex-col gap-3">
          <Button className="h-11 w-full" asChild>
            <Link to="/dashboard">Ir para o Dashboard</Link>
          </Button>
          <Button variant="outline" className="h-11 w-full" asChild>
            <Link to="/conta">Gerenciar minha assinatura</Link>
          </Button>
        </div>
      </TelaStatus>
    )
  }

  const assinaturaEncerrada = assinatura?.status === "cancelada" || assinatura?.status === "expirada"

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background"
      />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-6 sm:py-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo3} alt="" className="h-7 w-auto" />
            <span className="text-lg font-semibold">Brio</span>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex min-h-10 cursor-pointer items-center text-sm text-muted-foreground underline hover:text-foreground"
          >
            Sair da conta
          </button>
        </header>

        <div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Escolha seu plano
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
            {assinaturaEncerrada
              ? "Sua assinatura não está mais ativa. Renove para continuar seus estudos no Brio."
              : "Assine para desbloquear todas as ferramentas de estudo da plataforma Brio."}
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          {PLANOS.map((plano) => {
            const esteEstaSendoContratado = assinar.isPending && assinar.variables === plano.valor

            return (
              <CartaoPlano
                key={plano.valor}
                nome={plano.nome}
                preco={plano.preco}
                periodo={plano.periodo}
                observacao={plano.observacao}
                selo={plano.selo}
                destaque={plano.destaque}
              >
                <Button
                  onClick={() => assinar.mutate(plano.valor)}
                  disabled={assinar.isPending}
                  className="h-12 w-full text-base font-semibold sm:h-11"
                  variant={plano.destaque ? "default" : "outline"}
                >
                  {esteEstaSendoContratado ? "Redirecionando..." : `Assinar ${plano.nome}`}
                </Button>
              </CartaoPlano>
            )
          })}
        </div>

        <div>
          <h2 className="font-medium">Os dois planos incluem</h2>
          <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 text-sm text-muted-foreground sm:grid-cols-2">
            {BENEFICIOS_PLANO.map((beneficio) => (
              <li key={beneficio} className="flex items-start gap-2.5">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                {beneficio}
              </li>
            ))}
          </ul>
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
      </div>
    </div>
  )
}
