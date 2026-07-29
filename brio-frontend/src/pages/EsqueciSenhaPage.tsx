import { type SubmitEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { solicitarRedefinicaoSenha } from "@/features/auth/auth-api"

export function EsqueciSenhaPage() {
  const [email, setEmail] = useState("")
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    await solicitarRedefinicaoSenha(email)
    setEnviado(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-8"
      >
        <h1 className="text-xl font-semibold">Esqueci minha senha</h1>

        {enviado ? (
          <p className="text-sm text-muted-foreground">
            Se esse email estiver cadastrado, você vai receber um link de redefinição.
          </p>
        ) : (
          <>
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
            <Button type="submit">Enviar link</Button>
          </>
        )}
      </form>
    </div>
  )
}