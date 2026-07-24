import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listarProvas } from "@/features/provas/api/provas-api"

export function ProvasPage() {
  const { data: provas, isLoading, isError } = useQuery({
    queryKey: ["provas"],
    queryFn: listarProvas,
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Minhas Provas</h1>
        <Button asChild>
          <Link to="/provas/nova">
            <Plus className="size-4" />
            Nova prova
          </Link>
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Carregando...</p>}
      {isError && <p className="text-destructive">Erro ao carregar provas.</p>}

      {provas && provas.length === 0 && (
        <p className="text-muted-foreground">
          Você ainda não cadastrou nenhuma prova. Clique em "Nova prova" pra começar.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {provas?.map((prova) => (
          <Link key={prova.id} to={`/provas/${prova.id}`}>
            <Card className="transition-colors hover:border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{prova.nome}</CardTitle>
                  <Badge variant={prova.status === "ativa" ? "default" : "secondary"}>
                    {prova.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {prova.dias_restantes >= 0
                    ? `${prova.dias_restantes} dias restantes`
                    : "Prova já passou"}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}