import { Card, CardContent } from "@/components/ui/card"

interface CardMetricaProps {
  label: string
  valor: string
  destaque?: boolean
}

export function CardMetrica({ label, valor, destaque }: CardMetricaProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-3xl font-semibold ${destaque ? "text-primary" : ""}`}>
          {valor}
        </p>
      </CardContent>
    </Card>
  )
}