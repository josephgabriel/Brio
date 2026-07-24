interface LiquidTimerProps {
  progresso: number
  tempoFormatado: string
  label: string
}

export function LiquidTimer({ progresso, tempoFormatado, label }: LiquidTimerProps) {
  return (
    <div className="relative h-64 w-64 overflow-hidden rounded-[2.5rem] border-4 border-border bg-muted">
      <div
        className="absolute bottom-0 left-0 w-full bg-primary transition-all duration-1000 ease-linear"
        style={{ height: `${progresso * 100}%` }}
      />
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-white"
        style={{ mixBlendMode: "difference" }}
      >
        <span className="font-mono text-5xl font-bold tabular-nums">{tempoFormatado}</span>
        <span className="text-sm uppercase tracking-wide">{label}</span>
      </div>
    </div>
  )
}