import { useState, type FormEvent } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useForceDarkMode } from "@/hooks/useForceDarkMode"
import logo3 from "@/assets/logo3.png"
import logo2 from "@/assets/logo2.png"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { redefinirSenha } from "@/features/auth/auth-api"
import { Eye, EyeOff, Check, X } from "lucide-react"

export function RedefinirSenhaPage() {
  useForceDarkMode()

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")

  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false)
  
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  // Regras de validação de senha
  const temMinimo = novaSenha.length >= 8
  const temMaiuscula = /[A-Z]/.test(novaSenha)
  const temMinuscula = /[a-z]/.test(novaSenha)
  const temNumero = /[0-9]/.test(novaSenha)
  const temEspecial = /[^A-Za-z0-9]/.test(novaSenha)

  const senhaEhValida = temMinimo && temMaiuscula && temMinuscula && temNumero && temEspecial
  const senhasCoincidem = novaSenha === confirmarSenha && confirmarSenha.length > 0

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro(null)

    const token = searchParams.get("token")
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
    <div className="flex min-h-screen bg-background">
      {/* Lado esquerdo */}
      <section className="relative hidden w-1/2 overflow-hidden lg:flex items-center justify-center border-r border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />

        <div className="relative max-w-lg px-12">
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
            Organize provas, matérias, sessões de estudo, revisões e anotações
            em uma única plataforma.
          </p>
        </div>
      </section>

      {/* Lado direito (Card de Redefinição) */}
      <section className="flex w-full items-center justify-center px-8 lg:w-1/2 py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-10 shadow-xl"
        >
          <div className="mb-8 flex flex-col items-center">
            <img src={logo2} alt="Brio" className="mb-4 h-14 w-20" />
            <h2 className="text-3xl font-bold">Redefinir senha</h2>
            <p className="mt-2 text-center text-muted-foreground">
              Crie uma nova senha segura para a sua conta.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <Label htmlFor="novaSenha">Nova senha</Label>
              <div className="relative mt-2">
                <Input
                  id="novaSenha"
                  type={mostrarSenha ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
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

              {/* Checklist de Validação da Senha */}
              <div className="mt-3 space-y-1.5 text-xs">
                <p className="font-medium text-muted-foreground">A nova senha deve conter:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <span className={`flex items-center gap-1.5 ${temMinimo ? "text-emerald-500 font-medium" : "text-muted-foreground"}`}>
                    {temMinimo ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    Pelo menos 8 caracteres
                  </span>
                  <span className={`flex items-center gap-1.5 ${temMaiuscula ? "text-emerald-500 font-medium" : "text-muted-foreground"}`}>
                    {temMaiuscula ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    Letra maiúscula
                  </span>
                  <span className={`flex items-center gap-1.5 ${temMinuscula ? "text-emerald-500 font-medium" : "text-muted-foreground"}`}>
                    {temMinuscula ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    Letra minúscula
                  </span>
                  <span className={`flex items-center gap-1.5 ${temNumero ? "text-emerald-500 font-medium" : "text-muted-foreground"}`}>
                    {temNumero ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    Número
                  </span>
                  <span className={`flex items-center gap-1.5 col-span-2 ${temEspecial ? "text-emerald-500 font-medium" : "text-muted-foreground"}`}>
                    {temEspecial ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    Caractere especial (!@#$%^&*)
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
              <div className="relative mt-2">
                <Input
                  id="confirmarSenha"
                  type={mostrarConfirmarSenha ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="h-11 pr-10"
                  required
                />

                <button
                  type="button"
                  onClick={() => setMostrarConfirmarSenha((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                  aria-label={mostrarConfirmarSenha ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                >
                  {mostrarConfirmarSenha ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {confirmarSenha.length > 0 && !senhasCoincidem && (
                <p className="mt-1.5 text-xs text-destructive">
                  As senhas não coincidem.
                </p>
              )}
            </div>
          </div>

          {erro && (
            <p className="mt-4 text-sm text-destructive">
              {erro}
            </p>
          )}

          <Button
            type="submit"
            className="mt-8 h-11 w-full"
            disabled={carregando || !senhaEhValida || !senhasCoincidem}
          >
            {carregando ? "Redefinindo..." : "Redefinir senha"}
          </Button>
        </form>
      </section>
    </div>
  )
}