import { toast } from "sonner"

export const notificar = {
  sucesso: (mensagem: string) => toast.success(mensagem),
  erro: (mensagem: string) => toast.error(mensagem),
  info: (mensagem: string) => toast(mensagem),
}