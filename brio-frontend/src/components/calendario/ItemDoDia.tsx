import { CheckCircle2 } from "lucide-react"

import { CAMADAS, ehAtrasado } from "@/features/calendario/camadas"
import { contagemProva, diasEntre } from "@/features/calendario/datas"
import type { ItemCalendario } from "@/features/calendario/types"

interface ItemDoDiaProps {
  item: ItemCalendario
  hojeISO: string
  mostrarAtraso?: boolean
  aoAbrir: (item: ItemCalendario) => void
  aoAlternar: (item: ItemCalendario, concluido: boolean) => void
}

export function ItemDoDia({
  item,
  hojeISO,
  mostrarAtraso = false,
  aoAbrir,
  aoAlternar,
}: ItemDoDiaProps) {
  const camada = CAMADAS[item.tipo]
  const Icone = camada.icone
  const atrasado = ehAtrasado(item, hojeISO)
  const feito = item.concluido === true
  const temCheck = item.tipo === "tarefa" || item.tipo === "revisao"
  const revisaoConcluida = item.tipo === "revisao" && feito
  const podeAbrir = item.tipo === "tarefa" || item.tipo === "evento" || item.rota !== null
  const contagem = item.tipo === "prova" ? contagemProva(item.data, hojeISO) : null
  const diasAtraso = atrasado ? diasEntre(item.data, hojeISO) : 0
  const mostrarSubtitulo = !!item.detalhe || (mostrarAtraso && atrasado)

  const textos = (
    <>
      <p
        className={`truncate text-sm font-medium ${
          feito && item.tipo !== "sessao" ? "text-muted-foreground line-through" : ""
        }`}
      >
        {item.titulo}
      </p>
      {mostrarSubtitulo && (
        <p className="truncate text-xs text-muted-foreground">
          {item.detalhe}
          {mostrarAtraso && atrasado && (
            <span className="text-destructive">
              {item.detalhe ? " · " : ""}
              {diasAtraso === 1 ? "venceu ontem" : `venceu há ${diasAtraso} dias`}
            </span>
          )}
        </p>
      )}
    </>
  )

  return (
    <li className="flex items-center gap-3 py-3">
      <div
        aria-hidden
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${camada.iconeFundo} ${camada.iconeTexto}`}
      >
        <Icone className="size-4" />
      </div>

      {podeAbrir ? (
        <button
          type="button"
          onClick={() => aoAbrir(item)}
          title={item.tipo === "tarefa" || item.tipo === "evento" ? "Editar" : "Abrir"}
          className="min-w-0 flex-1 cursor-pointer text-left"
        >
          {textos}
        </button>
      ) : (
        <div className="min-w-0 flex-1">{textos}</div>
      )}

      {contagem && (
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            contagem.urgente
              ? "bg-emerald-500 text-white"
              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          {contagem.rotulo}
        </span>
      )}

      {temCheck && (
        <button
          type="button"
          disabled={revisaoConcluida}
          onClick={() => aoAlternar(item, !feito)}
          aria-pressed={feito}
          aria-label={
            feito ? `Desmarcar ${item.titulo} como concluído` : `Marcar ${item.titulo} como concluído`
          }
          title={revisaoConcluida ? "Revisão concluída" : undefined}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-accent disabled:cursor-default disabled:hover:bg-transparent"
        >
          {feito ? (
            <CheckCircle2 className="size-5 text-emerald-500" />
          ) : (
            <span
              className={`size-4 rounded-full border-2 ${
                atrasado ? "border-destructive" : "border-muted-foreground/50"
              }`}
            />
          )}
        </button>
      )}
    </li>
  )
}