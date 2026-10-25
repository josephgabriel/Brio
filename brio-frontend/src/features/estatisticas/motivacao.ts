import type { Estatisticas } from "@/features/estatisticas/types"

export interface Trilha {
  id: string
  titulo: string
  singular: string
  plural: string
  metas: number[] // sempre em ordem crescente
  atual: number
}

export interface ProgressoTrilha extends Trilha {
  conquistadas: number[]
  proximaMeta: number | null
  percentualAteProxima: number
}

export function formatarNumero(valor: number): string {
  return valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })
}

export function formatarPercentual(valor: number | null): string {
  return valor === null ? "—" : `${Math.round(valor)}%`
}

export function formatarQuantidade(
  valor: number,
  unidade: Pick<Trilha, "singular" | "plural">,
): string {
  return `${formatarNumero(valor)} ${valor === 1 ? unidade.singular : unidade.plural}`
}

function calcularProgresso(trilha: Trilha): ProgressoTrilha {
  const conquistadas = trilha.metas.filter((meta) => trilha.atual >= meta)
  const proximaMeta = trilha.metas.find((meta) => trilha.atual < meta) ?? null
  const base = conquistadas.length > 0 ? conquistadas[conquistadas.length - 1] : 0

  // Progresso dentro da etapa atual (do marco anterior até o próximo), não do zero
  const percentual =
    proximaMeta === null ? 100 : ((trilha.atual - base) / (proximaMeta - base)) * 100

  return {
    ...trilha,
    conquistadas,
    proximaMeta,
    percentualAteProxima: Math.min(100, Math.max(0, percentual)),
  }
}

export function calcularTrilhas(dados: Estatisticas): ProgressoTrilha[] {
  const trilhas: Trilha[] = [
    {
      id: "horas",
      titulo: "Horas de estudo",
      singular: "h",
      plural: "h",
      metas: [1, 5, 10, 25, 50, 100, 200, 500],
      atual: dados.total_horas_estudadas,
    },
    {
      id: "sessoes",
      titulo: "Sessões concluídas",
      singular: "sessão",
      plural: "sessões",
      metas: [1, 5, 10, 25, 50, 100, 250],
      atual: dados.total_sessoes,
    },
    {
      id: "questoes",
      titulo: "Questões respondidas",
      singular: "questão",
      plural: "questões",
      metas: [10, 25, 50, 100, 250, 500],
      atual: dados.questoes_respondidas,
    },
    {
      id: "conteudos",
      titulo: "Conteúdos concluídos",
      singular: "conteúdo",
      plural: "conteúdos",
      metas: [1, 5, 10, 25, 50, 100],
      atual: dados.conteudos_concluidos,
    },
  ]
  return trilhas.map(calcularProgresso)
}

export interface MensagemMotivacional {
  titulo: string
  texto: string
}

export function mensagemMotivacional(
  dados: Estatisticas,
  sequenciaDias: number,
): MensagemMotivacional {
  if (dados.total_sessoes === 0) {
    return {
      titulo: "Sua jornada começa aqui",
      texto: "Finalize sua primeira sessão de estudos e seus números começam a aparecer.",
    }
  }

  const semanas = dados.evolucao_semanal
  const estaSemana = semanas.length > 0 ? semanas[semanas.length - 1].horas : 0
  const semanaPassada = semanas.length > 1 ? semanas[semanas.length - 2].horas : 0

  const textoDaSemana =
    estaSemana > 0
      ? `Você já estudou ${formatarNumero(estaSemana)} h esta semana.`
      : "Uma sessão curta mantém a sequência viva."

  if (sequenciaDias >= 7) {
    return { titulo: `${sequenciaDias} dias seguidos. Isso é constância.`, texto: textoDaSemana }
  }
  if (sequenciaDias >= 3) {
    return { titulo: `Sequência de ${sequenciaDias} dias, continue assim`, texto: textoDaSemana }
  }
  if (semanaPassada > 0 && estaSemana > semanaPassada) {
    return {
      titulo: "Semana acima da anterior",
      texto: `Você já estudou ${formatarNumero(estaSemana - semanaPassada)} h a mais que na semana passada.`,
    }
  }
  if (estaSemana > 0) {
    return {
      titulo: "Bom ritmo esta semana",
      texto:
        semanaPassada > estaSemana
          ? `Faltam ${formatarNumero(semanaPassada - estaSemana)} h para igualar a semana passada.`
          : textoDaSemana,
    }
  }
  return {
    titulo: "Que tal retomar hoje?",
    texto:
      semanaPassada > 0
        ? `Na semana passada você estudou ${formatarNumero(semanaPassada)} h. Uma sessão curta já recoloca você no ritmo.`
        : "Uma sessão curta já recoloca você no ritmo.",
  }
}