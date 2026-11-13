// Regras de senha usadas no cadastro e na redefinição.
// Fica num arquivo só para as duas telas nunca divergirem.

export interface AvaliacaoSenha {
  temMinimo: boolean
  temMaiuscula: boolean
  temMinuscula: boolean
  temNumero: boolean
  temEspecial: boolean
  valida: boolean
}

export function avaliarSenha(senha: string): AvaliacaoSenha {
  const temMinimo = senha.length >= 8
  const temMaiuscula = /[A-Z]/.test(senha)
  const temMinuscula = /[a-z]/.test(senha)
  const temNumero = /[0-9]/.test(senha)
  const temEspecial = /[^A-Za-z0-9]/.test(senha)

  return {
    temMinimo,
    temMaiuscula,
    temMinuscula,
    temNumero,
    temEspecial,
    valida: temMinimo && temMaiuscula && temMinuscula && temNumero && temEspecial,
  }
}
