import { useState, type ReactNode } from "react"
import { Eye, EyeOff } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CampoSenhaProps {
  id: string
  rotulo: string
  value: string
  onChange: (valor: string) => void
  autoComplete: "current-password" | "new-password"
  /** Como o leitor de tela chama o campo no botão de mostrar/ocultar. */
  nomeAcessivel?: string
  /** Aparece na linha do rótulo, à direita (ex.: "Esqueci minha senha"). */
  acessorio?: ReactNode
  /** Aparece abaixo do campo (requisitos, erro de confirmação). */
  children?: ReactNode
}

/** Campo de senha com botão de mostrar/ocultar. Era copiado em quatro telas. */
export function CampoSenha({
  id,
  rotulo,
  value,
  onChange,
  autoComplete,
  nomeAcessivel = "senha",
  acessorio,
  children,
}: CampoSenhaProps) {
  const [visivel, setVisivel] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{rotulo}</Label>
        {acessorio}
      </div>

      <div className="relative mt-2">
        <Input
          id={id}
          type={visivel ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 pr-12 text-base md:text-sm"
          required
        />

        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={visivel ? `Ocultar ${nomeAcessivel}` : `Mostrar ${nomeAcessivel}`}
        >
          {visivel ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>

      {children}
    </div>
  )
}
