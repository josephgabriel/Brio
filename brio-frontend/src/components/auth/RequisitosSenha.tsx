import type { ReactNode } from "react"
import { Check, X } from "lucide-react"

import { avaliarSenha } from "@/features/auth/senha"

function Requisito({
  atendido,
  className = "",
  children,
}: {
  atendido: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <li
      className={`flex items-center gap-1.5 ${
        atendido ? "font-medium text-emerald-500" : "text-muted-foreground"
      } ${className}`}
    >
      {atendido ? (
        <Check aria-hidden className="size-3.5 shrink-0" />
      ) : (
        <X aria-hidden className="size-3.5 shrink-0" />
      )}
      {children}
      <span className="sr-only">{atendido ? " (atendido)" : " (pendente)"}</span>
    </li>
  )
}

/** Lista de requisitos que vai marcando conforme a pessoa digita. */
export function RequisitosSenha({
  senha,
  titulo = "A senha deve conter:",
}: {
  senha: string
  titulo?: string
}) {
  const r = avaliarSenha(senha)

  return (
    <div className="mt-3 space-y-1.5 text-xs">
      <p className="font-medium text-muted-foreground">{titulo}</p>
      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        <Requisito atendido={r.temMinimo}>Pelo menos 8 caracteres</Requisito>
        <Requisito atendido={r.temMaiuscula}>Letra maiúscula</Requisito>
        <Requisito atendido={r.temMinuscula}>Letra minúscula</Requisito>
        <Requisito atendido={r.temNumero}>Número</Requisito>
        <Requisito atendido={r.temEspecial} className="sm:col-span-2">
          Caractere especial (!@#$%^&*)
        </Requisito>
      </ul>
    </div>
  )
}
