import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"

async function fetchHealth() {
  const response = await fetch("http://127.0.0.1:8000/health")
  if (!response.ok) {
    throw new Error("Falha ao conectar com a API")
  }
  return response.json() as Promise<{ status: string; environment: string }>
}

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
  })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-white dark:bg-neutral-950">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Brio
        </h1>
        {isLoading && <p className="text-neutral-500">Conectando à API...</p>}
        {isError && <p className="text-red-500">Não foi possível conectar à API</p>}
        {data && (
          <p className="text-neutral-500">
            API respondeu: {data.status} ({data.environment})
          </p>
        )}
      </div>

      <Card className="w-72">
        <CardHeader>
          <CardTitle>Teste de tokens</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button>Primário (índigo)</Button>
          <p className="font-mono text-2xl">00:42:17</p>
        </CardContent>
      </Card>
    </div>
  )
}