import { Link } from "react-router-dom"
import {
  ArrowRight,
  BarChart3,
  Brain,
  Calendar,
  Check,
  Timer,
} from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/features/auth/auth-context"

const RECURSOS = [
  {
    numero: "01",
    icone: Timer,
    titulo: "Sessões com Pomodoro",
    texto:
      "Cronômetro visual, ciclos de foco e pausa configuráveis, e anotações direto na sessão de estudo.",
  },
  {
    numero: "02",
    icone: Brain,
    titulo: "Revisão espaçada",
    texto:
      "O Brio agenda automaticamente quando revisar cada conteúdo, com base em ciência da aprendizagem.",
  },
  {
    numero: "03",
    icone: BarChart3,
    titulo: "Estatísticas e progresso",
    texto:
      "Acompanhe horas estudadas, nível de conhecimento por matéria e seu índice de preparação por prova.",
  },
  {
    numero: "04",
    icone: Calendar,
    titulo: "Calendário e cronograma",
    texto:
      "Veja provas, sessões e revisões numa linha do tempo, e monte sua grade semanal de estudos.",
  },
]

const PASSOS = [
  {
    titulo: "Cadastre sua prova",
    texto: "ENEM, vestibular ou concurso — com as matérias e conteúdos que você precisa estudar.",
  },
  {
    titulo: "Estude com o Pomodoro",
    texto: "Inicie uma sessão, escolha o conteúdo e deixe o cronômetro cuidar do seu ritmo.",
  },
  {
    titulo: "Revise no momento certo",
    texto: "O Brio agenda as revisões sozinho e mostra seu progresso em cada matéria.",
  },
]

const FAQ = [
  {
    pergunta: "Preciso instalar alguma coisa?",
    resposta: "Não. O Brio funciona direto no navegador, no computador ou no celular.",
  },
  {
    pergunta: "Posso estudar para mais de uma prova ao mesmo tempo?",
    resposta:
      "Sim. Cada prova tem suas próprias matérias, conteúdos, sessões e estatísticas, tudo separado.",
  },
  {
    pergunta: "Como funciona a garantia?",
    resposta:
      "Você tem 7 dias após a contratação para pedir reembolso total, direto pela sua conta, sem burocracia.",
  },
  {
    pergunta: "Posso cancelar quando quiser?",
    resposta:
      "Sim, não há fidelidade. Sua assinatura fica ativa até o fim do período já pago.",
  },
]

export function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="dark flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
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
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--primary) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
            <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              Feito para ENEM, vestibulares e concursos
            </span>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
              O sistema operacional da sua aprovação
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Provas, matérias, sessões com Pomodoro, revisão espaçada e estatísticas — tudo
              integrado, sem precisar de planilha nem vários apps separados.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link to={isAuthenticated ? "/dashboard" : "/registro"}>
                  Começar agora
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#planos">Ver planos</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-6 py-24">
          <div className="mb-12 flex flex-col gap-2 text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">Tudo que você precisa, junto</h2>
            <p className="text-muted-foreground">
              Sem trocar de aba, sem planilha improvisada, sem caderno separado.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {RECURSOS.map((recurso) => (
              <Card key={recurso.titulo} className="relative overflow-hidden">
                <CardHeader>
                  <span className="text-xs font-mono text-muted-foreground">
                    {recurso.numero}
                  </span>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <recurso.icone className="size-5" />
                    </div>
                    <CardTitle className="text-base">{recurso.titulo}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {recurso.texto}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-border/60 bg-card/50">
          <div className="mx-auto w-full max-w-5xl px-6 py-24">
            <div className="mb-12 flex flex-col gap-2 text-center">
              <h2 className="text-2xl font-semibold sm:text-3xl">Como funciona</h2>
              <p className="text-muted-foreground">Três passos, sem enrolação.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {PASSOS.map((passo, indice) => (
                <div key={passo.titulo} className="flex flex-col items-center gap-3 text-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {indice + 1}
                  </div>
                  <h3 className="font-medium">{passo.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{passo.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="planos" className="mx-auto w-full max-w-5xl px-6 py-24">
          <div className="mb-12 flex flex-col gap-2 text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">Planos simples, sem pegadinha</h2>
            <p className="text-muted-foreground">
              Garantia de reembolso total em até 7 dias após a contratação.
            </p>
          </div>

          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
  {/* Card Mensal */}
  <Card className="flex flex-col">
    <CardHeader>
      <CardTitle>Mensal</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-1 flex-col gap-4">
      <p className="text-3xl font-semibold">
        R$ 9,90{" "}
        <span className="text-sm font-normal text-muted-foreground">/mês</span>
      </p>
      <ul className="flex flex-col gap-1.5 text-left text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Check className="size-4 text-primary" /> Provas e matérias ilimitadas
        </li>
        <li className="flex items-center gap-2">
          <Check className="size-4 text-primary" /> Todas as funcionalidades
        </li>
      </ul>
      <Button className="mt-auto w-full" asChild>
        <Link to="/registro">Começar</Link>
      </Button>
    </CardContent>
  </Card>

  {/* Card Anual */}
  <Card className="flex flex-col border-primary">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>Anual</CardTitle>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
          2 meses grátis
        </span>
      </div>
    </CardHeader>
    <CardContent className="flex flex-1 flex-col gap-4">
      <p className="text-3xl font-semibold">
        R$ 99,00{" "}
        <span className="text-sm font-normal text-muted-foreground">/ano</span>
      </p>
      <ul className="flex flex-col gap-1.5 text-left text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Check className="size-4 text-primary" /> Provas e matérias ilimitadas
        </li>
        <li className="flex items-center gap-2">
          <Check className="size-4 text-primary" /> Todas as funcionalidades
        </li>
        <li className="flex items-center gap-2">
          <Check className="size-4 text-primary" /> Economize em relação ao mensal
        </li>
      </ul>
      <Button className="mt-auto w-full" asChild>
        <Link to="/registro">Começar</Link>
      </Button>
    </CardContent>
  </Card>
</div>
        </section>

        <section className="mx-auto w-full max-w-3xl px-6 py-24">
          <div className="mb-12 flex flex-col gap-2 text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">Perguntas frequentes</h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((item) => (
              <AccordionItem key={item.pergunta} value={item.pergunta}>
                <AccordionTrigger>{item.pergunta}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.resposta}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="border-t border-border/60">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Pronto para organizar seus estudos?
            </h2>
            <Button size="lg" asChild>
              <Link to={isAuthenticated ? "/dashboard" : "/registro"}>
                Começar agora
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 px-6 text-center text-sm text-muted-foreground">
          <span>Brio — {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}