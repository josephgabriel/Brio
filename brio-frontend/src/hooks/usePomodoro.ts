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

// Navegadores em segundo plano atrasam os timers em até ~1 min. Acima disso,
// o aparelho foi suspenso (tela bloqueada, tampa fechada): perguntamos ao usuário.
const LIMITE_SALTO_SEGUNDOS = 90

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
    return { ...estado, fase: proximaFase, segundosRestantes: duracaoDaFase(proximaFase, config) }
  }

  const proximoCiclo = estado.fase === "pausa_longa" ? 1 : estado.cicloAtual + 1
  return {
    ...estado,
    fase: "foco",
    cicloAtual: proximoCiclo,
    segundosRestantes: duracaoDaFase("foco", config),
  }
}

// Avança `segundos`, atravessando quantas fases forem necessárias.
// Só a fase de foco acumula tempo de estudo.
function avancarTempo(estado: EstadoPomodoro, segundos: number, config: ConfigPomodoro): EstadoPomodoro {
  let atual = estado
  let restante = segundos
  let guarda = 0

  while (restante > 0 && guarda < 1000) {
    guarda += 1
    const consumo = Math.min(restante, atual.segundosRestantes)
    const foco = atual.fase === "foco" ? consumo : 0
    restante -= consumo

    if (consumo >= atual.segundosRestantes) {
      atual = { ...proximoEstado(atual, config), segundosFoco: atual.segundosFoco + foco }
    } else {
      atual = {
        ...atual,
        segundosRestantes: atual.segundosRestantes - consumo,
        segundosFoco: atual.segundosFoco + foco,
      }
    }
  }
  return atual
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
      if (salvo) return { ...estadoInicial(config), ...JSON.parse(salvo) }
    }
    return estadoInicial(config)
  })
  const [pausado, setPausado] = useState(false)
  const [lacunaSegundos, setLacunaSegundos] = useState<number | null>(null)
  const primeiraRenderizacao = useRef(true)
  const idAnterior = useRef(idSessao)
  const ultimoTick = useRef(Date.now())

  useEffect(() => {
    if (idSessao !== idAnterior.current) {
      idAnterior.current = idSessao
      setEstado(estadoInicial(config))
      setPausado(false)
      setLacunaSegundos(null)
    }
  }, [idSessao, config])

  useEffect(() => {
    if (pausado || idSessao === null) return

    ultimoTick.current = Date.now()

    const intervalo = setInterval(() => {
      const agora = Date.now()
      const decorrido = Math.floor((agora - ultimoTick.current) / 1000)
      if (decorrido < 1) return

      if (decorrido > LIMITE_SALTO_SEGUNDOS) {
        // Aparelho suspenso: guarda o tempo ausente e deixa o usuário decidir
        ultimoTick.current = agora
        setLacunaSegundos((anterior) => (anterior ?? 0) + decorrido)
        return
      }

      ultimoTick.current += decorrido * 1000
      setEstado((atual) => avancarTempo(atual, decorrido, config))
    }, 1000)

    return () => clearInterval(intervalo)
  }, [pausado, config, idSessao])

  useEffect(() => {
    if (chave) localStorage.setItem(chave, JSON.stringify(estado))
  }, [estado, chave])

  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false
      return
    }
    if (idSessao === null) return
    tocarAlarme()
  }, [estado.fase])

  function resolverLacuna(contar: boolean) {
    if (contar && lacunaSegundos) {
      setEstado((atual) => avancarTempo(atual, lacunaSegundos, config))
    }
    setLacunaSegundos(null)
  }

  function pularFase() {
    setEstado((atual) => proximoEstado(atual, config))
  }

  function reiniciar() {
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
    lacunaSegundos,
    resolverLacuna,
    pausar: () => setPausado(true),
    retomar: () => setPausado(false),
    pularFase,
    reiniciar,
  }
}