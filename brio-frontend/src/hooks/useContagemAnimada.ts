import { useEffect, useRef, useState } from "react"

function prefereMovimentoReduzido(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function useContagemAnimada(alvo: number, duracaoMs = 800): number {
  const reduzido = prefereMovimentoReduzido()
  const [valor, setValor] = useState(0)
  const valorAtual = useRef(0)

  useEffect(() => {
    if (reduzido) return

    // Parte de onde o número está agora. Se o alvo mudar no meio da animação,
    // ela continua dali, sem voltar para zero.
    const inicio = valorAtual.current
    if (inicio === alvo) return

    const instanteInicial = performance.now()
    let quadro = 0

    function passo(agora: number) {
      const progresso = Math.min(1, Math.max(0, (agora - instanteInicial) / duracaoMs))
      const suave = 1 - Math.pow(1 - progresso, 3)
      const atual = progresso >= 1 ? alvo : inicio + (alvo - inicio) * suave

      valorAtual.current = atual
      setValor(atual)
      if (progresso < 1) quadro = requestAnimationFrame(passo)
    }

    quadro = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro)
  }, [alvo, duracaoMs, reduzido])

  return reduzido ? alvo : valor
}