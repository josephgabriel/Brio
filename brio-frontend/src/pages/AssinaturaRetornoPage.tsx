import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { obterMinhaAssinatura } from "@/features/assinatura/api/assinatura-api"
import { assinaturaEstaValida } from "@/features/assinatura/regras"

const MAX_TENTATIVAS = 10
const INTERVALO_MS = 2000

export function AssinaturaRetornoPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tentativas, setTentativas] = useState(0)
  const [confirmado, setConfirmado] = useState(false)

  useEffect(() => {
    if (confirmado || tentativas >= MAX_TENTATIVAS) return

    const timeout = setTimeout(async () => {
      const assinatura = await obterMinhaAssinatura().catch(() => null)
      if (assinaturaEstaValida(assinatura)) {
        setConfirmado(true)
        queryClient.invalidateQueries({ queryKey: ["assinatura"] })
        navigate("/dashboard")
      } else {
        setTentativas((atual) => atual + 1)
      }
    }, INTERVALO_MS)

    return () => clearTimeout(timeout)
  }, [tentativas, confirmado, navigate, queryClient])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      {tentativas < MAX_TENTATIVAS ? (
        <>
          <p className="text-muted-foreground">Confirmando seu pagamento...</p>
          <p className="text-xs text-muted-foreground">Isso pode levar alguns segundos.</p>
        </>
      ) : (
        <>
          <p className="text-muted-foreground">
            Ainda estamos processando seu pagamento. Isso pode levar mais alguns minutos.
          </p>
          <Button variant="outline" onClick={() => setTentativas(0)}>
            Verificar novamente
          </Button>
        </>
      )}
    </div>
  )
}