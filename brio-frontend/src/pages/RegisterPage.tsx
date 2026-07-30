import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { useForceDarkMode } from "@/hooks/useForceDarkMode"
import logo3 from "@/assets/logo3.png"
import logo2 from "@/assets/logo2.png"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL as string

async function registrarUsuario(nome: string, email: string, senha: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha }),
  })

  if (!response.ok) {
    const erro = await response.json()
    throw new Error(erro.detail ?? "Não foi possível criar a conta")
  }
}

export function RegisterPage() {
  useForceDarkMode()
  
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: () => registrarUsuario(nome, email, senha),
    onSuccess: () => navigate("/login"),
  })

  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Lado esquerdo (idêntico ao Login) */}
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

      {/* Lado direito (Card de Cadastro) */}
      <section className="flex w-full items-center justify-center px-8 lg:w-1/2">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-10 shadow-xl"
        >
          <div className="mb-8 flex flex-col items-center">
            <img src={logo2} alt="Brio" className="mb-4 h-14 w-20" />
            <h2 className="text-3xl font-bold">Criar conta</h2>
            <p className="mt-2 text-muted-foreground">
              Cadastre-se para começar seus estudos.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="mt-2 h-11"
                placeholder="Seu nome"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 h-11"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="senha">Senha</Label>
              <div className="relative mt-2">
                <Input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  minLength={8}
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

          {mutation.isError && (
            <p className="mt-4 text-sm text-destructive">
              {mutation.error.message}
            </p>
          )}

          <Button
            type="submit"
            className="mt-8 h-11 w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Criando conta..." : "Criar conta"}
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já possui uma conta?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Entrar
            </Link>
          </p>
        </form>
      </section>
    </div>
  )
}