import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { useForceDarkMode } from "@/hooks/useForceDarkMode"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-8"
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Brio</h1>
          <p className="text-sm text-muted-foreground">Crie sua conta</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
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
            minLength={8}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        {mutation.isError && (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        )}

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Criando conta..." : "Criar conta"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  )
}