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
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
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
    </div>
  )
}