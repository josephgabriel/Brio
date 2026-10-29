import { CalendarX, RotateCcw, ShieldCheck } from "lucide-react"

const ITENS = [
  {
    icone: ShieldCheck,
    titulo: "Pagamento seguro",
    texto: "Processado pelo Mercado Pago. O Brio não recebe os dados do seu cartão.",
  },
  {
    icone: RotateCcw,
    titulo: "Garantia de 7 dias",
    texto: "Peça o reembolso total em até 7 dias após a contratação.",
  },
  {
    icone: CalendarX,
    titulo: "Cancele quando quiser",
    texto: "Desative a renovação e use o Brio até o fim do período já pago.",
  },
]

export function SeloConfianca({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid grid-cols-1 gap-4 text-left sm:grid-cols-3 ${className}`}>
      {ITENS.map(({ icone: Icone, titulo, texto }) => (
        <li key={titulo} className="flex gap-3">
          <Icone aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium">{titulo}</p>
            <p className="text-xs text-muted-foreground">{texto}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}