import { Link } from "react-router-dom"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

interface AcaoEstadoVazio {
  rotulo: string
  para?: string
  aoClicar?: () => void
}

interface EstadoVazioProps {
  icone: LucideIcon
  titulo: string
  descricao?: string
  acao?: AcaoEstadoVazio
  compacto?: boolean
  className?: string
}

export function EstadoVazio({
  icone: Icone,
  titulo,
  descricao,
  acao,
  compacto = false,
  className = "",
}: EstadoVazioProps) {
  return (
    <div
      className={`flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/50 text-center ${
        compacto ? "gap-2 px-4 py-6" : "gap-3 px-6 py-12"
      } ${className}`}
    >
      <div
        className={`flex items-center justify-center rounded-full bg-primary/10 text-primary ${
          compacto ? "size-10" : "size-14"
        }`}
      >
        <Icone aria-hidden className={compacto ? "size-5" : "size-7"} />
      </div>

      <p className={`font-semibold ${compacto ? "text-sm" : "text-lg"}`}>{titulo}</p>

      {descricao && (
        <p className={`max-w-sm text-muted-foreground ${compacto ? "text-xs" : "text-sm"}`}>
          {descricao}
        </p>
      )}

      {acao && (
        <div className="mt-2">
          {acao.para ? (
            <Button asChild size={compacto ? "sm" : "default"}>
              <Link to={acao.para}>{acao.rotulo}</Link>
            </Button>
          ) : (
            <Button type="button" size={compacto ? "sm" : "default"} onClick={acao.aoClicar}>
              {acao.rotulo}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}