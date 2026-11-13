import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Receipt } from "lucide-react"

import { EstadoVazio } from "@/components/shared/EstadoVazio"
import { Carregando, SkeletonLista } from "@/components/shared/Skeletons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  cancelarAssinatura,
  obterHistoricoPagamentos,
  obterMinhaAssinatura,
  solicitarReembolso,
} from "@/features/assinatura/api/assinatura-api"
import { useConfirmar } from "@/features/confirmacao/confirmacao-context"
import { notificar } from "@/lib/toast"

const NOME_PLANO: Record<string, string> = { mensal: "Mensal", anual: "Anual" }
const NOME_STATUS: Record<string, string> = {
  pendente: "Pendente",
  ativa: "Ativa",
  cancelada: "Cancelada",
  expirada: "Expirada",
}

const DIAS_REEMBOLSO = 7

function formatarData(data: string | null): string {
  if (!data) return "—"
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR")
}

function dentroDoPrazoReembolso(dataInicio: string | null): boolean {
  if (!dataInicio) return false
  const dias = Math.floor(
    (Date.now() - new Date(`${dataInicio}T00:00:00`).getTime()) / (1000 * 60 * 60 * 24),
  )
  return dias <= DIAS_REEMBOLSO
}

// Último dia em que o reembolso ainda vale (mesma regra de dentroDoPrazoReembolso)
function ultimoDiaReembolso(dataInicio: string | null): string {
  if (!dataInicio) return "—"
  const data = new Date(`${dataInicio}T00:00:00`)
  data.setDate(data.getDate() + DIAS_REEMBOLSO)
  return data.toLocaleDateString("pt-BR")
}

export function MinhaAssinaturaPage() {
  const queryClient = useQueryClient()
  const confirmar = useConfirmar()

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assinatura"] })
      notificar.sucesso("Renovação automática cancelada com sucesso!")
    },
    onError: (erro) => notificar.erro(erro),
  })

  const reembolsar = useMutation({
    mutationFn: solicitarReembolso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assinatura"] })
      queryClient.invalidateQueries({ queryKey: ["pagamentos"] })
      notificar.sucesso("Reembolso solicitado. O valor voltará ao seu cartão em alguns dias")
    },
    onError: (erro) => notificar.erro(erro),
  })

  if (isLoading) {
    return (
      <Carregando>
        <SkeletonLista quantidade={6} />
      </Carregando>
    )
  }

  const ativa = assinatura?.status === "ativa"
  const podeReembolsar = ativa && dentroDoPrazoReembolso(assinatura?.data_inicio ?? null)

  async function handleCancelarRenovacao() {
    const confirmado = await confirmar({
      titulo: "Cancelar a renovação automática?",
      descricao: `Você continua com acesso até ${formatarData(assinatura?.data_expiracao ?? null)} e não será cobrado novamente.`,
      textoConfirmar: "Cancelar renovação",
      textoCancelar: "Manter renovação",
    })
    if (confirmado) cancelar.mutate()
  }

  async function handleReembolsar() {
    const confirmado = await confirmar({
      titulo: "Solicitar reembolso?",
      descricao: "O valor será devolvido e seu acesso ao Brio será encerrado imediatamente.",
      textoConfirmar: "Solicitar reembolso",
      destrutivo: true,
    })
    if (confirmado) reembolsar.mutate()
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <h1 className="text-xl font-semibold sm:text-2xl">Minha Assinatura</h1>

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
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg">Plano {NOME_PLANO[assinatura.plano]}</CardTitle>
              <Badge variant={ativa ? "default" : "secondary"}>
                {NOME_STATUS[assinatura.status]}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Início</dt>
                <dd className="mt-0.5 font-medium">{formatarData(assinatura.data_inicio)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {assinatura.renovacao_automatica ? "Próxima cobrança" : "Acesso até"}
                </dt>
                <dd className="mt-0.5 font-medium">{formatarData(assinatura.data_expiracao)}</dd>
              </div>
            </dl>

            {ativa && !assinatura.renovacao_automatica && (
              <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                Sua renovação automática está desativada. Você continua com acesso até{" "}
                {formatarData(assinatura.data_expiracao)}, sem nenhuma cobrança futura.
              </p>
            )}

            {ativa && (assinatura.renovacao_automatica || podeReembolsar) && (
              <div className="flex flex-col gap-3 border-t border-border pt-5">
                <div className="flex flex-wrap gap-2">
                  {assinatura.renovacao_automatica && (
                    <Button
                      variant="outline"
                      onClick={handleCancelarRenovacao}
                      disabled={cancelar.isPending}
                    >
                      {cancelar.isPending ? "Cancelando..." : "Cancelar renovação automática"}
                    </Button>
                  )}
                  {podeReembolsar && (
                    <Button
                      variant="outline"
                      onClick={handleReembolsar}
                      disabled={reembolsar.isPending}
                    >
                      {reembolsar.isPending ? "Processando..." : "Solicitar reembolso (7 dias)"}
                    </Button>
                  )}
                </div>

                {podeReembolsar && (
                  <p className="text-xs text-muted-foreground">
                    Reembolso disponível até {ultimoDiaReembolso(assinatura.data_inicio)}. Ao
                    pedir, seu acesso ao Brio é encerrado na hora.
                  </p>
                )}
              </div>
            )}

            {!ativa && (
              <Button className="w-full sm:w-fit" asChild>
                <Link to="/planos">Assinar novamente</Link>
              </Button>
            )}

            {(cancelar.isError || reembolsar.isError) && (
              <p role="alert" className="text-sm text-destructive">
                {(cancelar.error ?? reembolsar.error)?.message}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Histórico de pagamentos</h2>

        {pagamentos?.length === 0 && (
          <EstadoVazio
            compacto
            className="col-span-full"
            icone={Receipt}
            titulo="Nenhum pagamento registrado"
          />
        )}

        {pagamentos && pagamentos.length > 0 && (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {pagamentos.map((pagamento, indice) => (
              <li
                key={indice}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <span className="text-muted-foreground">
                  {formatarData(pagamento.criado_em.slice(0, 10))}
                </span>
                <span className="font-medium tabular-nums">
                  R$ {pagamento.valor.toFixed(2).replace(".", ",")}
                </span>
                <Badge variant="secondary" className="capitalize">
                  {pagamento.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
