import { type FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { solicitarRedefinicaoSenha } from "@/features/auth/auth-api"

export function EsqueciSenhaPage() {
  const [email, setEmail] = useState("")
  const [enviado, setEnviado] = useState(false)

  // Ajustado o tipo do evento para FormEvent do React
  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    await solicitarRedefinicaoSenha(email)
    setEnviado(true)
  }

  return (
    /* Adicionado 'dark', fundo escuro 'bg-background' e texto claro 'text-foreground' */
    <div className="dark flex min-h-screen items-center justify-center bg-background text-foreground">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-8 shadow-lg"
      >
        <h1 className="text-xl font-semibold text-card-foreground">
          Esqueci minha senha
        </h1>

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
            <Button type="submit" className="w-full">
              Enviar link
            </Button>
          </>
        )}
      </form>
    </div>
  )
}