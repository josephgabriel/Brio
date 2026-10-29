import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/auth-context"

export function NaoEncontradaPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-primary">Erro 404</p>
      <h1 className="text-3xl font-semibold sm:text-4xl">Esta página não existe</h1>
      <p className="max-w-md text-muted-foreground">
        O endereço pode ter sido digitado errado, ou a página foi removida ou mudou de lugar.
      </p>
      <Button asChild>
        <Link to={isAuthenticated ? "/dashboard" : "/"}>
          {isAuthenticated ? "Ir para o Dashboard" : "Voltar ao início"}
        </Link>
      </Button>
    </div>
  )
}