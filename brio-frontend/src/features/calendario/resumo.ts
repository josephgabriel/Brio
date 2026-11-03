import { plural } from "@/features/cronograma/semana"

export interface ProximaProva {
  nome: string
  dias: number
}

export interface ResumoCalendario {
  titulo: string
  texto: string
}

export function resumoCalendario(
  proxima: ProximaProva | null,
  pendentesHoje: number,
  atrasadas: number,
): ResumoCalendario {
  let titulo = "Organize sua rotina de estudos"
  if (proxima) {
    if (proxima.dias === 0) titulo = `Hoje é dia de prova: ${proxima.nome}`
    else if (proxima.dias === 1) titulo = `Falta 1 dia para ${proxima.nome}`
    else titulo = `Faltam ${proxima.dias} dias para ${proxima.nome}`
  }

  let texto: string
  if (atrasadas > 0) {
    const hoje =
      pendentesHoje > 0 ? ` e ${plural(pendentesHoje, "pendência", "pendências")} para hoje` : ""
    texto = `${plural(atrasadas, "item atrasado", "itens atrasados")}${hoje}. Comece pelo que já venceu.`
  } else if (pendentesHoje > 0) {
    texto = `${plural(pendentesHoje, "pendência", "pendências")} para hoje. Um passo de cada vez.`
  } else {
    texto = "Tudo em dia por enquanto. Que tal planejar a próxima semana?"
  }

  return { titulo, texto }
}