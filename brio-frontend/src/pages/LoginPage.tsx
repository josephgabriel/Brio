import { useState, useEffect, type FormEvent } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { AuthLayout, AvisoAuth } from "@/components/auth/AuthLayout"
import { CampoSenha } from "@/components/auth/CampoSenha"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/features/auth/auth-context"

const API_URL = import.meta.env.VITE_API_URL as string

const MSG_SEM_CONEXAO = "Sem conexão com o servidor. Verifique sua internet e tente novamente."

interface TokenResponse {
  access_token: string
  token_type: string
}

async function chamarApi(url: string, opcoes: RequestInit): Promise<Response> {
  try {
    return await fetch(url, opcoes)
  } catch {
    throw new Error(MSG_SEM_CONEXAO)
  }
}

function mensagemDaResposta(erro: unknown, padrao: string): string {
  const detalhe = (erro as { detail?: unknown } | null)?.detail
  return typeof detalhe === "string" ? detalhe : padrao
}

async function fazerLogin(email: string, senha: string): Promise<TokenResponse> {
  const corpo = new URLSearchParams()
  corpo.set("username", email)
  corpo.set("password", senha)

  const response = await chamarApi(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: corpo,
  })

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(mensagemDaResposta(erro, "Email ou senha incorretos"))
  }

  return response.json()
}

async function reenviarEmailVerificacao(email: string): Promise<void> {
  const response = await chamarApi(`${API_URL}/api/v1/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(mensagemDaResposta(erro, "Não foi possível reenviar o e-mail"))
  }
}

export function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const stateEntrada = location.state as {
    registradoComSucesso?: boolean
    emailCadastrado?: string
    senhaRedefinidaComSucesso?: boolean
  } | null

  const [email, setEmail] = useState(stateEntrada?.emailCadastrado ?? "")
  const [senha, setSenha] = useState("")

  const [cadastroConcluido] = useState(Boolean(stateEntrada?.registradoComSucesso))
  const [senhaRedefinida] = useState(Boolean(stateEntrada?.senhaRedefinidaComSucesso))

  // Limpa o state do react-router para os avisos não reaparecerem no F5
  useEffect(() => {
    if (stateEntrada?.registradoComSucesso || stateEntrada?.senhaRedefinidaComSucesso) {
      window.history.replaceState({}, document.title)
    }
  }, [stateEntrada])

  // Estado para controlar a exibição do alerta de email não verificado e reenvio
  const [emailNaoVerificado, setEmailNaoVerificado] = useState(false)
  const [mensagemSucessoReenvio, setMensagemSucessoReenvio] = useState<string | null>(null)

  const { login } = useAuth()

  const mutation = useMutation({
    mutationFn: () => fazerLogin(email, senha),
    onSuccess: (dados) => {
      login(dados.access_token)
      navigate("/dashboard")
    },
    onError: (error: Error) => {
      if (
        error.message.includes("EMAIL_NOT_VERIFIED") ||
        error.message.toLowerCase().includes("não verificado") ||
        error.message.toLowerCase().includes("verifique seu email")
      ) {
        setEmailNaoVerificado(true)
      } else {
        setEmailNaoVerificado(false)
      }
    },
  })

  const mutationResend = useMutation({
    mutationFn: () => reenviarEmailVerificacao(email),
    onSuccess: () => {
      setMensagemSucessoReenvio("Novo e-mail de verificação enviado! Confira sua caixa de entrada.")
    },
  })

  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setEmailNaoVerificado(false)
    setMensagemSucessoReenvio(null)
    mutation.mutate()
  }

  return (
    <AuthLayout titulo="Entrar" descricao="Faça login para continuar.">
      {cadastroConcluido && (
        <AvisoAuth tom="sucesso" icone={<CheckCircle2 className="size-5" />} titulo="Cadastro realizado!">
          <p className="mt-1 text-xs text-muted-foreground">
            Conta criada com sucesso! Verifique a caixa de entrada do seu email para finalizar seu
            cadastro antes de entrar.
          </p>
        </AvisoAuth>
      )}

      {senhaRedefinida && (
        <AvisoAuth tom="sucesso" icone={<CheckCircle2 className="size-5" />} titulo="Senha redefinida!">
          <p className="mt-1 text-xs text-muted-foreground">
            Sua senha foi alterada. Entre com a nova senha.
          </p>
        </AvisoAuth>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 h-11 text-base md:text-sm"
              placeholder="seu@email.com"
              required
            />
          </div>

          <CampoSenha
            id="senha"
            rotulo="Senha"
            value={senha}
            onChange={setSenha}
            autoComplete="current-password"
            acessorio={
              <Link
                to="/esqueci-senha"
                className="inline-flex min-h-10 items-center text-sm text-muted-foreground hover:text-foreground hover:underline"
              >
                Esqueci minha senha
              </Link>
            }
          />
        </div>

        {/* Erro geral */}
        {mutation.isError && !emailNaoVerificado && (
          <p role="alert" className="mt-4 text-sm font-medium text-destructive">
            {mutation.error.message}
          </p>
        )}

        {/* Email não verificado */}
        {emailNaoVerificado && (
          <AvisoAuth
            tom="atencao"
            className="mt-5"
            icone={<AlertCircle className="size-5" />}
            titulo="E-mail não verificado ainda"
          >
            <p className="mt-1 text-xs text-muted-foreground">
              Você precisa confirmar seu endereço de e-mail antes de acessar a plataforma.
            </p>

            {mensagemSucessoReenvio ? (
              <p className="mt-3 text-xs font-medium text-emerald-500">
                {mensagemSucessoReenvio}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => mutationResend.mutate()}
                disabled={mutationResend.isPending}
                className="mt-2 inline-flex min-h-10 cursor-pointer items-center text-xs font-semibold text-primary underline hover:text-primary/80 disabled:opacity-50"
              >
                {mutationResend.isPending ? "Reenviando..." : "Reenviar e-mail de verificação"}
              </button>
            )}

            {mutationResend.isError && (
              <p className="mt-1 text-xs text-destructive">{mutationResend.error.message}</p>
            )}
          </AvisoAuth>
        )}

        <Button
          type="submit"
          className="mt-6 h-12 w-full sm:mt-8 sm:h-11"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Não possui uma conta?{" "}
        <Link to="/registro" className="font-medium text-primary hover:underline">
          Cadastre-se
        </Link>
      </p>
    </AuthLayout>
  )
}
