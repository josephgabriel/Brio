import { useEffect, useRef, useState } from "react"

export type FasePomodoro = "foco" | "pausa_curta" | "pausa_longa"

export interface ConfigPomodoro {
  focoMinutos: number
  pausaCurtaMinutos: number
  pausaLongaMinutos: number
  ciclosAtePausaLonga: number
}

interface EstadoPomodoro {
  fase: FasePomodoro
  cicloAtual: number
  segundosRestantes: number
}

function duracaoDaFase(fase: FasePomodoro, config: ConfigPomodoro): number {
  if (fase === "foco") return config.focoMinutos * 60
  if (fase === "pausa_curta") return config.pausaCurtaMinutos * 60
  return config.pausaLongaMinutos * 60
}

function proximoEstado(estado: EstadoPomodoro, config: ConfigPomodoro): EstadoPomodoro {
  if (estado.fase === "foco") {
    const vaiPausaLonga = estado.cicloAtual >= config.ciclosAtePausaLonga
    const proximaFase: FasePomodoro = vaiPausaLonga ? "pausa_longa" : "pausa_curta"
    return {
      fase: proximaFase,
      cicloAtual: estado.cicloAtual,
      segundosRestantes: duracaoDaFase(proximaFase, config),
    }
  }

  const proximoCiclo = estado.fase === "pausa_longa" ? 1 : estado.cicloAtual + 1
  return { fase: "foco", cicloAtual: proximoCiclo, segundosRestantes: duracaoDaFase("foco", config) }
}

function tocarAlarme() {
  const contexto = new AudioContext()
  const oscilador = contexto.createOscillator()
  const ganho = contexto.createGain()

  oscilador.frequency.value = 880
  oscilador.connect(ganho)
  ganho.connect(contexto.destination)

  ganho.gain.setValueAtTime(0.2, contexto.currentTime)
  ganho.gain.exponentialRampToValueAtTime(0.001, contexto.currentTime + 0.8)

  oscilador.start()
  oscilador.stop(contexto.currentTime + 0.8)
}

export function usePomodoro(config: ConfigPomodoro, idSessao: number | null) {
  const chave = idSessao ? `brio_pomodoro_estado_${idSessao}` : undefined

  const [estado, setEstado] = useState<EstadoPomodoro>(() => {
    if (chave) {
      const salvo = localStorage.getItem(chave)
      if (salvo) return JSON.parse(salvo)
    }
    return { fase: "foco", cicloAtual: 1, segundosRestantes: duracaoDaFase("foco", config) }
  })
  const [pausado, setPausado] = useState(false)
  const idAnterior = useRef(idSessao)
  const primeiraRenderizacao = useRef(true)

  useEffect(() => {
    if (pausado) return

    const intervalo = setInterval(() => {
      setEstado((atual) =>
        atual.segundosRestantes > 1
          ? { ...atual, segundosRestantes: atual.segundosRestantes - 1 }
          : proximoEstado(atual, config),
      )
    }, 1000)

    return () => clearInterval(intervalo)
  }, [pausado, config])

  useEffect(() => {
    if (chave) {
      localStorage.setItem(chave, JSON.stringify(estado))
    }
  }, [estado, chave])

  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false
      return
    }
    tocarAlarme()
  }, [estado.fase])

  useEffect(() => {
    if (idSessao !== idAnterior.current) {
      idAnterior.current = idSessao
      setEstado({ fase: "foco", cicloAtual: 1, segundosRestantes: duracaoDaFase("foco", config) })
      setPausado(false)
    }
  }, [idSessao, config])

  function pularFase() {
    setEstado((atual) => proximoEstado(atual, config))
  }

  function reiniciar() {
    setEstado({ fase: "foco", cicloAtual: 1, segundosRestantes: duracaoDaFase("foco", config) })
    setPausado(false)
  }

  const duracaoTotal = duracaoDaFase(estado.fase, config)
  const progresso = 1 - estado.segundosRestantes / duracaoTotal

  const minutos = Math.floor(estado.segundosRestantes / 60)
  const segundos = estado.segundosRestantes % 60
  const tempoFormatado = `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`

  return {
    fase: estado.fase,
    cicloAtual: estado.cicloAtual,
    tempoFormatado,
    progresso,
    pausado,
    pausar: () => setPausado(true),
    retomar: () => setPausado(false),
    pularFase,
    reiniciar,
  }
}