import { dataDeISO } from "@/features/cronograma/semana"

function primeiraMaiuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function rotuloMes(data: Date): string {
  return primeiraMaiuscula(data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }))
}

export function dataLonga(iso: string): string {
  return primeiraMaiuscula(
    dataDeISO(iso).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
  )
}

export function dataCurta(iso: string): string {
  return dataDeISO(iso)
    .toLocaleDateString("pt-BR", { day: "numeric", month: "short" })
    .replace(".", "")
}

export function diasEntre(deISO: string, ateISO: string): number {
  const ms = dataDeISO(ateISO).getTime() - dataDeISO(deISO).getTime()
  return Math.round(ms / 86_400_000)
}

export function rotuloRelativo(iso: string, hojeISO: string): string {
  const diferenca = diasEntre(hojeISO, iso)
  if (diferenca === 0) return "Hoje"
  if (diferenca === 1) return "Amanhã"
  if (diferenca === -1) return "Ontem"
  return dataLonga(iso)
}

export function contagemProva(
  iso: string,
  hojeISO: string,
): { rotulo: string; urgente: boolean } {
  const dias = diasEntre(hojeISO, iso)
  if (dias < 0) return { rotulo: "Realizada", urgente: false }
  if (dias === 0) return { rotulo: "É hoje", urgente: true }
  if (dias === 1) return { rotulo: "Amanhã", urgente: true }
  return { rotulo: `D-${dias}`, urgente: dias <= 7 }
}