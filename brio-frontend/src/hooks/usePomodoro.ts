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
  segundosFoco: number
}

// Se passou mais que isso entre dois tics, o computador dormiu ou a aba congelou.
// Esse intervalo não conta como estudo.
const LIMITE_SALTO_SEGUNDOS = 120

function duracaoDaFase(fase: FasePomodoro, config: ConfigPomodoro): number {
  if (fase === "foco") return config.focoMinutos * 60
  if (fase === "pausa_curta") return config.pausaCurtaMinutos * 60
  return config.pausaLongaMinutos * 60
}

function estadoInicial(config: ConfigPomodoro): EstadoPomodoro {
  return {
    fase: "foco",
    cicloAtual: 1,
    segundosRestantes: duracaoDaFase("foco", config),
    segundosFoco: 0,
  }
}

function proximoEstado(estado: EstadoPomodoro, config: ConfigPomodoro): EstadoPomodoro {
  if (estado.fase === "foco") {
    const vaiPausaLonga = estado.cicloAtual >= config.ciclosAtePausaLonga
    const proximaFase: FasePomodoro = vaiPausaLonga ? "pausa_longa" : "pausa_curta"
    return {
      ...estado,
      fase: proximaFase,
      segundosRestantes: duracaoDaFase(proximaFase, config),
    }
  }

  const proximoCiclo = estado.fase === "pausa_longa" ? 1 : estado.cicloAtual + 1
  return {
    ...estado,
    fase: "foco",
    cicloAtual: proximoCiclo,
    segundosRestantes: duracaoDaFase("foco", config),
  }
}

function avancarTempo(
  estado: EstadoPomodoro,
  segundos: number,
  config: ConfigPomodoro,
): EstadoPomodoro {
  // Só a fase de foco acumula tempo de estudo, e nunca além do que faltava na fase
  const foco = estado.fase === "foco" ? Math.min(segundos, estado.segundosRestantes) : 0
  const segundosFoco = estado.segundosFoco + foco

  if (estado.segundosRestantes > segundos) {
    return { ...estado, segundosFoco, segundosRestantes: estado.segundosRestantes - segundos }
  }
  return { ...proximoEstado(estado, config), segundosFoco }
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
      // O espalhamento garante que estados salvos antes desta versão ganhem segundosFoco: 0
      if (salvo) return { ...estadoInicial(config), ...JSON.parse(salvo) }
    }
    return estadoInicial(config)
  })
  const [pausado, setPausado] = useState(false)
  const primeiraRenderizacao = useRef(true)
  const idAnterior = useRef(idSessao)
  const ultimoTick = useRef(Date.now())

  useEffect(() => {
    if (idSessao !== idAnterior.current) {
      idAnterior.current = idSessao
      setEstado(estadoInicial(config))
      setPausado(false)
    }
  }, [idSessao, config])

  useEffect(() => {
    if (pausado || idSessao === null) return

    // Ao (re)começar a contar, o tempo em que ficou parado não entra na conta
    ultimoTick.current = Date.now()

    const intervalo = setInterval(() => {
      const agora = Date.now()
      const decorrido = Math.floor((agora - ultimoTick.current) / 1000)
      if (decorrido < 1) return

      if (decorrido > LIMITE_SALTO_SEGUNDOS) {
        ultimoTick.current = agora
        return
      }

      // Soma só os segundos inteiros e guarda a sobra, para não perder tempo a cada tic
      ultimoTick.current += decorrido * 1000
      setEstado((atual) => avancarTempo(atual, decorrido, config))
    }, 1000)

    return () => clearInterval(intervalo)
  }, [pausado, config, idSessao])

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
    if (idSessao === null) return
    tocarAlarme()
  }, [estado.fase])

  function pularFase() {
    setEstado((atual) => proximoEstado(atual, config))
  }

  function reiniciar() {
    // Reiniciar zera o ciclo do Pomodoro, mas não apaga o tempo que você já estudou
    setEstado((atual) => ({ ...estadoInicial(config), segundosFoco: atual.segundosFoco }))
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
    segundosFoco: estado.segundosFoco,
    pausar: () => setPausado(true),
    retomar: () => setPausado(false),
    pularFase,
    reiniciar,
  }
}