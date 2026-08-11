import { Navigate, Outlet } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"

import { obterMinhaAssinatura } from "@/features/assinatura/api/assinatura-api"
import { assinaturaEstaValida } from "@/features/assinatura/regras"

export function AssinaturaRoute() {
  const { data: assinatura, isLoading } = useQuery({
    queryKey: ["assinatura"],
    queryFn: obterMinhaAssinatura,
  })

  if (isLoading) {
    return <p className="p-8 text-muted-foreground">Verificando assinatura...</p>
  }

  if (!assinaturaEstaValida(assinatura)) {
    return <Navigate to="/planos" replace />
  }

  return <Outlet />
}