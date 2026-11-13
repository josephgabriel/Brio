import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { GerarEPraticar } from "@/components/ia/GerarEPraticar"
import { CartaoCota } from "@/components/ia/CartaoCota"
import { HistoricoMateriais } from "@/components/ia/HistoricoMateriais"
import { Abas } from "@/components/shared/Abas"
import { HeroPagina } from "@/components/shared/HeroPagina"
import { obterCotaIA } from "@/features/ia/api/ia-api"

type Aba = "gerar" | "historico"

export function QuestoesPage() {
  const [aba, setAba] = useState<Aba>("gerar")
  const { data: cota } = useQuery({ queryKey: ["cota-ia"], queryFn: obterCotaIA })

  return (
    <div className="flex flex-col gap-8">
      <HeroPagina
        rotulo="Brio-IA"
        titulo="Questões com IA"
        texto="Transforme o seu material em questões para praticar. Responder sem consultar o texto é o que mais ajuda a fixar o conteúdo."
      >
        {cota && (
          <CartaoCota
            titulo="Gerações neste mês"
            usadas={cota.usadas}
            limite={cota.limite}
            unidadeSingular="geração"
            unidadePlural="gerações"
          />
        )}
      </HeroPagina>

      <Abas<Aba>
        className="mx-auto"
        rotuloGrupo="Seções"
        valor={aba}
        aoMudar={setAba}
        opcoes={[
          { id: "gerar", rotulo: "Gerar e praticar" },
          { id: "historico", rotulo: "Histórico" },
        ]}
      />

      {/* A aba "Gerar" fica montada (só escondida): se saísse da tela, um quiz em andamento se perderia */}
      <div className={aba === "gerar" ? "" : "hidden"}>
        <GerarEPraticar cota={cota} />
      </div>

      {aba === "historico" && <HistoricoMateriais aoIrParaGerar={() => setAba("gerar")} />}
    </div>
  )
}
