interface LiquidTimerProps {
  progresso: number
  tempoFormatado: string
  label: string
}

const RAIO = 52
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

/**
 * Cronômetro em anel, o mesmo desenho da prévia da landing page.
 * `progresso` vai de 0 a 1 e preenche o anel no sentido horário, a partir do topo.
 */
export function LiquidTimer({ progresso, tempoFormatado, label }: LiquidTimerProps) {
  const preenchido = Math.min(1, Math.max(0, progresso))

  return (
    <div
      role="timer"
      aria-label={`${label}: ${tempoFormatado}`}
      className="relative size-56 sm:size-64"
    >
      <svg viewBox="0 0 120 120" aria-hidden className="size-full -rotate-90">
        <circle cx="60" cy="60" r={RAIO} className="fill-none stroke-border" strokeWidth="6" />
        <circle
          cx="60"
          cy="60"
          r={RAIO}
          className="fill-none stroke-primary transition-[stroke-dashoffset] duration-1000 ease-linear motion-reduce:transition-none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={CIRCUNFERENCIA * (1 - preenchido)}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span className="text-5xl font-semibold tabular-nums">{tempoFormatado}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}