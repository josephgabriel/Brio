import { type FormEvent, useState } from "react"
import { Link } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { useForceDarkMode } from "@/hooks/useForceDarkMode"
import logo3 from "@/assets/logo3.png"
import logo2 from "@/assets/logo2.png"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { solicitarRedefinicaoSenha } from "@/features/auth/auth-api"
import { ArrowLeft } from "lucide-react"

export function EsqueciSenhaPage() {
  useForceDarkMode()

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

      {/* Lado direito (Card de Esqueci a Senha) */}
      <section className="flex w-full items-center justify-center px-8 lg:w-1/2">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-10 shadow-xl"
        >
          <div className="mb-8 flex flex-col items-center">
            <img src={logo2} alt="Brio" className="mb-4 h-14 w-20" />
            <h2 className="text-3xl font-bold">Recuperar senha</h2>
            <p className="mt-2 text-center text-muted-foreground">
              {enviado
                ? "Instruções enviadas!"
                : "Digite seu email para receber o link de redefinição."}
            </p>
          </div>

          {enviado ? (
            <p className="text-center text-sm text-muted-foreground">
              Se esse email estiver cadastrado, você receberá um link com as
              instruções de redefinição em instantes.
            </p>
          ) : (
            <div className="space-y-5">
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

              {mutation.isError && (
                <p className="text-sm text-destructive">
                  Ocorreu um erro ao enviar o e-mail. Tente novamente.
                </p>
              )}

              <Button
                type="submit"
                className="h-11 w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Enviando..." : "Enviar link"}
              </Button>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}