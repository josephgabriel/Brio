import { useEffect, useState } from "react"

export function useCronometro(iniciadaEm: string | null) {
  const [decorridoSegundos, setDecorridoSegundos] = useState(0)

  useEffect(() => {
    if (!iniciadaEm) return

    function atualizar() {
      const inicio = new Date(iniciadaEm).getTime()
      const agora = Date.now()
      setDecorridoSegundos(Math.floor((agora - inicio) / 1000))
    }

    atualizar()
    const intervalo = setInterval(atualizar, 1000)

    return () => clearInterval(intervalo)
  }, [iniciadaEm])

  const horas = Math.floor(decorridoSegundos / 3600)
  const minutos = Math.floor((decorridoSegundos % 3600) / 60)
  const segundos = decorridoSegundos % 60

  return [horas, minutos, segundos]
    .map((n) => String(n).padStart(2, "0"))
    .join(":")
}