import { type SubmitEvent, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { redefinirSenha } from "@/features/auth/auth-api"

export function RedefinirSenhaPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [novaSenha, setNovaSenha] = useState("")
  const [erro, setErro] = useState<string | null>(null)

  async function handleSubmit(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro(null)

    const token = searchParams.get("token")
    if (!token) {
      setErro("Link inválido.")
      return
    }

    try {
      await redefinirSenha(token, novaSenha)
      navigate("/login")
    } catch {
      setErro("Link inválido ou expirado.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-8"
      >
        <h1 className="text-xl font-semibold">Redefinir senha</h1>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="novaSenha">Nova senha</Label>
          <Input
            id="novaSenha"
            type="password"
            minLength={8}
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
          />
        </div>

        {erro && <p className="text-sm text-destructive">{erro}</p>}

        <Button type="submit">Redefinir</Button>
      </form>
    </div>
  )
}