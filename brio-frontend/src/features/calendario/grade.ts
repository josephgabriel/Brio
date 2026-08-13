export function gerarDiasDoMes(referencia: Date): Date[] {
  const ano = referencia.getFullYear()
  const mes = referencia.getMonth()

  const primeiroDiaDoMes = new Date(ano, mes, 1)
  const ultimoDiaDoMes = new Date(ano, mes + 1, 0)

  const inicio = new Date(ano, mes, 1 - primeiroDiaDoMes.getDay())
  const fim = new Date(ano, mes, ultimoDiaDoMes.getDate() + (6 - ultimoDiaDoMes.getDay()))

  const dias: Date[] = []
  const cursor = new Date(inicio)
  while (cursor <= fim) {
    dias.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dias
}

export function gerarDiasDaSemana(referencia: Date): Date[] {
  const domingo = new Date(referencia)
  domingo.setDate(referencia.getDate() - referencia.getDay())

  return Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(domingo)
    dia.setDate(domingo.getDate() + i)
    return dia
  })
}

export function paraISO(data: Date): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, "0")
  const dia = String(data.getDate()).padStart(2, "0")
  return `${ano}-${mes}-${dia}`
}