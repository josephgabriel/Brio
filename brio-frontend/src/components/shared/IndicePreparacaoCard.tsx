interface IndicePreparacaoCardProps {
  indice: number | null
  classificacao: string | null
  motivos: string[]
}

const CONFIG_CLASSIFICACAO: Record<string, { emoji: string; label: string; cor: string }> = {
  excelente: { emoji: "🟢", label: "Excelente", cor: "text-status-excelente" },
  atencao: { emoji: "🟡", label: "Atenção", cor: "text-status-atencao" },
  risco: { emoji: "🟠", label: "Em risco", cor: "text-status-risco" },
  critico: { emoji: "🔴", label: "Crítico", cor: "text-status-critico" },
}

export function IndicePreparacaoCard({
  indice,
  classificacao,
  motivos,
}: IndicePreparacaoCardProps) {
  if (indice === null || classificacao === null) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-2 text-lg font-semibold">Índice de Preparação</h2>
        <p className="text-sm text-muted-foreground">
          Cadastre matérias nesta prova para calcular seu índice de preparação.
        </p>
      </div>
    )
  }

  const config = CONFIG_CLASSIFICACAO[classificacao]

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Índice de Preparação</h2>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl">{config.emoji}</span>
        <div>
          <p className={`text-xl font-semibold ${config.cor}`}>{config.label}</p>
          <p className="text-sm text-muted-foreground">Score: {indice}/100</p>
        </div>
      </div>
      <ul className="flex flex-col gap-1">
        {motivos.map((motivo) => (
          <li key={motivo} className="text-sm text-muted-foreground">
            • {motivo}
          </li>
        ))}
      </ul>
    </div>
  )
}