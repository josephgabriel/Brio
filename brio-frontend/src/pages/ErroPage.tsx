import { useEffect } from "react"
import { useRouteError } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function ErroPage() {
  const erro = useRouteError()

  useEffect(() => {
    console.error("Erro inesperado na tela:", erro)
  }, [erro])

  const detalhe = erro instanceof Error ? erro.message : null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-destructive">
        Algo deu errado
      </p>
      <h1 className="text-3xl font-semibold sm:text-4xl">Não conseguimos abrir esta tela</h1>
      <p className="max-w-md text-muted-foreground">
        Isso não foi culpa sua. Tente recarregar a página. Se continuar acontecendo, volte ao
        início e tente de novo em instantes.
      </p>

      {import.meta.env.DEV && detalhe && (
        <pre className="max-w-xl overflow-x-auto rounded-lg border border-border bg-muted p-3 text-left text-xs">
          {detalhe}
        </pre>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        <Button variant="outline" asChild>
          <a href="/">Ir para o início</a>
        </Button>
      </div>
    </div>
  )
}