import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

interface CartaoNumeroProps {
  icone: LucideIcon
  rotulo: string
  valor: ReactNode
}

export function CartaoNumero({ icone: Icone, rotulo, valor }: CartaoNumeroProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <Icone className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold leading-none tabular-nums">{valor}</p>
        <p className="mt-1 text-xs text-muted-foreground">{rotulo}</p>
      </div>
    </div>
  )
}