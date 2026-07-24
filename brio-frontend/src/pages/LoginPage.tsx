import { type SubmitEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { useForceDarkMode } from "@/hooks/useForceDarkMode"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/features/auth/auth-context"

const API_URL = import.meta.env.VITE_API_URL as string

interface TokenResponse {
  access_token: string
  token_type: string
}

async function fazerLogin(email: string, senha: string): Promise<TokenResponse> {
  const corpo = new URLSearchParams()
  corpo.set("username", email)
  corpo.set("password", senha)

  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: corpo,
  })

  if (!response.ok) {
    throw new Error("Email ou senha incorretos")
  }

  return response.json()
}

export function LoginPage() {
  useForceDarkMode()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: () => fazerLogin(email, senha),
    onSuccess: (dados) => {
      login(dados.access_token)
      navigate("/")
    },
  })

  function handleSubmit(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-8"
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Brio</h1>
          <p className="text-sm text-muted-foreground">Entre na sua conta</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        {mutation.isError && (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        )}

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Entrando..." : "Entrar"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link to="/registro" className="text-primary hover:underline">
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  )
}