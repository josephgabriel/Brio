import { useState, useEffect, type FormEvent } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { useForceDarkMode } from "@/hooks/useForceDarkMode"
import logo3 from "@/assets/logo3.png"
import logo2 from "@/assets/logo2.png"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/features/auth/auth-context"
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL as string

interface TokenResponse {
  access_token: string
  token_type: string
}

async function fazerLogin(
  email: string,
  senha: string,
): Promise<TokenResponse> {
  const corpo = new URLSearchParams()

  corpo.set("username", email)
  corpo.set("password", senha)

  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: corpo,
  })

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail ?? "Email ou senha incorretos")
  }

  return response.json()
}

async function reenviarEmailVerificacao(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/v1/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail ?? "Não foi possível reenviar o e-mail")
  }
}

export function LoginPage() {
  useForceDarkMode()

  const location = useLocation()
  const navigate = useNavigate()

  const stateCadastro = location.state as {
    registradoComSucesso?: boolean
    emailCadastrado?: string
  } | null

  const [email, setEmail] = useState(stateCadastro?.emailCadastrado ?? "")
  const [senha, setSenha] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const [mensagemRegistro] = useState<string | null>(
    stateCadastro?.registradoComSucesso
      ? "Conta criada com sucesso! Verifique a caixa de entrada do seu email para finalizar seu cadastro antes de entrar."
      : null
  )

  // Limpa o state do react-router para a mensagem não reaparecer no F5
  useEffect(() => {
    if (stateCadastro?.registradoComSucesso) {
      window.history.replaceState({}, document.title)
    }
  }, [stateCadastro])

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
    <div className="flex min-h-screen bg-background">
      {/* Lado esquerdo */}
      <section className="relative hidden w-1/2 overflow-hidden lg:flex items-center justify-center border-r border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />

        <div className="relative max-w-lg animate-[slideIn_1s_ease] px-12">
          <div className="flex items-center gap-5">
            <img src={logo3} alt="Brio" className="h-25 w-30" />
            <h1 className="text-7xl font-black tracking-tight text-primary">
              Brio
            </h1>
          </div>

          <p className="mt-6 text-2xl font-medium">
            Plataforma completa de estudos para Concursos, ENEM e Vestibulares.
          </p>

          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Organize provas, matérias, sessões de estudo, revisões e anotações em
            uma única plataforma.
          </p>
        </div>
      </section>

      {/* Lado direito */}
      <section className="flex w-full items-center justify-center px-8 lg:w-1/2">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-10 shadow-xl"
        >
          <div className="mb-8 flex flex-col items-center">
            <img src={logo2} alt="Brio" className="mb-4 h-14 w-20" />

            <h2 className="text-3xl font-bold">Entrar</h2>

            <p className="mt-2 text-muted-foreground">
              Faça login para continuar.
            </p>
          </div>

          {/* Banner: Alerta de Cadastro Realizado com Sucesso */}
          {mensagemRegistro && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-500">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Cadastro realizado!</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {mensagemRegistro}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 h-11"
                placeholder="Digite seu Email"
                required
              />
            </div>

            <div>
              <Label htmlFor="senha">Senha</Label>
              <div className="relative mt-2">
                <Input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="h-11 pr-10"
                  required
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Banner de Erro Geral */}
          {mutation.isError && !emailNaoVerificado && (
            <p className="mt-4 text-sm text-destructive font-medium">
              {mutation.error.message}
            </p>
          )}

          {/* Banner Específico: Email não verificado */}
          {emailNaoVerificado && (
            <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-500">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">E-mail não verificado ainda</p>
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
                      className="mt-3 text-xs font-semibold text-primary underline hover:text-primary/80 disabled:opacity-50"
                    >
                      {mutationResend.isPending
                        ? "Reenviando..."
                        : "Reenviar e-mail de verificação"}
                    </button>
                  )}

                  {mutationResend.isError && (
                    <p className="mt-1 text-xs text-destructive">
                      {mutationResend.error.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="mt-8 h-11 w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Entrando..." : "Entrar"}
          </Button>

          <div className="mt-6 space-y-2 text-center text-sm">
            <p className="text-muted-foreground">
              Não possui uma conta?{" "}
              <Link
                to="/registro"
                className="font-medium text-primary hover:underline"
              >
                Cadastre-se
              </Link>
            </p>
            <p>
              <Link
                to="/esqueci-senha"
                className="text-muted-foreground hover:underline"
              >
                Esqueci minha senha
              </Link>
            </p>
          </div>
        </form>
      </section>

      <style>{`
        @keyframes slideIn{
          from{
            opacity:0;
            transform:translateX(-80px);
          }
          to{
            opacity:1;
            transform:translateX(0);
          }
        }
      `}</style>
    </div>
  )
}