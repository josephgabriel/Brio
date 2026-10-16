import type { ReactNode } from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function Carregando({ children }: { children: ReactNode }) {
  return (
    <div role="status">
      <span className="sr-only">Carregando...</span>
      {children}
    </div>
  )
}

interface SkeletonMetricasProps {
  quantidade?: number
  className?: string
}

export function SkeletonMetricas({
  quantidade = 4,
  className = "grid grid-cols-2 gap-4 sm:grid-cols-4",
}: SkeletonMetricasProps) {
  return (
    <div className={className}>
      {Array.from({ length: quantidade }, (_, indice) => (
        <Card key={indice}>
          <CardContent className="p-4">
            <Skeleton className="mb-2 h-4 w-20" />
            <Skeleton className="h-9 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SkeletonCards({ quantidade = 3 }: { quantidade?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: quantidade }, (_, indice) => (
        <Card key={indice}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SkeletonLista({ quantidade = 4 }: { quantidade?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: quantidade }, (_, indice) => (
        <Card key={indice}>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-16 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SkeletonGrafico() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <Skeleton className="mb-4 h-6 w-40" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

export function SkeletonEditor() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-[480px] w-full" />
    </div>
  )
}