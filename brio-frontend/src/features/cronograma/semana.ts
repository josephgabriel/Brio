import type { OcorrenciaCronograma } from "@/features/cronograma/types"

export const DIAS_CURTOS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

export function inicioDaSemana(data: Date): Date {
  const deslocamento = (data.getDay() + 6) % 7 // segunda = 0
  return new Date(data.getFullYear(), data.getMonth(), data.getDate() - deslocamento)
}

export function somarDias(data: Date, dias: number): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate() + dias)
}

export function diasDaSemana(inicio: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => somarDias(inicio, i))
}

export function dataDeISO(iso: string): Date {
  const [ano, mes, dia] = iso.split("-").map(Number)
  return new Date(ano, mes - 1, dia)
}

export function nomeDoDia(data: Date): string {
  const nome = data.toLocaleDateString("pt-BR", { weekday: "long" })
  return nome.charAt(0).toUpperCase() + nome.slice(1)
}

export function rotuloSemana(dias: Date[]): string {
  const inicio = dias[0]
  const fim = dias[6]
  const sufixoAno = fim.getFullYear() !== new Date().getFullYear() ? ` de ${fim.getFullYear()}` : ""

  if (inicio.getMonth() === fim.getMonth()) {
    const mes = fim.toLocaleDateString("pt-BR", { month: "long" })
    return `${inicio.getDate()} a ${fim.getDate()} de ${mes}${sufixoAno}`
  }
  const curto = (d: Date) =>
    d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }).replace(".", "")
  return `${curto(inicio)} a ${curto(fim)}${sufixoAno}`
}

export function formatarDuracao(minutos: number): string {
  if (minutos < 60) return `${minutos} min`
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`
}

export function plural(quantidade: number, singular: string, pluralTexto: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : pluralTexto}`
}

export interface ResumoSemana {
  titulo: string
  texto: string
}

export function resumoSemana(
  ocorrencias: OcorrenciaCronograma[],
  hojeISO: string,
  inicioISO: string,
  fimISO: string,
): ResumoSemana {
  const total = ocorrencias.length
  const concluidas = ocorrencias.filter((o) => o.concluido).length
  const minutosTotal = ocorrencias.reduce((soma, o) => soma + o.duracao_minutos, 0)

  if (total === 0) {
    return {
      titulo: "Monte sua semana de estudos",
      texto: "Adicione atividades e o Brio mostra o que fazer em cada dia.",
    }
  }
  if (concluidas === total) {
    return {
      titulo: "Semana em dia",
      texto: `Você concluiu as ${total} atividades planejadas. Hora de descansar ou de revisar.`,
    }
  }

  // Comparar datas ISO como texto funciona: o formato AAAA-MM-DD ordena como as datas
  if (hojeISO >= inicioISO && hojeISO <= fimISO) {
    const deHoje = ocorrencias.filter((o) => o.data === hojeISO)
    const pendentesHoje = deHoje.filter((o) => !o.concluido)

    if (pendentesHoje.length > 0) {
      const minutos = pendentesHoje.reduce((soma, o) => soma + o.duracao_minutos, 0)
      return {
        titulo: `${plural(pendentesHoje.length, "atividade", "atividades")} para hoje`,
        texto: `Cerca de ${formatarDuracao(minutos)} de estudo planejado. Um passo de cada vez.`,
      }
    }
    if (deHoje.length > 0) {
      return {
        titulo: "Dia cumprido",
        texto: "Você fez tudo o que planejou para hoje. Amanhã tem mais.",
      }
    }
    return {
      titulo: "Hoje é dia livre",
      texto: "Nada planejado para hoje. Que tal adiantar algo da semana?",
    }
  }

  if (fimISO < hojeISO) {
    return {
      titulo: "Semana encerrada",
      texto: `Você concluiu ${concluidas} de ${total} atividades planejadas.`,
    }
  }
  return {
    titulo: "Semana planejada",
    texto: `${plural(total, "atividade", "atividades")} e ${formatarDuracao(minutosTotal)} de estudo.`,
  }
}