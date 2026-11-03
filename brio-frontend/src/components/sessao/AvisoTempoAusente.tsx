import { Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useSessaoAtiva } from "@/features/sessoes/sessao-ativa-context"

export function AvisoTempoAusente() {
  const { sessaoAtiva, pomodoro } = useSessaoAtiva()
  const lacuna = pomodoro.lacunaSegundos
  if (!sessaoAtiva || lacuna === null) return null

  const minutos = Math.max(1, Math.round(lacuna / 60))

  return (
    <div
      role="alert"
      className="mb-4 flex flex-col gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <Clock aria-hidden className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div>
          <p className="text-sm font-medium">Você ficou {minutos} min longe da tela</p>
          <p className="text-xs text-muted-foreground">
            Estudou nesse tempo? Escolha se ele conta na sessão.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => pomodoro.resolverLacuna(true)}>
          Contar
        </Button>
        <Button size="sm" variant="outline" onClick={() => pomodoro.resolverLacuna(false)}>
          Não contar
        </Button>
      </div>
    </div>
  )
}