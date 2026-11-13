import { Link } from "react-router-dom"
import { ArrowRight, BarChart3, Brain, Calendar, Check, FileText, Sparkles, Timer } from "lucide-react"

import logo3 from "@/assets/logo3.png"
import { CartaoPlano } from "@/components/shared/CartaoPlano"
import { SeloConfianca } from "@/components/shared/SeloConfianca"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BENEFICIOS_PLANO } from "@/features/assinatura/beneficios"
import {
  EQUIVALENTE_MENSAL_ANUAL,
  PERCENTUAL_ECONOMIA,
  PRECOS,
  formatarReais,
} from "@/features/assinatura/precos"
import { useAuth } from "@/features/auth/auth-context"

const RECURSOS = [
  {
    icone: Timer,
    titulo: "Sessões com Pomodoro",
    texto:
      "Cronômetro visual, ciclos de foco e pausa configuráveis, e anotações direto na sessão de estudo.",
  },
  {
    icone: Brain,
    titulo: "Revisão espaçada",
    texto:
      "O Brio agenda automaticamente quando revisar cada conteúdo, com base em ciência da aprendizagem.",
  },
  {
    icone: BarChart3,
    titulo: "Estatísticas e progresso",
    texto:
      "Acompanhe suas horas de estudo, o progresso de cada matéria e seu índice de preparação por prova.",
  },
  {
    icone: Calendar,
    titulo: "Calendário e cronograma",
    texto:
      "Veja provas, tarefas e revisões num calendário, e monte sua grade semanal de estudos.",
  },
  {
    icone: Sparkles,
    titulo: "Questões com IA",
    ia: true,
    texto:
      "Gere questões de múltipla escolha a partir do seu próprio PDF, com explicação de cada resposta e histórico para revisar.",
  },
  {
    icone: FileText,
    titulo: "Resumos com IA",
    ia: true,
    texto:
      "Envie um PDF e receba um resumo organizado em tópicos, conceitos-chave e pontos para memorizar.",
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

// Intervalos reais das revisões do Brio (dias depois da sessão)
const INTERVALOS_REVISAO = [1, 7, 16, 35]
const ULTIMO_INTERVALO = INTERVALOS_REVISAO[INTERVALOS_REVISAO.length - 1]

/**
 * Ilustração do hero: uma sessão em andamento e as quatro revisões que ela agenda.
 * Os pontos ficam espaçados na proporção dos dias, para mostrar que o intervalo cresce.
 * É decorativa (dados de exemplo), por isso fica escondida de leitores de tela.
 */
function PreviewSessao() {
  const raio = 52
  const circunferencia = 2 * Math.PI * raio
  const progresso = 0.58

  return (
    <div
      aria-hidden
      className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-medium">Direito Constitucional</p>
          <p className="truncate text-sm text-muted-foreground">Controle de constitucionalidade</p>
        </div>
        <span className="shrink-0 text-sm text-muted-foreground">Ciclo 1 de 2</span>
      </div>

      <div className="relative mx-auto my-6 size-44">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90">
          <circle cx="60" cy="60" r={raio} className="fill-none stroke-border" strokeWidth="6" />
          <circle
            cx="60"
            cy="60"
            r={raio}
            className="fill-none stroke-primary"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            strokeDashoffset={circunferencia * (1 - progresso)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-semibold tabular-nums">14:32</span>
          <span className="text-sm text-muted-foreground">Foco</span>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">Ao finalizar, o Brio agenda 4 revisões:</p>

        <div className="relative mx-6 mb-9 mt-6 h-3">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
          {INTERVALOS_REVISAO.map((dias) => (
            <div
              key={dias}
              className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${(dias / ULTIMO_INTERVALO) * 100}%` }}
            >
              <span className="size-3 rounded-full bg-primary ring-4 ring-card" />
              <span className="absolute top-5 whitespace-nowrap text-sm font-medium tabular-nums">
                {dias} {dias === 1 ? "dia" : "dias"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LandingPage() {
  const { isAuthenticated } = useAuth()
  const destinoPrincipal = isAuthenticated ? "/dashboard" : "/registro"

  return (
    <div className="dark flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3 sm:py-4">
          <Link to="/" className="flex items-center gap-2" aria-label="Brio, página inicial">
            <img src={logo3} alt="" className="h-7 w-auto" />
            <span className="text-lg font-semibold">Brio</span>
          </Link>

          <nav aria-label="Seções da página" className="hidden items-center gap-6 text-sm md:flex">
            <a href="#recursos" className="text-muted-foreground hover:text-foreground">
              Recursos
            </a>
            <a href="#planos" className="text-muted-foreground hover:text-foreground">
              Planos
            </a>
            <a href="#duvidas" className="text-muted-foreground hover:text-foreground">
              Dúvidas
            </a>
          </nav>

          <div className="flex gap-2">
            {isAuthenticated ? (
              <Button className="min-h-10 sm:min-h-0" asChild>
                <Link to="/dashboard">Ir para o app</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="min-h-10 sm:min-h-0" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button className="min-h-10 sm:min-h-0" asChild>
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
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-background"
          />

          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-28">
            <div className="flex flex-col items-start gap-6">
              <h1 className="max-w-xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                Cada sessão de estudo já agenda a sua revisão
              </h1>

              <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
                Cadastre a prova, estude com Pomodoro e o Brio marca as revisões em 1, 7, 16 e 35
                dias. Matérias, calendário e estatísticas no mesmo lugar, sem planilha.
              </p>

              <div className="flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
                <Button size="lg" className="min-h-12 w-full sm:min-h-0 sm:w-auto" asChild>
                  <Link to={destinoPrincipal}>
                    Começar agora
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="min-h-12 w-full sm:min-h-0 sm:w-auto"
                  asChild
                >
                  <a href="#planos">Ver planos</a>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Para quem estuda para ENEM, vestibulares e concursos.
              </p>
            </div>

            <PreviewSessao />
          </div>
        </section>

        <section id="recursos" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                Tudo que você precisa, junto
              </h2>
              <p className="mt-3 text-muted-foreground">
                Sem trocar de aba, sem planilha improvisada, sem caderno separado.
              </p>
            </div>

            <ul className="divide-y divide-border border-y border-border">
              {RECURSOS.map((recurso) => (
                <li key={recurso.titulo} className="flex gap-4 py-5">
                  <div
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  >
                    <recurso.icone className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="flex flex-wrap items-center gap-2 font-medium">
                      {recurso.titulo}
                      {recurso.ia && <Badge variant="secondary">Brio-IA</Badge>}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{recurso.texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-y border-border/60 bg-card/50">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Como funciona</h2>
            <p className="mt-3 text-muted-foreground">Três passos, sem enrolação.</p>

            <ol className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {PASSOS.map((passo, indice) => (
                <li key={passo.titulo} className="flex gap-4 sm:flex-col sm:gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-semibold tabular-nums text-primary-foreground">
                    {indice + 1}
                  </span>
                  <div>
                    <h3 className="font-medium">{passo.titulo}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{passo.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="planos" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-16 sm:py-24">
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Planos simples, sem pegadinha
          </h2>
          <p className="mt-3 text-muted-foreground">
            Garantia de reembolso total em até 7 dias após a contratação.
          </p>

          <div className="mt-10 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
            <CartaoPlano nome="Mensal" preco={formatarReais(PRECOS.mensal)} periodo="/mês">
              <Button variant="outline" className="min-h-11 w-full sm:min-h-0" asChild>
                <Link to="/registro">Começar</Link>
              </Button>
            </CartaoPlano>

            <CartaoPlano
              nome="Anual"
              preco={formatarReais(PRECOS.anual)}
              periodo="/ano"
              observacao={`Equivale a ${formatarReais(EQUIVALENTE_MENSAL_ANUAL)}/mês`}
              selo={`${PERCENTUAL_ECONOMIA}% de desconto`}
              destaque
            >
              <Button className="min-h-11 w-full sm:min-h-0" asChild>
                <Link to="/registro">Começar</Link>
              </Button>
            </CartaoPlano>
          </div>

          <div className="mt-10 max-w-3xl">
            <h3 className="font-medium">Os dois planos incluem</h3>
            <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 text-sm text-muted-foreground sm:grid-cols-2">
              {BENEFICIOS_PLANO.map((beneficio) => (
                <li key={beneficio} className="flex items-start gap-2.5">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  {beneficio}
                </li>
              ))}
            </ul>
          </div>

          <SeloConfianca className="mt-10 w-full max-w-3xl" />
        </section>

        <section id="duvidas" className="mx-auto w-full max-w-3xl scroll-mt-20 px-6 pb-16 sm:pb-24">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Perguntas frequentes</h2>

          <Accordion className="mt-6 w-full">
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
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 py-14 sm:flex-row sm:items-center sm:justify-between sm:py-20">
            <h2 className="max-w-md text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Pronto para organizar seus estudos?
            </h2>
            <Button size="lg" className="min-h-12 sm:min-h-0" asChild>
              <Link to={destinoPrincipal}>
                Começar agora
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 text-sm text-muted-foreground sm:flex-row">
          <span>Brio — {new Date().getFullYear()}</span>
          <nav aria-label="Documentos legais" className="flex flex-wrap justify-center gap-x-2">
            <Link
              to="/termos"
              className="inline-flex min-h-10 items-center px-2 hover:text-foreground hover:underline"
            >
              Termos de Uso
            </Link>
            <Link
              to="/privacidade"
              className="inline-flex min-h-10 items-center px-2 hover:text-foreground hover:underline"
            >
              Política de Privacidade
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
