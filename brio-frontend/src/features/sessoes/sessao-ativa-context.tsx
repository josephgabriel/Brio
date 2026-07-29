import { createContext, useContext, useState, type ReactNode } from "react"

import { type ConfigPomodoro, usePomodoro } from "@/hooks/usePomodoro"

export interface SessaoAtiva {
  id: number
  provaId: number
  topicoId: number
  iniciada_em: string
  disciplina: string
  assunto: string
  configPomodoro: ConfigPomodoro
}

const CHAVE_SESSAO_ATIVA = "brio_sessao_ativa"

const CONFIG_PADRAO: ConfigPomodoro = {
  focoMinutos: 25,
  pausaCurtaMinutos: 5,
  pausaLongaMinutos: 10,
  ciclosAtePausaLonga: 2,
}

function lerSessaoAtiva(): SessaoAtiva | null {
  const salvo = localStorage.getItem(CHAVE_SESSAO_ATIVA)
  return salvo ? JSON.parse(salvo) : null
}

interface SessaoAtivaContextType {
  sessaoAtiva: SessaoAtiva | null
  pomodoro: ReturnType<typeof usePomodoro>
  iniciarSessaoAtiva: (sessao: SessaoAtiva) => void
  encerrarSessaoAtiva: () => void
}

const SessaoAtivaContext = createContext<SessaoAtivaContextType | undefined>(undefined)

export function SessaoAtivaProvider({ children }: { children: ReactNode }) {
  const [sessaoAtiva, setSessaoAtiva] = useState<SessaoAtiva | null>(lerSessaoAtiva)

  const pomodoro = usePomodoro(
    sessaoAtiva?.configPomodoro ?? CONFIG_PADRAO,
    sessaoAtiva?.id ?? null,
  )

  function iniciarSessaoAtiva(sessao: SessaoAtiva) {
    localStorage.setItem(CHAVE_SESSAO_ATIVA, JSON.stringify(sessao))
    setSessaoAtiva(sessao)
  }

  function encerrarSessaoAtiva() {
    localStorage.removeItem(CHAVE_SESSAO_ATIVA)
    if (sessaoAtiva) {
      localStorage.removeItem(`brio_pomodoro_estado_${sessaoAtiva.id}`)
    }
    setSessaoAtiva(null)
  }

  return (
    <SessaoAtivaContext.Provider
      value={{ sessaoAtiva, pomodoro, iniciarSessaoAtiva, encerrarSessaoAtiva }}
    >
      {children}
    </SessaoAtivaContext.Provider>
  )
}

export function useSessaoAtiva() {
  const context = useContext(SessaoAtivaContext)
  if (context === undefined) {
    throw new Error("useSessaoAtiva precisa ser usado dentro de um SessaoAtivaProvider")
  }
  return context
}