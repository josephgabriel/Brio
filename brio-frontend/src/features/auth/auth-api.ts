const API_URL = import.meta.env.VITE_API_URL as string
import { apiFetch } from "@/lib/api-client"  

export async function verificarEmail(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/v1/auth/verificar-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  })
  if (!response.ok) throw new Error("Link de verificação inválido ou expirado")
}

export async function solicitarRedefinicaoSenha(email: string): Promise<void> {
  await fetch(`${API_URL}/api/v1/auth/esqueci-senha`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
  // Sem checar response.ok de propósito -- sempre tratamos como
  // sucesso na tela, mesmo que o email não exista (mesma lógica de
  // segurança do backend).
}

export async function redefinirSenha(token: string, novaSenha: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/v1/auth/redefinir-senha`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, nova_senha: novaSenha }),
  })
  if (!response.ok) throw new Error("Link de redefinição inválido ou expirado")
}

export async function reenviarVerificacao(): Promise<void> {
  const response = await apiFetch("/api/v1/auth/reenviar-verificacao", { method: "POST" })
  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.detail ?? "Não foi possível reenviar o email")
  }
}