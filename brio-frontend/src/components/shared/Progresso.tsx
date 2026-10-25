import type { Disciplina } from "@/features/disciplinas/types"
import { Check } from "lucide-react"

interface BarraProgressoProps {
  percentual: number
  rotulo?: string
  corPreenchimento?: string
}

export function BarraProgresso({
  percentual,
  rotulo,
  corPreenchimento = "bg-primary",
}: BarraProgressoProps) {
  const valor = Math.min(100, Math.max(0, Math.round(percentual)))

  return (
    <div className="flex items-center gap-2">
      <div
        role="progressbar"
        aria-valuenow={valor}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={rotulo ?? "Progresso"}
        className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${corPreenchimento}`}
          style={{ width: `${valor}%` }}
        />
      </div>
      <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
        {valor}%
      </span>
    </div>
  )
}

interface ProgressoDisciplinaProps {
  disciplina: Pick<
    Disciplina,
    "total_topicos" | "topicos_concluidos" | "progresso_percentual"
  >
}

export function ProgressoDisciplina({ disciplina }: ProgressoDisciplinaProps) {
  if (disciplina.total_topicos === 0) {
    return <p className="text-xs text-muted-foreground">Sem conteúdos cadastrados</p>
  }

  return (
    <div className="flex flex-col gap-1">
      <BarraProgresso
        percentual={disciplina.progresso_percentual}
        rotulo="Progresso da matéria"
      />
    </div>
  )
}

interface CheckboxConcluidoProps {
  checked: boolean
  rotulo: string
  onChange: (concluido: boolean) => void
}

export function CheckboxConcluido({ checked, rotulo, onChange }: CheckboxConcluidoProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={rotulo}
      title={checked ? "Marcar como não concluído" : "Marcar como concluído"}
      onClick={(evento) => {
        evento.stopPropagation()
        onChange(!checked)
      }}
      className={`size-4 shrink-0 cursor-pointer rounded-full border transition-colors flex items-center justify-center ${
        checked
          ? "bg-primary border-primary text-primary-foreground"
          : "border-muted-foreground/40 bg-background hover:border-primary"
      }`}
    >
      {checked && <Check className="size-3 stroke-[3]" />}
    </button>
  )
}