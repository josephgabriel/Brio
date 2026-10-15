import { toast } from "sonner"

const MENSAGENS_DE_REDE = ["Failed to fetch", "Load failed", "NetworkError"]

function ehErroDeRede(erro: unknown): boolean {
  return (
    erro instanceof TypeError &&
    MENSAGENS_DE_REDE.some((trecho) => erro.message.includes(trecho))
  )
}

function mensagemDoErro(erro: unknown): string {
  if (typeof erro === "string") return erro
  if (ehErroDeRede(erro)) {
    return "Sem conexão com o servidor. Verifique sua internet e tente novamente."
  }
  if (erro instanceof Error && erro.message) return erro.message
  return "Algo deu errado. Tente novamente."
}

export const notificar = {
  sucesso: (mensagem: string) => toast.success(mensagem),
  erro: (erro: unknown) => toast.error(mensagemDoErro(erro)),
  info: (mensagem: string) => toast(mensagem),
}