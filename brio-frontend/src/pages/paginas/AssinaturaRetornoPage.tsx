import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { Clock, Loader2 } from "lucide-react"

import { TelaStatus } from "@/components/shared/TelaStatus"
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

  if (tentativas < MAX_TENTATIVAS) {
    return (
      <TelaStatus
        icone={Loader2}
        girando
        titulo="Confirmando seu pagamento..."
        texto="Isso pode levar alguns segundos. Pode deixar esta página aberta."
      />
    )
  }

  return (
    <TelaStatus
      icone={Clock}
      titulo="Ainda estamos processando seu pagamento"
      texto="Isso pode levar mais alguns minutos. Se você já pagou, seu acesso será liberado assim que o pagamento for confirmado."
    >
      <Button onClick={() => setTentativas(0)}>Verificar novamente</Button>
      <Button variant="outline" asChild>
        <Link to="/conta">Ver minha assinatura</Link>
      </Button>
    </TelaStatus>
  )
}
