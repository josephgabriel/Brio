import { useEffect } from "react"
import { useRouteError } from "react-router-dom"
import { TriangleAlert } from "lucide-react"

import { TelaStatus } from "@/components/shared/TelaStatus"
import { Button } from "@/components/ui/button"

export function ErroPage() {
  const erro = useRouteError()

  useEffect(() => {
    console.error("Erro inesperado na tela:", erro)
  }, [erro])

  const detalhe = erro instanceof Error ? erro.message : null

  return (
    <TelaStatus
      icone={TriangleAlert}
      tom="erro"
      titulo="Não conseguimos abrir esta tela"
      texto="Algo deu errado, e isso não foi culpa sua. Tente recarregar a página. Se continuar acontecendo, volte ao início e tente de novo em instantes."
      detalhe={
        import.meta.env.DEV && detalhe ? (
          <pre className="max-w-xl overflow-x-auto rounded-lg border border-border bg-muted p-3 text-left text-xs">
            {detalhe}
          </pre>
        ) : null
      }
    >
      <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      <Button variant="outline" asChild>
        <a href="/">Ir para o início</a>
      </Button>
    </TelaStatus>
  )
}
