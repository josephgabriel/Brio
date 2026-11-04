import { type SubmitEvent, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"

import { Carregando } from "@/components/shared/Skeletons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useConfirmar } from "@/features/confirmacao/confirmacao-context"
import {
  arquivarProva,
  atualizarProva,
  criarProva,
  deletarProva,
  desarquivarProva,
  obterProva,
} from "@/features/provas/api/provas-api"
import type { ProvaFormData } from "@/features/provas/types"
import { notificar } from "@/lib/toast"

const FORM_VAZIO: ProvaFormData = {
  nome: "",
  tipo: "concurso",
  instituicao_banca: "",
  cargo: "",
  data_prova: "",
  data_divulgacao_edital: "",
  horas_disponiveis_dia: 2,
  dias_disponiveis_semana: 5,
  prioridade: "media",
}

// O SelectValue mostra o texto que passamos, e não o valor interno ("media", "concurso")
const ROTULO_TIPO: Record<ProvaFormData["tipo"], string> = {
  enem: "ENEM",
  vestibular: "Vestibular",
  concurso: "Concurso",
}

const ROTULO_PRIORIDADE: Record<ProvaFormData["prioridade"], string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
}

function obterRotulosPorTipo(tipo: ProvaFormData["tipo"]) {
  if (tipo === "vestibular") {
    return {
      instituicao: "Faculdade",
      cargo: "Curso",
    }
  }

  return {
    instituicao: "Instituição / Banca",
    cargo: "Cargo",
  }
}

export function ProvaFormPage() {
  const { id } = useParams()
  const provaId = id ? Number(id) : undefined
  const estaEditando = provaId !== undefined

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const confirmar = useConfirmar()

  const [form, setForm] = useState<ProvaFormData>(FORM_VAZIO)

  const {
    data: provaExistente,
    isLoading: carregandoProva,
    isError: erroProva,
  } = useQuery({
    queryKey: ["provas", provaId],
    queryFn: () => obterProva(provaId!),
    enabled: estaEditando,
  })

  useEffect(() => {
    if (provaExistente) {
      setForm({
        nome: provaExistente.nome,
        tipo: provaExistente.tipo,
        instituicao_banca: provaExistente.instituicao_banca ?? "",
        cargo: provaExistente.cargo ?? "",
        data_prova: provaExistente.data_prova ?? "",
        data_divulgacao_edital: provaExistente.data_divulgacao_edital ?? "",
        horas_disponiveis_dia: provaExistente.horas_disponiveis_dia,
        dias_disponiveis_semana: provaExistente.dias_disponiveis_semana,
        prioridade: provaExistente.prioridade,
      })
    }
  }, [provaExistente])

  const salvar = useMutation({
    mutationFn: () => (estaEditando ? atualizarProva(provaId!, form) : criarProva(form)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provas"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      notificar.sucesso(estaEditando ? "Prova atualizada" : "Prova criada")
      navigate("/provas")
    },
    onError: (erro) => notificar.erro(erro),
  })

  // Sem toast no erro: a mensagem aparece no próprio formulário, junto da opção de arquivar
  const excluir = useMutation({
    mutationFn: () => deletarProva(provaId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provas"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      notificar.sucesso("Prova excluída")
      navigate("/provas")
    },
  })

  const arquivar = useMutation({
    mutationFn: () => arquivarProva(provaId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provas"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      notificar.sucesso("Prova arquivada")
      navigate("/provas")
    },
    onError: (erro) => notificar.erro(erro),
  })

  const desarquivar = useMutation({
    mutationFn: () => desarquivarProva(provaId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provas"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      notificar.sucesso("Prova restaurada")
      navigate("/provas")
    },
    onError: (erro) => notificar.erro(erro),
  })

  function handleSubmit(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    salvar.mutate()
  }

  async function handleExcluir() {
    const confirmado = await confirmar({
      titulo: "Excluir esta prova?",
      descricao: "Essa ação não pode ser desfeita.",
      textoConfirmar: "Excluir",
      destrutivo: true,
    })
    if (confirmado) excluir.mutate()
  }

  if (estaEditando && erroProva) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
        <p className="text-destructive">Não foi possível carregar esta prova.</p>
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <Link to="/provas">Voltar para as provas</Link>
        </Button>
      </div>
    )
  }

  if (estaEditando && carregandoProva) {
    return (
      <Carregando>
        <div className="mx-auto flex max-w-xl flex-col gap-4">
          <Skeleton className="mb-2 h-8 w-40" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </Carregando>
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-xl font-semibold sm:text-2xl">
        {estaEditando ? "Editar prova" : "Nova prova"}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Nome */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nome">Nome da prova</Label>

          <Input
            id="nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="text-base md:text-sm"
            required
          />
        </div>

        {/* Tipo */}
        <div className="flex flex-col gap-1.5">
          <Label>Tipo</Label>

          <Select
            value={form.tipo}
            onValueChange={(valor: ProvaFormData["tipo"]) =>
              setForm({
                ...form,
                tipo: valor,
                instituicao_banca: "",
                cargo: "",
              })
            }
          >
            <SelectTrigger>
              <SelectValue>{ROTULO_TIPO[form.tipo]}</SelectValue>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="enem">ENEM</SelectItem>
              <SelectItem value="vestibular">Vestibular</SelectItem>
              <SelectItem value="concurso">Concurso</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Instituição e cargo */}
        {form.tipo !== "enem" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="banca">{obterRotulosPorTipo(form.tipo).instituicao}</Label>

              <Input
                id="banca"
                value={form.instituicao_banca}
                onChange={(e) => setForm({ ...form, instituicao_banca: e.target.value })}
                className="text-base md:text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cargo">{obterRotulosPorTipo(form.tipo).cargo}</Label>

              <Input
                id="cargo"
                value={form.cargo}
                onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                className="text-base md:text-sm"
              />
            </div>
          </div>
        )}

        {/* Data da prova */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="data_prova">Data da prova</Label>

          <Input
            id="data_prova"
            type="date"
            value={form.data_prova}
            onChange={(e) => setForm({ ...form, data_prova: e.target.value })}
            className="text-base md:text-sm"
          />
        </div>

        {/* Data do edital */}
        {form.tipo === "concurso" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="data_divulgacao_edital">Data de divulgação do edital</Label>

            <Input
              id="data_divulgacao_edital"
              type="date"
              value={form.data_divulgacao_edital}
              onChange={(e) => setForm({ ...form, data_divulgacao_edital: e.target.value })}
              className="text-base md:text-sm"
            />
          </div>
        )}

        {/* Disponibilidade */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="horas">Horas disponíveis/dia</Label>

            <Input
              id="horas"
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0"
              max="24"
              value={form.horas_disponiveis_dia}
              onChange={(e) =>
                setForm({ ...form, horas_disponiveis_dia: Number(e.target.value) })
              }
              className="text-base md:text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dias">Dias disponíveis/semana</Label>

            <Input
              id="dias"
              type="number"
              inputMode="numeric"
              min="1"
              max="7"
              value={form.dias_disponiveis_semana}
              onChange={(e) =>
                setForm({ ...form, dias_disponiveis_semana: Number(e.target.value) })
              }
              className="text-base md:text-sm"
              required
            />
          </div>
        </div>

        {/* Prioridade */}
        <div className="flex flex-col gap-1.5">
          <Label>Prioridade</Label>

          <Select
            value={form.prioridade}
            onValueChange={(valor: ProvaFormData["prioridade"]) =>
              setForm({ ...form, prioridade: valor })
            }
          >
            <SelectTrigger>
              <SelectValue>{ROTULO_PRIORIDADE[form.prioridade]}</SelectValue>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ações */}
        <div className="mt-2 flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="submit"
              className="h-11 w-full sm:h-9 sm:w-auto"
              disabled={salvar.isPending}
            >
              {salvar.isPending ? "Salvando..." : "Salvar"}
            </Button>

            {estaEditando && (
              <Button
                type="button"
                variant="destructive"
                className="h-11 w-full sm:h-9 sm:w-auto"
                onClick={handleExcluir}
                disabled={excluir.isPending}
              >
                <Trash2 className="size-4" />
                Excluir
              </Button>
            )}
          </div>

          {excluir.isError && (
            <div className="flex flex-col gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3">
              {excluir.error instanceof TypeError ? (
                // Falha de conexão: arquivar não resolveria, então não oferecemos
                <p className="text-sm text-destructive">
                  Sem conexão com o servidor. Verifique sua internet e tente novamente.
                </p>
              ) : (
                <>
                  <p className="text-sm text-destructive">{excluir.error.message}</p>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-10 sm:min-h-0"
                    onClick={() => arquivar.mutate()}
                    disabled={arquivar.isPending}
                  >
                    {arquivar.isPending ? "Arquivando..." : "Arquivar prova em vez de excluir"}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </form>

      {estaEditando && provaExistente?.status === "arquivada" && (
        <div className="mt-4 rounded-md border border-border p-3">
          <p className="mb-2 text-sm text-muted-foreground">Esta prova está arquivada.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-10 sm:min-h-0"
            onClick={() => desarquivar.mutate()}
            disabled={desarquivar.isPending}
          >
            {desarquivar.isPending ? "Restaurando..." : "Desarquivar prova"}
          </Button>
        </div>
      )}
    </div>
  )
}