export const SITE = "www.brio-estudos.com.br"

// Versão dos dois documentos (Termos e Política). Muda sempre que o texto mudar
// de forma relevante: é este valor que será gravado no aceite do cadastro.
export const VERSAO_TERMOS = "2026-10-27"
export const DATA_ATUALIZACAO = "27 de outubro de 2026"

// PREENCHA estes três campos antes de publicar
export const RESPONSAVEL = "José Gabriel Soares dos Santos"
export const DOCUMENTO = "075.736.063-70"
export const EMAIL_CONTATO = "josgabrielsoares825@gmail.com"

// Devem refletir o que o sistema faz (planos, garantia, limites)
export const PRECO_MENSAL = "R$ 9,90"
export const PRECO_ANUAL = "R$ 99,00"
export const DIAS_GARANTIA = 7
export const DIAS_AVISO_MUDANCA_PRECO = 30
export const DIAS_RESPOSTA_DIREITOS = 15
export const LIMITE_MENSAL_IA = 20

export function camposPendentes(): string[] {
  const campos: Record<string, string> = {
    "nome ou razão social": RESPONSAVEL,
    documento: DOCUMENTO,
    "email de contato": EMAIL_CONTATO,
  }
  return Object.entries(campos)
    .filter(([, valor]) => valor.includes("[PREENCHER"))
    .map(([nome]) => nome)
}