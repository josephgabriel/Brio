import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, FileText, Loader2, Sparkles, Upload, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  gerarAvaliacao,
  gerarQuestoes,
  obterCotaIA,
  responderQuestao,
} from "@/features/ia/api/ia-api"
import type { Questao, ResultadoResposta } from "@/features/ia/types"

export function QuestoesPage() {
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [materialId, setMaterialId] = useState<number | null>(null)
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [indiceAtual, setIndiceAtual] = useState(0)
  const [respostaSelecionada, setRespostaSelecionada] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ResultadoResposta | null>(null)

  const queryClient = useQueryClient()

  const { data: cota } = useQuery({ queryKey: ["cota-ia"], queryFn: obterCotaIA })

  const gerar = useMutation({
    mutationFn: () => gerarQuestoes(arquivo!),
    onSuccess: (dados) => {
      setMaterialId(dados.material_id)
      setQuestoes(dados.questoes)
      setIndiceAtual(0)
      setRespostaSelecionada(null)
      setResultado(null)
      queryClient.invalidateQueries({ queryKey: ["cota-ia"] })
    },
  })

  const responder = useMutation({
    mutationFn: (alternativa: string) =>
      responderQuestao(questoes[indiceAtual].id, alternativa),
    onSuccess: (res) => setResultado(res),
  })

  const avaliar = useMutation({
    mutationFn: () => gerarAvaliacao(materialId!),
  })

  function proximaQuestao() {
    setIndiceAtual((i) => i + 1)
    setRespostaSelecionada(null)
    setResultado(null)
  }

  function handleResponder() {
    if (!respostaSelecionada || responder.isPending) return
    responder.mutate(respostaSelecionada)
  }

  function reiniciarFluxo() {
    setQuestoes([])
    setArquivo(null)
    setMaterialId(null)
    setIndiceAtual(0)
    setRespostaSelecionada(null)
    setResultado(null)
    avaliar.reset()
  }

  const cotaEsgotada = cota ? cota.usadas >= cota.limite : false
  const quizFinalizado = questoes.length > 0 && indiceAtual >= questoes.length

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">BRIO IA - Gerador de Questões</h1>
        {cota && (
          <p className="text-sm text-muted-foreground">
            {cota.usadas} de {cota.limite} gerações usadas este mês
          </p>
        )}
      </div>

      {questoes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <p className="text-sm text-muted-foreground">
              Envie um PDF (resumo, apostila, capítulo) para o Brio-IA e responda 5 questões de múltipla
              escolha sobre o conteúdo.
            </p>

            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-center hover:border-primary">
              {arquivo ? (
                <div className="flex items-center gap-2 text-foreground">
                  <FileText className="size-6 text-primary shrink-0" />
                  <span className="text-sm font-medium">{arquivo.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="size-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Clique para selecionar um PDF
                  </span>
                </>
              )}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
              />
            </label>

            <Button
              onClick={() => gerar.mutate()}
              disabled={!arquivo || cotaEsgotada || gerar.isPending}
            >
              {gerar.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Gerando questões...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Gerar questões
                </>
              )}
            </Button>

            {cotaEsgotada && (
              <p className="text-sm text-destructive">
                Você atingiu sua cota mensal de gerações. Ela renova no próximo mês.
              </p>
            )}
            {gerar.isError && (
              <p className="text-sm text-destructive">{gerar.error.message}</p>
            )}
          </CardContent>
        </Card>
      )}

      {questoes.length > 0 && !quizFinalizado && (
        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Questão {indiceAtual + 1} de {questoes.length}
              </p>
            </div>
            <p className="font-medium">{questoes[indiceAtual].enunciado}</p>

            <div className="flex flex-col gap-2">
              {Object.entries(questoes[indiceAtual].alternativas).map(([letra, texto]) => {
                const ehCorreta = resultado && letra === resultado.resposta_correta
                const ehSelecionadaErrada =
                  resultado && letra === respostaSelecionada && !resultado.correta

                let estilosBorda = "border-border"
                if (respostaSelecionada === letra && !resultado) {
                  estilosBorda = "border-primary bg-primary/5"
                }
                if (ehCorreta) {
                  estilosBorda = "border-status-excelente bg-status-excelente/10"
                }
                if (ehSelecionadaErrada) {
                  estilosBorda = "border-status-critico bg-status-critico/10"
                }

                return (
                  <button
                    key={letra}
                    type="button"
                    disabled={!!resultado}
                    onClick={() => setRespostaSelecionada(letra)}
                    className={`flex items-center gap-2 rounded-md border p-3 text-left text-sm transition-colors ${estilosBorda}`}
                  >
                    {ehCorreta && <CheckCircle2 className="size-4 text-status-excelente shrink-0" />}
                    {ehSelecionadaErrada && <XCircle className="size-4 text-status-critico shrink-0" />}
                    <span className="font-medium">{letra})</span> {texto}
                  </button>
                )
              })}
            </div>

            {resultado && (
              <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                {resultado.explicacao}
              </p>
            )}

            {!resultado ? (
              <Button onClick={handleResponder} disabled={!respostaSelecionada || responder.isPending}>
                {responder.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Responder"
                )}
              </Button>
            ) : (
              <Button onClick={proximaQuestao}>
                {indiceAtual + 1 < questoes.length ? "Próxima questão" : "Ver resultado"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {quizFinalizado && !avaliar.data && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <p className="font-medium">Você concluiu o quiz!</p>
            <Button onClick={() => avaliar.mutate()} disabled={avaliar.isPending}>
              {avaliar.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Gerando diagnóstico...
                </>
              ) : (
                "Gerar diagnóstico com IA"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {avaliar.data && (
        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            <p className="font-medium">
              Você acertou {avaliar.data.total_acertos} de {avaliar.data.total_questoes} questões
            </p>
            <p className="text-sm text-muted-foreground">{avaliar.data.diagnostico}</p>
            <Button onClick={reiniciarFluxo} variant="outline">
              Gerar novas questões
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}