import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { GraduationCap, Plus } from "lucide-react"

import { CartaoProva } from "@/components/shared/CartaoProva"
import { EstadoVazio } from "@/components/shared/EstadoVazio"
import { Carregando, SkeletonCards } from "@/components/shared/Skeletons"
import { Button } from "@/components/ui/button"
import { listarProvas } from "@/features/provas/api/provas-api"

export function ProvasPage() {
  const {
    data: provas,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["provas"],
    queryFn: listarProvas,
  })

  // Quem está estudando precisa ver primeiro o que está em andamento
  const ativas = provas?.filter((prova) => prova.status === "ativa") ?? []
  const encerradas = provas?.filter((prova) => prova.status !== "ativa") ?? []

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold sm:text-2xl">Minhas Provas</h1>
        <Button className="min-h-10 sm:min-h-0" asChild>
          <Link to="/provas/nova">
            <Plus className="size-4" />
            Nova prova
          </Link>
        </Button>
      </div>

      {isLoading && (
        <Carregando>
          <SkeletonCards quantidade={6} />
        </Carregando>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <p className="text-destructive">Erro ao carregar as provas.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            Tentar de novo
          </Button>
        </div>
      )}

      {provas && provas.length === 0 && (
        <EstadoVazio
          icone={GraduationCap}
          titulo="Nenhuma prova por aqui ainda"
          descricao="Cadastre a prova que você está preparando. Depois, adicione as matérias e os conteúdos para acompanhar seu avanço."
          acao={{ rotulo: "Cadastrar minha primeira prova", para: "/provas/nova" }}
        />
      )}

      {provas && provas.length > 0 && ativas.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma prova ativa no momento.</p>
      )}

      {ativas.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ativas.map((prova) => (
            <CartaoProva key={prova.id} prova={prova} />
          ))}
        </div>
      )}

      {encerradas.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Arquivadas e concluídas</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {encerradas.map((prova) => (
              <CartaoProva key={prova.id} prova={prova} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
