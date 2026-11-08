interface CartaoCotaProps {
  titulo: string
  usadas: number
  limite: number
  unidadeSingular: string
  unidadePlural: string
}

export function CartaoCota({
  titulo,
  usadas,
  limite,
  unidadeSingular,
  unidadePlural,
}: CartaoCotaProps) {
  const restantes = Math.max(0, limite - usadas)
  const percentual = limite > 0 ? Math.min(100, Math.round((usadas / limite) * 100)) : 0

  return (
    <div className="w-full rounded-2xl bg-black/20 p-5 backdrop-blur-sm sm:w-64">
      <p className="text-xs font-medium uppercase tracking-widest text-white/70">{titulo}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-4xl font-semibold leading-none tabular-nums">{usadas}</span>
        <span className="text-sm text-white/70">de {limite}</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percentual}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={titulo}
        className="mt-3 h-2 overflow-hidden rounded-full bg-white/20"
      >
        <div
          className="h-full rounded-full bg-white transition-all duration-700"
          style={{ width: `${percentual}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-white/75">
        {restantes === 0
          ? "Cota esgotada. Renova no próximo mês."
          : `Restam ${restantes} ${restantes === 1 ? unidadeSingular : unidadePlural}.`}
      </p>
    </div>
  )
}