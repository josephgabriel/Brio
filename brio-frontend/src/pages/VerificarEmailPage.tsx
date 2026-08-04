import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"

import { verificarEmail } from "@/features/auth/auth-api"
import { useForceDarkMode } from "@/hooks/useForceDarkMode"

export function VerificarEmailPage() {
  useForceDarkMode()
  const [searchParams] = useSearchParams()
  const [estado, setEstado] = useState<"carregando" | "sucesso" | "erro">("carregando")

  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      setEstado("erro")
      return
    }

    verificarEmail(token)
      .then(() => setEstado("sucesso"))
      .catch(() => setEstado("erro"))
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center text-center">
      <div>
        {estado === "carregando" && <p className="text-muted-foreground">Verificando...</p>}
        {estado === "sucesso" && (
          <>
            <p className="mb-2 text-lg font-medium">Email confirmado!</p>
            <Link to="/login" className="text-primary hover:underline">
              Ir para o login
            </Link>
          </>
        )}
        {estado === "erro" && (
          <p className="text-destructive">Link inválido ou expirado.</p>
        )}
      </div>
    </div>
  )
}