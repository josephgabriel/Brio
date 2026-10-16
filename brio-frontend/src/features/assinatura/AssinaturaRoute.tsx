import { Navigate, Outlet } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { obterMinhaAssinatura } from "@/features/assinatura/api/assinatura-api"
import { assinaturaEstaValida } from "@/features/assinatura/regras"

export function AssinaturaRoute() {
  const { data: assinatura, isLoading } = useQuery({
    queryKey: ["assinatura"],
    queryFn: obterMinhaAssinatura,
  })

    if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <span className="sr-only">Verificando assinatura...</span>
      </div>
    )
  }

  if (!assinaturaEstaValida(assinatura)) {
    return <Navigate to="/planos" replace />
  }

  return <Outlet />
}