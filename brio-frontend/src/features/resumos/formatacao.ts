import type { ResumoDetalhe } from "@/features/resumos/types"

const ROTULO_NIVEL: Record<string, string> = {
  curto: "Curto",
  medio: "Médio",
  detalhado: "Detalhado",
}

const DESCRICAO_NIVEL: Record<string, string> = {
  curto: "Só o essencial, para uma revisão rápida.",
  medio: "Equilíbrio entre rapidez e conteúdo. Recomendado.",
  detalhado: "Mais tópicos e pontos, para estudar o assunto.",
}

// Se o servidor ganhar um nível novo, o texto cru aparece como reserva
export function rotuloNivel(nivel: string): string {
  return ROTULO_NIVEL[nivel] ?? nivel
}

export function descricaoNivel(nivel: string): string | undefined {
  return DESCRICAO_NIVEL[nivel]
}

export function resumoParaTexto(resumo: ResumoDetalhe): string {
  const c = resumo.conteudo
  const linhas: string[] = [c.titulo, "", c.visao_geral]

  c.topicos.forEach((topico) => {
    linhas.push("", topico.titulo)
    topico.pontos.forEach((ponto) => linhas.push(`- ${ponto}`))
  })

  if (c.conceitos_chave.length > 0) {
    linhas.push("", "Conceitos-chave")
    c.conceitos_chave.forEach((conceito) => linhas.push(`- ${conceito.termo}: ${conceito.definicao}`))
  }

  if (c.para_memorizar.length > 0) {
    linhas.push("", "Para memorizar")
    c.para_memorizar.forEach((item) => linhas.push(`- ${item}`))
  }

  linhas.push(
    "",
    `Resumo gerado por IA (Brio) a partir de "${resumo.nome_arquivo}". Confira com o material original.`,
  )
  return linhas.join("\n")
}