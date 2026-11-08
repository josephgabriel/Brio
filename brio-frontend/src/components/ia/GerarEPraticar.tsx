import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Sparkles, Upload, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { plural } from "@/features/cronograma/semana"
import { gerarAvaliacao, gerarQuestoes, responderQuestao } from "@/features/ia/api/ia-api"
import type { CotaIA, Questao, ResultadoResposta } from "@/features/ia/types"
import { notificar } from "@/lib/toast"

// Deve acompanhar o limite do servidor (TAMANHO_MAXIMO_PDF em routers/ia.py)
const TAMANHO_MAXIMO_MB = 8
const QUANTIDADES_RESERVA = [5]

interface GerarEPraticarProps {
  cota: CotaIA | undefined
}

export function GerarEPraticar({ cota }: GerarEPraticarProps) {
  const queryClient = useQueryClient()

  const [arquivo, setArquivo] = useState<File | null>(null)
  const [quantidade, setQuantidade] = useState(5)
  const [materialId, setMaterialId] = useState<number | null>(null)
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [indiceAtual, setIndiceAtual] = useState(0)
  const [respostaSelecionada, setRespostaSelecionada] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ResultadoResposta | null>(null)
  const [acertos, setAcertos] = useState(0)

  // Quem define as quantidades válidas é o servidor. Se a lista mudar lá, aqui acompanha.
  const quantidadesPermitidas = cota?.quantidades_permitidas ?? QUANTIDADES_RESERVA
  const quantidadeEfetiva = quantidadesPermitidas.includes(quantidade)
    ? quantidade
    : quantidadesPermitidas[0]
  const cotaEsgotada = cota ? cota.usadas >= cota.limite : false

  const gerar = useMutation({
    mutationFn: () => gerarQuestoes(arquivo!, quantidadeEfetiva),
    onSuccess: (dados) => {
      setMaterialId(dados.material_id)
      setQuestoes(dados.questoes)
      setIndiceAtual(0)
      setRespostaSelecionada(null)
      setResultado(null)
      setAcertos(0)
      queryClient.invalidateQueries({ queryKey: ["cota-ia"] })
      queryClient.invalidateQueries({ queryKey: ["ia-materiais"] })
      notificar.sucesso(`${plural(dados.questoes.length, "questão gerada", "questões geradas")}`)
    },
    onError: (erro) => notificar.erro(erro),
  })

  const responder = useMutation({
    mutationFn: (alternativa: string) => responderQuestao(questoes[indiceAtual].id, alternativa),
    onSuccess: (res) => {
      setResultado(res)
      if (res.correta) setAcertos((anterior) => anterior + 1)
      queryClient.invalidateQueries({ queryKey: ["ia-materiais"] })
    },
    onError: (erro) => notificar.erro(erro),
  })

  const avaliar = useMutation({
    mutationFn: () => gerarAvaliacao(materialId!),
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

  function proximaQuestao() {
    setIndiceAtual((i) => i + 1)
    setRespostaSelecionada(null)
    setResultado(null)
  }

  function recomecar() {
    setQuestoes([])
    setArquivo(null)
    setMaterialId(null)
    setIndiceAtual(0)
    setRespostaSelecionada(null)
    setResultado(null)
    setAcertos(0)
    avaliar.reset()
  }

  const quizFinalizado = questoes.length > 0 && indiceAtual >= questoes.length
  const questaoAtual = questoes[indiceAtual]
  const progresso = questoes.length > 0 ? ((indiceAtual + (resultado ? 1 : 0)) / questoes.length) * 100 : 0

  if (questoes.length === 0) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardContent className="flex flex-col gap-5 p-4 sm:p-6">
          <p className="text-sm text-muted-foreground">
            Envie um PDF (resumo, apostila, capítulo) e a IA cria questões de múltipla escolha
            sobre o conteúdo.
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
            <p className="text-sm font-medium">Quantas questões?</p>
            <div
              role="group"
              aria-label="Quantidade de questões"
              className="flex w-fit gap-1 rounded-full bg-muted p-1"
            >
              {quantidadesPermitidas.map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  aria-pressed={quantidadeEfetiva === opcao}
                  onClick={() => setQuantidade(opcao)}
                  className={`min-h-10 cursor-pointer rounded-full px-5 text-sm font-medium transition-colors sm:min-h-0 sm:py-1.5 ${
                    quantidadeEfetiva === opcao
                      ? "bg-emerald-500 text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opcao}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Cada geração conta uma vez na sua cota, seja de 5 ou de 15 questões. Para textos
              curtos, prefira poucas questões: assim elas não se repetem.
            </p>
          </div>

          <Button
            className="h-12 w-full text-base sm:h-9 sm:text-sm"
            onClick={() => gerar.mutate()}
            disabled={!arquivo || cotaEsgotada || gerar.isPending}
          >
            <Sparkles className="size-4" />
            {gerar.isPending ? "Gerando questões..." : "Gerar questões"}
          </Button>

          {gerar.isPending && (
            <p className="text-center text-xs text-muted-foreground">
              Isso pode levar até 30 segundos. Não feche esta página.
            </p>
          )}

          {cotaEsgotada && (
            <p className="text-sm text-destructive">
              Você atingiu sua cota mensal de gerações. Ela renova no próximo mês.
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  if (quizFinalizado) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardContent className="flex flex-col gap-4 p-4 text-center sm:p-6">
          <p className="text-sm text-muted-foreground">Quiz concluído</p>
          <p className="text-5xl font-semibold tabular-nums">
            {acertos}
            <span className="text-lg font-normal text-muted-foreground"> de {questoes.length}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {acertos === questoes.length
              ? "Você acertou todas."
              : `Você acertou ${plural(acertos, "questão", "questões")}.`}
          </p>

          {avaliar.data ? (
            <p className="rounded-lg bg-muted p-4 text-left text-sm leading-relaxed">
              {avaliar.data.diagnostico}
            </p>
          ) : (
            <Button
              variant="outline"
              className="h-11 sm:h-9"
              onClick={() => avaliar.mutate()}
              disabled={avaliar.isPending}
            >
              {avaliar.isPending ? "Gerando diagnóstico..." : "Gerar diagnóstico com IA"}
            </Button>
          )}

          <Button className="h-11 sm:h-9" onClick={recomecar}>
            Gerar novas questões
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardContent className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Questão {indiceAtual + 1} de {questoes.length}
          </span>
          <span>{plural(acertos, "acerto", "acertos")}</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={Math.round(progresso)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso do quiz"
          className="h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progresso}%` }}
          />
        </div>

        <p className="font-medium">{questaoAtual.enunciado}</p>

        <div className="flex flex-col gap-2">
          {Object.entries(questaoAtual.alternativas).map(([letra, texto]) => {
            const ehCorreta = resultado !== null && letra === resultado.resposta_correta
            const ehErrada =
              resultado !== null && letra === respostaSelecionada && !resultado.correta
            const selecionada = respostaSelecionada === letra && resultado === null

            return (
              <button
                key={letra}
                type="button"
                disabled={resultado !== null}
                onClick={() => setRespostaSelecionada(letra)}
                className={`flex min-h-12 w-full cursor-pointer items-start gap-2 rounded-md border p-3 text-left text-sm transition-colors disabled:cursor-default ${
                  ehCorreta
                    ? "border-status-excelente bg-status-excelente/10"
                    : ehErrada
                      ? "border-status-critico bg-status-critico/10"
                      : selecionada
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent"
                }`}
              >
                {ehCorreta && <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-status-excelente" />}
                {ehErrada && <XCircle className="mt-0.5 size-4 shrink-0 text-status-critico" />}
                <span className="min-w-0">
                  <span className="font-medium">{letra})</span> {texto}
                </span>
              </button>
            )
          })}
        </div>

        {resultado && (
          <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            {resultado.explicacao}
          </p>
        )}

        {resultado === null ? (
          <Button
            className="h-12 w-full text-base sm:h-9 sm:text-sm"
            onClick={() => respostaSelecionada && responder.mutate(respostaSelecionada)}
            disabled={!respostaSelecionada || responder.isPending}
          >
            {responder.isPending ? "Verificando..." : "Responder"}
          </Button>
        ) : (
          <Button className="h-12 w-full text-base sm:h-9 sm:text-sm" onClick={proximaQuestao}>
            {indiceAtual + 1 < questoes.length ? "Próxima questão" : "Ver resultado"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}