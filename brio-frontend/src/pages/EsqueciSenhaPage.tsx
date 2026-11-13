import { type FormEvent, useState } from "react"
import { Link } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { ArrowLeft, MailCheck } from "lucide-react"

import { AuthLayout } from "@/components/auth/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { solicitarRedefinicaoSenha } from "@/features/auth/auth-api"

export function EsqueciSenhaPage() {
  const [email, setEmail] = useState("")
  const [enviado, setEnviado] = useState(false)

  const mutation = useMutation({
    mutationFn: () => solicitarRedefinicaoSenha(email),
    onSuccess: () => {
      setEnviado(true)
    },
  })

  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    mutation.mutate()
  }

  return (
    <AuthLayout
      titulo="Recuperar senha"
      descricao={
        enviado ? "Instruções enviadas!" : "Digite seu e-mail para receber o link de redefinição."
      }
    >
      {enviado ? (
        <div role="status" className="flex flex-col items-center gap-4 text-center">
          <div
            aria-hidden
            className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"
          >
            <MailCheck className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">
            Se <span className="font-medium text-foreground">{email}</span> estiver cadastrado, você
            receberá um link com as instruções de redefinição em instantes.
          </p>
          <button
            type="button"
            onClick={() => setEnviado(false)}
            className="inline-flex min-h-10 cursor-pointer items-center text-sm text-muted-foreground underline hover:text-foreground"
          >
            Usar outro e-mail
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
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

          {mutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              Ocorreu um erro ao enviar o e-mail. Tente novamente.
            </p>
          )}

          <Button type="submit" className="h-12 w-full sm:h-11" disabled={mutation.isPending}>
            {mutation.isPending ? "Enviando..." : "Enviar link"}
          </Button>
        </form>
      )}

      <div className="mt-8 text-center">
        <Link
          to="/login"
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Voltar para o login
        </Link>
      </div>
    </AuthLayout>
  )
}
