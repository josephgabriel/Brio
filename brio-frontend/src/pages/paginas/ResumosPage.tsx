import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { CartaoCota } from "@/components/ia/CartaoCota"
import { Abas } from "@/components/shared/Abas"
import { HeroPagina } from "@/components/shared/HeroPagina"
import { GerarResumo } from "@/components/resumos/GerarResumo"
import { ListaResumos } from "@/components/resumos/ListaResumos"
import { VisaoResumo } from "@/components/resumos/VisaoResumo"
import { obterCotaResumos } from "@/features/resumos/api/resumos-api"

type Aba = "novo" | "meus"

export function ResumosPage() {
  const [aba, setAba] = useState<Aba>("novo")
  const [resumoAbertoId, setResumoAbertoId] = useState<number | null>(null)

  const { data: cota } = useQuery({ queryKey: ["cota-resumos"], queryFn: obterCotaResumos })

  return (
    <div className="flex flex-col gap-8">
      <HeroPagina
        rotulo="Brio-IA"
        titulo="Resumos com IA"
        texto="Transforme apostilas e capítulos em resumos organizados. Use o resumo para revisar, e o material original para estudar a fundo."
      >
        {cota && (
          <CartaoCota
            titulo="Resumos neste mês"
            usadas={cota.usadas}
            limite={cota.limite}
            unidadeSingular="resumo"
            unidadePlural="resumos"
          />
        )}
      </HeroPagina>

      {resumoAbertoId !== null ? (
        <VisaoResumo resumoId={resumoAbertoId} aoVoltar={() => setResumoAbertoId(null)} />
      ) : (
        <>
          <Abas<Aba>
            className="mx-auto"
            rotuloGrupo="Seções"
            valor={aba}
            aoMudar={setAba}
            opcoes={[
              { id: "novo", rotulo: "Novo resumo" },
              { id: "meus", rotulo: "Meus resumos" },
            ]}
          />

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
