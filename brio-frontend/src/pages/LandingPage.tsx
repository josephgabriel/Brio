import { Link } from "react-router-dom"
import { BarChart3, Brain, Timer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/features/auth/auth-context"

export function LandingPage() {
  const { isAuthenticated } = useAuth()

  const assinaturaLink = isAuthenticated
  ? "/planos"
  : "/login?redirect=/planos"

  const comecarLink = isAuthenticated
    ? "/dashboard"
    : "/registro?redirect=/dashboard"

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
          <span className="text-lg font-semibold">Brio</span>

          <div className="flex gap-2">
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/dashboard">Ir para o app</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>

                <Button asChild>
                  <Link to="/registro">Criar conta</Link>
                </Button>
              </>
            )}
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-24 px-6 py-16 text-center">
          <section className="flex flex-col items-center gap-6">
            <h1 className="max-w-2xl text-4xl font-semibold sm:text-5xl">
              Organize seus estudos para concursos e vestibulares em um só lugar
            </h1>

            <p className="max-w-xl text-lg text-muted-foreground">
              Provas, matérias, sessões com Pomodoro, revisão espaçada e estatísticas — tudo
              integrado, sem precisar de planilha nem vários apps separados.
            </p>

            <Button size="lg" asChild>
              <Link to={comecarLink}>
                Começar agora
              </Link>
            </Button>
          </section>

          <section className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <Timer className="mb-2 size-6 text-primary" />
                <CardTitle className="text-base">
                  Sessões com Pomodoro
                </CardTitle>
              </CardHeader>

              <CardContent className="text-left text-sm text-muted-foreground">
                Cronômetro visual, ciclos de foco e pausa configuráveis, e anotações direto na
                sessão de estudo.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="mb-2 size-6 text-primary" />
                <CardTitle className="text-base">
                  Revisão espaçada
                </CardTitle>
              </CardHeader>

              <CardContent className="text-left text-sm text-muted-foreground">
                O Brio agenda automaticamente quando revisar cada conteúdo, com base em ciência da
                aprendizagem.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="mb-2 size-6 text-primary" />
                <CardTitle className="text-base">
                  Estatísticas e progresso
                </CardTitle>
              </CardHeader>

              <CardContent className="text-left text-sm text-muted-foreground">
                Acompanhe horas estudadas, nível de conhecimento por matéria e seu índice de
                preparação por prova.
              </CardContent>
            </Card>
          </section>

          <section className="flex w-full flex-col items-center gap-6">
            <h2 className="text-2xl font-semibold">
              Planos simples, sem pegadinha
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Card className="w-72">
                <CardHeader>
                  <CardTitle>Mensal</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="mb-4 text-3xl font-semibold">
                    R$ 9,90{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      /mês
                    </span>
                  </p>

                  <Button className="w-full" asChild>
                    <Link to={assinaturaLink}>
                      Começar
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="w-72">
                <CardHeader>
                  <CardTitle>Anual</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="mb-4 text-3xl font-semibold">
                    R$ 99,00{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      /ano
                    </span>
                  </p>

                  <Button className="w-full" asChild>
                    <Link to={assinaturaLink}>
                      Começar
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <p className="text-xs text-muted-foreground">
              Garantia de reembolso total em até 7 dias após a contratação.
            </p>
          </section>
        </main>

        <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
          Brio — {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  )
}