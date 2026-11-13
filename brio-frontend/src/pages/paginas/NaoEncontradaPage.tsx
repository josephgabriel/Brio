import { Link } from "react-router-dom"

import { TelaStatus } from "@/components/shared/TelaStatus"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/auth-context"

export function NaoEncontradaPage() {
  const { isAuthenticated } = useAuth()

  return (
    <TelaStatus
      codigo="404"
      titulo="Esta página não existe"
      texto="O endereço pode ter sido digitado errado, ou a página foi removida ou mudou de lugar."
    >
      <Button asChild>
        <Link to={isAuthenticated ? "/dashboard" : "/"}>
          {isAuthenticated ? "Ir para o Dashboard" : "Voltar ao início"}
        </Link>
      </Button>
    </TelaStatus>
  )
}
