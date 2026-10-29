import { PaginaLegal } from "@/components/legal/PaginaLegal"
import { RESUMO_PRIVACIDADE, SECOES_PRIVACIDADE } from "@/features/legal/privacidade"

export function PrivacidadePage() {
  return (
    <PaginaLegal
      atual="privacidade"
      titulo="Política de Privacidade"
      resumo={RESUMO_PRIVACIDADE}
      secoes={SECOES_PRIVACIDADE}
    />
  )
}