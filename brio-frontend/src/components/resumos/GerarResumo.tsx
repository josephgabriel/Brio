import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Sparkles, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { gerarResumo } from "@/features/resumos/api/resumos-api"
import { descricaoNivel, rotuloNivel } from "@/features/resumos/formatacao"
import type { CotaResumos } from "@/features/resumos/types"
import { notificar } from "@/lib/toast"

// Deve acompanhar o limite do servidor (TAMANHO_MAXIMO_PDF_BYTES em domain/regras/resumo_ia.py)
const TAMANHO_MAXIMO_MB = 8
const NIVEIS_RESERVA = ["medio"]

interface GerarResumoProps {
  cota: CotaResumos | undefined
  aoGerado: (resumoId: number) => void
}

export function GerarResumo({ cota, aoGerado }: GerarResumoProps) {
  const queryClient = useQueryClient()
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [nivel, setNivel] = useState("medio")

  // Quem define os níveis válidos é o servidor
  const niveis = cota?.niveis ?? NIVEIS_RESERVA
  const nivelEfetivo = niveis.includes(nivel) ? nivel : niveis[0]
  const cotaEsgotada = cota ? cota.usadas >= cota.limite : false

  const gerar = useMutation({
    mutationFn: () => gerarResumo(arquivo!, nivelEfetivo),
    onSuccess: (resumo) => {
      // O POST já devolve o resumo completo: vai direto para o cache, sem segunda busca
      queryClient.setQueryData(["resumos", "detalhe", resumo.id], resumo)
      queryClient.invalidateQueries({ queryKey: ["resumos", "lista"] })
      queryClient.invalidateQueries({ queryKey: ["cota-resumos"] })
      setArquivo(null)
      notificar.sucesso("Resumo gerado")
      aoGerado(resumo.id)
    },
    onError: (erro) => notificar.erro(erro),
  })

  function escolherArquivo(selecionado: File | null) {
    if (!selecionado) return
    if (selecionado.type !== "application/pdf") {
      notificar.erro("Envie um arquivo PDF.")
      return
    }
    if (selecionado.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
      notificar.erro(`O PDF passa de ${TAMANHO_MAXIMO_MB} MB.`)
      return
    }
    setArquivo(selecionado)
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardContent className="flex flex-col gap-5 p-4 sm:p-6">
        <p className="text-sm text-muted-foreground">
          Envie um PDF (apostila, capítulo, resumo) e a IA organiza o conteúdo em tópicos,
          conceitos-chave e pontos para memorizar.
        </p>

        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary">
          <Upload className="size-6 text-muted-foreground" />
          <span className="break-all text-sm text-muted-foreground">
            {arquivo ? arquivo.name : "Toque para selecionar um PDF"}
          </span>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              escolherArquivo(e.target.files?.[0] ?? null)
              e.target.value = ""
            }}
          />
        </label>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Nível de detalhe</p>
          <div
            role="group"
            aria-label="Nível de detalhe"
            className="grid grid-cols-1 gap-2 sm:grid-cols-3"
          >
            {niveis.map((opcao) => {
              const ativo = nivelEfetivo === opcao
              return (
                <button
                  key={opcao}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => setNivel(opcao)}
                  className={`flex min-h-14 cursor-pointer flex-col items-start gap-0.5 rounded-lg border p-3 text-left transition-colors ${
                    ativo
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <span className="text-sm font-medium">{rotuloNivel(opcao)}</span>
                  <span className="text-xs text-muted-foreground">{descricaoNivel(opcao)}</span>
                </button>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            O resumo usa o começo do PDF (cerca de 20 a 30 páginas de texto). PDFs escaneados, em
            imagem, não funcionam.
          </p>
        </div>

        <Button
          className="h-12 w-full text-base sm:h-9 sm:text-sm"
          onClick={() => gerar.mutate()}
          disabled={!arquivo || cotaEsgotada || gerar.isPending}
        >
          <Sparkles className="size-4" />
          {gerar.isPending ? "Gerando resumo..." : "Gerar resumo"}
        </Button>

        {gerar.isPending && (
          <p className="text-center text-xs text-muted-foreground">
            Isso pode levar até 1 minuto. Não feche esta página.
          </p>
        )}

        {cotaEsgotada && (
          <p className="text-sm text-destructive">
            Você atingiu sua cota mensal de resumos. Ela renova no próximo mês.
          </p>
        )}
      </CardContent>
    </Card>
  )
}