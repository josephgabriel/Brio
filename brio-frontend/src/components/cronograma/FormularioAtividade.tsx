import { type SubmitEvent, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { listarDisciplinas } from "@/features/disciplinas/api/disciplinas-api"
import {
  atualizarAtividade,
  criarAtividade,
  excluirAtividade,
} from "@/features/cronograma/api/cronograma-api"
import { DIAS_CURTOS } from "@/features/cronograma/semana"
import type { OcorrenciaCronograma, TipoAtividade } from "@/features/cronograma/types"
import { ICONES_TIPO, ROTULOS_TIPO } from "@/features/cronograma/visual"
import { listarProvas } from "@/features/provas/api/provas-api"
import { notificar } from "@/lib/toast"

const TIPOS: TipoAtividade[] = ["estudo", "revisao", "questoes", "simulado"]

interface FormularioAtividadeProps {
  atividade: OcorrenciaCronograma | null
  diaPadrao: number
  aoFechar: () => void
}

export function FormularioAtividade({ atividade, diaPadrao, aoFechar }: FormularioAtividadeProps) {
  const queryClient = useQueryClient()

  // Este componente só existe enquanto o formulário está aberto, então os valores
  // iniciais vêm direto da atividade e não há estado antigo para limpar.
  const [tipo, setTipo] = useState<TipoAtividade>(atividade?.tipo ?? "estudo")
  const [provaId, setProvaId] = useState(atividade?.prova_id ? String(atividade.prova_id) : "")
  const [disciplinaId, setDisciplinaId] = useState(
    atividade?.disciplina_id ? String(atividade.disciplina_id) : "",
  )
  const [titulo, setTitulo] = useState(atividade?.titulo_personalizado ?? "")
  const [foco, setFoco] = useState(atividade?.foco ?? "")
  const [diaSemana, setDiaSemana] = useState(atividade?.dia_semana ?? diaPadrao)
  const [horario, setHorario] = useState(atividade?.horario_inicio?.slice(0, 5) ?? "")
  const [duracao, setDuracao] = useState(String(atividade?.duracao_minutos ?? 60))
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false)

  const { data: provas } = useQuery({ queryKey: ["provas"], queryFn: listarProvas })
  const provasAtivas = provas?.filter((prova) => prova.status === "ativa")

  const { data: disciplinas } = useQuery({
    queryKey: ["disciplinas", provaId],
    queryFn: () => listarDisciplinas(Number(provaId)),
    enabled: !!provaId,
  })
  const materiaEscolhida = disciplinas?.find((d) => String(d.id) === disciplinaId)

  const duracaoNumero = Number(duracao)
  const podeSalvar =
    (disciplinaId !== "" || titulo.trim() !== "") && duracaoNumero > 0 && duracaoNumero <= 600

  function aoConcluir() {
    queryClient.invalidateQueries({ queryKey: ["cronograma-semana"] })
    queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    aoFechar()
  }

  const salvar = useMutation({
    mutationFn: () => {
      const dados = {
        tipo,
        disciplina_id: disciplinaId ? Number(disciplinaId) : null,
        titulo: titulo.trim() || null,
        foco: foco.trim() || null,
        dia_semana: diaSemana,
        horario_inicio: horario || null,
        duracao_minutos: duracaoNumero,
      }
      return atividade ? atualizarAtividade(atividade.item_id, dados) : criarAtividade(dados)
    },
    onSuccess: () => {
      notificar.sucesso(atividade ? "Atividade atualizada" : "Atividade adicionada")
      aoConcluir()
    },
    onError: (erro) => notificar.erro(erro),
  })

  const remover = useMutation({
    mutationFn: () => excluirAtividade(atividade!.item_id),
    onSuccess: () => {
      notificar.sucesso("Atividade removida")
      aoConcluir()
    },
    onError: (erro) => notificar.erro(erro),
  })

  function handleSubmit(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (podeSalvar) salvar.mutate()
  }

  return (
    <Dialog
      open
      onOpenChange={(aberto) => {
        if (!aberto) aoFechar()
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{atividade ? "Editar atividade" : "Nova atividade"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Tipo</Label>
            <div role="group" aria-label="Tipo de atividade" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TIPOS.map((opcao) => {
                const Icone = ICONES_TIPO[opcao]
                const ativo = tipo === opcao
                return (
                  <button
                    key={opcao}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => setTipo(opcao)}
                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                      ativo
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <Icone className="size-4" />
                    {ROTULOS_TIPO[opcao]}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Prova</Label>
              <Select
                value={provaId}
                onValueChange={(valor) => {
                  setProvaId(valor === "nenhuma" ? "" : valor)
                  setDisciplinaId("")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Opcional">
                    {provasAtivas?.find((p) => String(p.id) === provaId)?.nome}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhuma">Nenhuma (atividade livre)</SelectItem>
                  {provasAtivas?.map((prova) => (
                    <SelectItem key={prova.id} value={String(prova.id)}>
                      {prova.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Matéria</Label>
              <Select
                value={disciplinaId}
                onValueChange={(valor) => setDisciplinaId(valor === "nenhuma" ? "" : valor)}
                disabled={!provaId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Opcional">{materiaEscolhida?.nome}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhuma">Sem matéria</SelectItem>
                  {disciplinas?.map((disciplina) => (
                    <SelectItem key={disciplina.id} value={String(disciplina.id)}>
                      {disciplina.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="titulo-atividade">
              Título{disciplinaId ? " (opcional)" : ""}
            </Label>
            <Input
              id="titulo-atividade"
              value={titulo}
              maxLength={120}
              placeholder={materiaEscolhida?.nome ?? "Ex.: Revisão de erros"}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="foco-atividade">Foco (opcional)</Label>
            <Input
              id="foco-atividade"
              value={foco}
              maxLength={120}
              placeholder="Ex.: Interpretação de texto"
              onChange={(e) => setFoco(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Dia da semana</Label>
            <div role="group" aria-label="Dia da semana" className="grid grid-cols-7 gap-1">
              {DIAS_CURTOS.map((rotulo, indice) => (
                <button
                  key={rotulo}
                  type="button"
                  aria-pressed={diaSemana === indice}
                  onClick={() => setDiaSemana(indice)}
                  className={`cursor-pointer rounded-lg border py-2 text-xs font-medium transition-colors ${
                    diaSemana === indice
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {rotulo}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="horario-atividade">Horário (opcional)</Label>
              <Input
                id="horario-atividade"
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="duracao-atividade">Duração (min)</Label>
              <Input
                id="duracao-atividade"
                type="number"
                min="1"
                max="600"
                value={duracao}
                onChange={(e) => setDuracao(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="items-center sm:justify-between">
            {atividade ? (
              confirmandoRemocao ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Remover de todas as semanas?</span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remover.mutate()}
                    disabled={remover.isPending}
                  >
                    {remover.isPending ? "Removendo..." : "Sim, remover"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmandoRemocao(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => setConfirmandoRemocao(true)}
                >
                  <Trash2 className="size-4" />
                  Remover
                </Button>
              )
            ) : (
              <span />
            )}

            <Button type="submit" disabled={!podeSalvar || salvar.isPending}>
              {salvar.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}