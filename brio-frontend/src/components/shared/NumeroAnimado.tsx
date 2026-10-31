import { useContagemAnimada } from "@/hooks/useContagemAnimada"

interface NumeroAnimadoProps {
  valor: number
  casas?: number
  sufixo?: string
  className?: string
}

export function NumeroAnimado({ valor, casas = 0, sufixo = "", className = "" }: NumeroAnimadoProps) {
  const animado = useContagemAnimada(valor)

  function formatar(numero: number): string {
    const texto = numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: casas,
    })
    return `${texto}${sufixo}`
  }

  return (
    <>
      <span aria-hidden="true" className={`tabular-nums ${className}`}>
        {formatar(animado)}
      </span>
      <span className="sr-only">{formatar(valor)}</span>
    </>
  )
}