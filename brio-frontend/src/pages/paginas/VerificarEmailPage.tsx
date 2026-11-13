import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"

import { TelaStatus } from "@/components/shared/TelaStatus"
import { Button } from "@/components/ui/button"
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

  if (estado === "carregando") {
    return <TelaStatus icone={Loader2} girando titulo="Verificando seu e-mail..." />
  }

  if (estado === "sucesso") {
    return (
      <TelaStatus
        icone={CheckCircle2}
        tom="sucesso"
        titulo="E-mail confirmado!"
        texto="Sua conta está pronta. Agora é só entrar."
      >
        <Button asChild>
          <Link to="/login">Ir para o login</Link>
        </Button>
      </TelaStatus>
    )
  }

  return (
    <TelaStatus
      icone={XCircle}
      tom="erro"
      titulo="Link inválido ou expirado"
      texto="Entre com seu e-mail e senha: se a conta ainda não estiver verificada, você poderá pedir um novo link."
    >
      <Button asChild>
        <Link to="/login">Ir para o login</Link>
      </Button>
    </TelaStatus>
  )
}
