import { useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { AuthLayout } from "@/components/auth/AuthLayout"
import { CampoSenha } from "@/components/auth/CampoSenha"
import { RequisitosSenha } from "@/components/auth/RequisitosSenha"
import { Button } from "@/components/ui/button"
import { avaliarSenha } from "@/features/auth/senha"
import { redefinirSenha } from "@/features/auth/auth-api"

export function RedefinirSenhaPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")

  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  const token = searchParams.get("token")

  const senhaEhValida = avaliarSenha(novaSenha).valida
  const senhasCoincidem = novaSenha === confirmarSenha && confirmarSenha.length > 0

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro(null)

    if (!token) {
      setErro("Link inválido ou token ausente.")
      return
    }

    if (!senhaEhValida) {
      setErro("A nova senha não atende a todos os requisitos de segurança.")
      return
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.")
      return
    }

    try {
      setCarregando(true)
      await redefinirSenha(token, novaSenha)
      navigate("/login", {
        state: {
          senhaRedefinidaComSucesso: true,
        },
      })
    } catch {
      setErro("Link inválido ou expirado.")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <AuthLayout titulo="Redefinir senha" descricao="Crie uma nova senha segura para a sua conta.">
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <CampoSenha
            id="novaSenha"
            rotulo="Nova senha"
            value={novaSenha}
            onChange={setNovaSenha}
            autoComplete="new-password"
          >
            <RequisitosSenha senha={novaSenha} titulo="A nova senha deve conter:" />
          </CampoSenha>

          <CampoSenha
            id="confirmarSenha"
            rotulo="Confirmar nova senha"
            nomeAcessivel="confirmação de senha"
            value={confirmarSenha}
            onChange={setConfirmarSenha}
            autoComplete="new-password"
          >
            {confirmarSenha.length > 0 && !senhasCoincidem && (
              <p className="mt-1.5 text-xs text-destructive">As senhas não coincidem.</p>
            )}
          </CampoSenha>
        </div>

        {(erro || !token) && (
          <div role="alert" className="mt-4 text-sm text-destructive">
            <p>{erro ?? "Link inválido ou token ausente."}</p>
            {(!token || erro === "Link inválido ou expirado.") && (
              <Link
                to="/esqueci-senha"
                className="mt-1 inline-flex min-h-10 items-center font-medium underline"
              >
                Pedir um novo link
              </Link>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="mt-6 h-12 w-full sm:mt-8 sm:h-11"
          disabled={carregando || !senhaEhValida || !senhasCoincidem}
        >
          {carregando ? "Redefinindo..." : "Redefinir senha"}
        </Button>
      </form>
    </AuthLayout>
  )
}
