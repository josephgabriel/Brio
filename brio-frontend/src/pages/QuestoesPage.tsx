import { useQuery } from "@tanstack/react-query"

import { GerarEPraticar } from "@/components/ia/GerarEPraticar"
import { GRADIENTE_HERO } from "@/features/estatisticas/visual"
import { obterCotaIA } from "@/features/ia/api/ia-api"

export function QuestoesPage() {
  const { data: cota } = useQuery({ queryKey: ["cota-ia"], queryFn: obterCotaIA })

  const restantes = cota ? Math.max(0, cota.limite - cota.usadas) : null
  const percentual = cota && cota.limite > 0 ? Math.round((cota.usadas / cota.limite) * 100) : 0

  return (
    <div className="flex flex-col gap-8">
      <section
        className="relative overflow-hidden rounded-3xl p-5 text-white sm:p-8"
        style={{ background: GRADIENTE_HERO }}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 size-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 right-28 size-40 rounded-full bg-white/10" />

        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-md">
            <p className="text-xs font-medium uppercase tracking-widest text-white/70">
              BrioIA
            </p>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Questões com IA</h1>
            <p className="mt-2 text-sm text-white/85">
              Transforme o seu material em questões para praticar. Responder sem consultar o
              texto é o que mais ajuda a fixar o conteúdo.
            </p>
          </div>

          {cota && (
            <div className="w-full rounded-2xl bg-black/20 p-5 backdrop-blur-sm sm:w-64">
              <p className="text-xs font-medium uppercase tracking-widest text-white/70">
                Gerações neste mês
              </p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-4xl font-semibold leading-none tabular-nums">
                  {cota.usadas}
                </span>
                <span className="text-sm text-white/70">de {cota.limite}</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={percentual}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Cota de gerações do mês"
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
                  : `Restam ${restantes} ${restantes === 1 ? "geração" : "gerações"}.`}
              </p>
            </div>
          )}
        </div>
      </section>

      <GerarEPraticar cota={cota} />
    </div>
  )
}