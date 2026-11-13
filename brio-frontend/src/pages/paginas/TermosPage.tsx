import { PaginaLegal } from "@/components/legal/PaginaLegal"
import { RESUMO_TERMOS, SECOES_TERMOS } from "@/features/legal/termos"

export function TermosPage() {
  return (
    <PaginaLegal
      atual="termos"
      titulo="Termos de Uso"
      resumo={RESUMO_TERMOS}
      secoes={SECOES_TERMOS}
    />
  )
}