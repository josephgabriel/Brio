import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { CartaoCota } from "@/components/ia/CartaoCota"
import { GerarResumo } from "@/components/resumos/GerarResumo"
import { ListaResumos } from "@/components/resumos/ListaResumos"
import { VisaoResumo } from "@/components/resumos/VisaoResumo"
import { GRADIENTE_HERO } from "@/features/estatisticas/visual"
import { obterCotaResumos } from "@/features/resumos/api/resumos-api"

type Aba = "novo" | "meus"

export function ResumosPage() {
  const [aba, setAba] = useState<Aba>("novo")
  const [resumoAbertoId, setResumoAbertoId] = useState<number | null>(null)

  const { data: cota } = useQuery({ queryKey: ["cota-resumos"], queryFn: obterCotaResumos })

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
            <p className="text-xs font-medium uppercase tracking-widest text-white/70">Brio-IA</p>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Resumos com IA</h1>
            <p className="mt-2 text-sm text-white/85">
              Transforme apostilas e capítulos em resumos organizados. Use o resumo para revisar,
              e o material original para estudar a fundo.
            </p>
          </div>

          {cota && (
            <CartaoCota
              titulo="Resumos neste mês"
              usadas={cota.usadas}
              limite={cota.limite}
              unidadeSingular="resumo"
              unidadePlural="resumos"
            />
          )}
        </div>
      </section>

      {resumoAbertoId !== null ? (
        <VisaoResumo resumoId={resumoAbertoId} aoVoltar={() => setResumoAbertoId(null)} />
      ) : (
        <>
          <div
            role="group"
            aria-label="Seções"
            className="mx-auto flex w-fit gap-1 rounded-full bg-muted p-1"
          >
            {(["novo", "meus"] as const).map((opcao) => (
              <button
                key={opcao}
                type="button"
                aria-pressed={aba === opcao}
                onClick={() => setAba(opcao)}
                className={`min-h-10 cursor-pointer rounded-full px-5 text-sm font-medium transition-colors sm:min-h-0 sm:py-1.5 ${
                  aba === opcao
                    ? "bg-emerald-500 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opcao === "novo" ? "Novo resumo" : "Meus resumos"}
              </button>
            ))}
          </div>

          {aba === "novo" ? (
            <GerarResumo
              cota={cota}
              aoGerado={(id) => {
                setAba("meus")
                setResumoAbertoId(id)
              }}
            />
          ) : (
            <ListaResumos
              aoAbrir={setResumoAbertoId}
              aoIrParaGerar={() => setAba("novo")}
            />
          )}
        </>
      )}
    </div>
  )
}