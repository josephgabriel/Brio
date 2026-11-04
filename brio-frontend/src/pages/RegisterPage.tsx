import { useState, type FormEvent, type ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { Eye, EyeOff, Check, X } from "lucide-react"

import logo3 from "@/assets/logo3.png"
import logo2 from "@/assets/logo2.png"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { VERSAO_TERMOS } from "@/features/legal/constantes"
import { useForceDarkMode } from "@/hooks/useForceDarkMode"

const API_URL = import.meta.env.VITE_API_URL as string

const MSG_SEM_CONEXAO = "Sem conexão com o servidor. Verifique sua internet e tente novamente."

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

async function registrarUsuario(nome: string, email: string, senha: string): Promise<void> {
  const response = await chamarApi(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome,
      email,
      senha,
      aceitou_termos: true,
      termos_versao: VERSAO_TERMOS,
    }),
  })

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(
      mensagemDaResposta(erro, "Não foi possível criar a conta. Confira os dados e tente novamente."),
    )
  }
}

interface RequisitoProps {
  atendido: boolean
  className?: string
  children: ReactNode
}

function Requisito({ atendido, className = "", children }: RequisitoProps) {
  return (
    <span
      className={`flex items-center gap-1.5 ${
        atendido ? "font-medium text-emerald-500" : "text-muted-foreground"
      } ${className}`}
    >
      {atendido ? (
        <Check className="size-3.5 shrink-0" />
      ) : (
        <X className="size-3.5 shrink-0" />
      )}
      {children}
    </span>
  )
}

export function RegisterPage() {
  useForceDarkMode()

  const [aceitouTermos, setAceitouTermos] = useState(false)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")

  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false)
  const [erroFormulario, setErroFormulario] = useState<string | null>(null)

  const navigate = useNavigate()

  // Regras de validação de senha
  const temMinimo = senha.length >= 8
  const temMaiuscula = /[A-Z]/.test(senha)
  const temMinuscula = /[a-z]/.test(senha)
  const temNumero = /[0-9]/.test(senha)
  const temEspecial = /[^A-Za-z0-9]/.test(senha)

  const senhaEhValida = temMinimo && temMaiuscula && temMinuscula && temNumero && temEspecial
  const senhasCoincidem = senha === confirmarSenha && confirmarSenha.length > 0

  const mutation = useMutation({
    mutationFn: () => registrarUsuario(nome.trim(), email, senha),
    onSuccess: () => {
      navigate("/login", {
        state: {
          registradoComSucesso: true,
          emailCadastrado: email,
        },
      })
    },
  })

  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!aceitouTermos) return
    setErroFormulario(null)

    if (!senhaEhValida) {
      setErroFormulario("A senha não atende a todos os requisitos de segurança.")
      return
    }

    if (senha !== confirmarSenha) {
      setErroFormulario("As senhas não coincidem.")
      return
    }

    mutation.mutate()
  }

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Lado esquerdo (só aparece em telas grandes) */}
      <section className="relative hidden w-1/2 items-center justify-center overflow-hidden border-r border-border lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />

        <div className="relative max-w-lg px-12">
          <div className="flex items-center gap-5">
            <img src={logo3} alt="Brio" className="h-25 w-30" />
            <h1 className="text-7xl font-black tracking-tight text-primary">Brio</h1>
          </div>

          <p className="mt-6 text-2xl font-medium">
            Plataforma completa de estudos para Concursos, ENEM e Vestibulares.
          </p>

          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Organize provas, matérias, sessões de estudo, revisões e anotações em uma única
            plataforma.
          </p>
        </div>
      </section>

      {/* Lado direito (cartão de cadastro) */}
      <section className="flex w-full items-center justify-center px-4 py-8 sm:px-8 sm:py-10 lg:w-1/2">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-10"
        >
          <div className="mb-6 flex flex-col items-center sm:mb-8">
            <img src={logo2} alt="Brio" className="mb-4 h-14 w-20" />
            <h2 className="text-2xl font-bold sm:text-3xl">Criar conta</h2>
            <p className="mt-2 text-center text-muted-foreground">
              Cadastre-se para começar seus estudos.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                type="text"
                autoComplete="name"
                autoCapitalize="words"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="mt-2 h-11 text-base md:text-sm"
                placeholder="Seu nome"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 h-11 text-base md:text-sm"
                placeholder="Seu email"
                required
              />
            </div>

            <div>
              <Label htmlFor="senha">Criar senha</Label>
              <div className="relative mt-2">
                <Input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="new-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="h-11 pr-12 text-base md:text-sm"
                  required
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Checklist de validação da senha: uma coluna no celular, duas de sm para cima */}
              <div className="mt-3 space-y-1.5 text-xs">
                <p className="font-medium text-muted-foreground">A senha deve conter:</p>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  <Requisito atendido={temMinimo}>Pelo menos 8 caracteres</Requisito>
                  <Requisito atendido={temMaiuscula}>Letra maiúscula</Requisito>
                  <Requisito atendido={temMinuscula}>Letra minúscula</Requisito>
                  <Requisito atendido={temNumero}>Número</Requisito>
                  <Requisito atendido={temEspecial} className="sm:col-span-2">
                    Caractere especial (!@#$%^&*)
                  </Requisito>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmarSenha">Confirmar senha</Label>
              <div className="relative mt-2">
                <Input
                  id="confirmarSenha"
                  type={mostrarConfirmarSenha ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="h-11 pr-12 text-base md:text-sm"
                  required
                />

                <button
                  type="button"
                  onClick={() => setMostrarConfirmarSenha((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label={
                    mostrarConfirmarSenha ? "Ocultar confirmação" : "Mostrar confirmação"
                  }
                >
                  {mostrarConfirmarSenha ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {confirmarSenha.length > 0 && !senhasCoincidem && (
                <p className="mt-1.5 text-xs text-destructive">As senhas não coincidem.</p>
              )}
            </div>

            {/* Termos de Uso e Política */}
            <div className="flex items-start gap-3 pt-2">
              <input
                id="aceite-termos"
                type="checkbox"
                checked={aceitouTermos}
                onChange={(e) => setAceitouTermos(e.target.checked)}
                required
                className="mt-0.5 size-5 shrink-0 cursor-pointer accent-primary sm:mt-1 sm:size-4"
              />
              <label
                htmlFor="aceite-termos"
                className="cursor-pointer select-none text-sm font-normal leading-snug text-muted-foreground"
              >
                Li e aceito os{" "}
                <Link
                  to="/termos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline hover:text-foreground"
                >
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link
                  to="/privacidade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline hover:text-foreground"
                >
                  Política de Privacidade
                </Link>
                .
              </label>
            </div>
          </div>

          {(erroFormulario || mutation.isError) && (
            <p className="mt-4 text-sm text-destructive">
              {erroFormulario ?? mutation.error?.message}
            </p>
          )}

          <Button
            type="submit"
            className="mt-6 h-12 w-full sm:h-11"
            disabled={!aceitouTermos || mutation.isPending || !senhaEhValida || !senhasCoincidem}
          >
            {mutation.isPending ? "Criando conta..." : "Criar conta"}
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já possui uma conta?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </section>
    </div>
  )
}