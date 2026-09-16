import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  cancelarAssinatura,
  obterHistoricoPagamentos,
  obterMinhaAssinatura,
  solicitarReembolso,
} from "@/features/assinatura/api/assinatura-api"

const NOME_PLANO: Record<string, string> = { mensal: "Mensal", anual: "Anual" }
const NOME_STATUS: Record<string, string> = {
  pendente: "Pendente",
  ativa: "Ativa",
  cancelada: "Cancelada",
  expirada: "Expirada",
}

function formatarData(data: string | null): string {
  if (!data) return "—"
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR")
}

function dentroDoPrazoReembolso(dataInicio: string | null): boolean {
  if (!dataInicio) return false
  const dias = Math.floor(
    (Date.now() - new Date(`${dataInicio}T00:00:00`).getTime()) / (1000 * 60 * 60 * 24),
  )
  return dias <= 7
}

export function MinhaAssinaturaPage() {
  const queryClient = useQueryClient()

  const { data: assinatura, isLoading } = useQuery({
    queryKey: ["assinatura"],
    queryFn: obterMinhaAssinatura,
  })

  const { data: pagamentos } = useQuery({
    queryKey: ["pagamentos"],
    queryFn: obterHistoricoPagamentos,
  })

  const cancelar = useMutation({
    mutationFn: cancelarAssinatura,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assinatura"] }),
  })

  const reembolsar = useMutation({
    mutationFn: solicitarReembolso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assinatura"] })
      queryClient.invalidateQueries({ queryKey: ["pagamentos"] })
    },
  })

  if (isLoading) {
    return <p className="text-muted-foreground">Carregando...</p>
  }

  const ativa = assinatura?.status === "ativa"
  const podeReembolsar = ativa && dentroDoPrazoReembolso(assinatura?.data_inicio ?? null)

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Minha Assinatura</h1>

      {!assinatura || assinatura.status === "pendente" ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <p className="text-muted-foreground">Você ainda não tem uma assinatura ativa.</p>
            <Button asChild>
              <Link to="/planos">Ver planos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Plano {NOME_PLANO[assinatura.plano]}</CardTitle>
              <Badge variant={ativa ? "default" : "secondary"}>
                {NOME_STATUS[assinatura.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Início</p>
                <p>{formatarData(assinatura.data_inicio)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  {assinatura.renovacao_automatica ? "Próxima cobrança" : "Acesso até"}
                </p>
                <p>{formatarData(assinatura.data_expiracao)}</p>
              </div>
            </div>

            {ativa && !assinatura.renovacao_automatica && (
              <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                Sua renovação automática está desativada. Você continua com acesso até{" "}
                {formatarData(assinatura.data_expiracao)}, sem nenhuma cobrança futura.
              </p>
            )}

            {ativa && (
              <div className="flex flex-wrap gap-2">
                {assinatura.renovacao_automatica && (
                  <Button
                    variant="outline"
                    onClick={() => cancelar.mutate()}
                    disabled={cancelar.isPending}
                  >
                    {cancelar.isPending ? "Cancelando..." : "Cancelar renovação automática"}
                  </Button>
                )}
                {podeReembolsar && (
                  <Button
                    variant="outline"
                    onClick={() => reembolsar.mutate()}
                    disabled={reembolsar.isPending}
                  >
                    {reembolsar.isPending ? "Processando..." : "Solicitar reembolso (7 dias)"}
                  </Button>
                )}
              </div>
            )}

            {!ativa && (
              <Button asChild>
                <Link to="/planos">Assinar novamente</Link>
              </Button>
            )}

            {(cancelar.isError || reembolsar.isError) && (
              <p className="text-sm text-destructive">
                {(cancelar.error ?? reembolsar.error)?.message}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold">Histórico de pagamentos</h2>
        {pagamentos?.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum pagamento registrado ainda.</p>
        )}
        <div className="flex flex-col gap-2">
          {pagamentos?.map((pagamento, indice) => (
            <div
              key={indice}
              className="flex items-center justify-between rounded-md border border-border p-3 text-sm"
            >
              <span>{formatarData(pagamento.criado_em.slice(0, 10))}</span>
              <span className="font-medium">
                R$ {pagamento.valor.toFixed(2).replace(".", ",")}
              </span>
              <Badge variant="secondary">{pagamento.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}