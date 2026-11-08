import { AlertTriangle, Bookmark, Sparkles } from "lucide-react"

import { plural } from "@/features/cronograma/semana"
import { formatarData } from "@/features/ia/formatacao"
import { rotuloNivel } from "@/features/resumos/formatacao"
import type { ResumoDetalhe } from "@/features/resumos/types"

// Todo o conteúdo entra como texto: o React escapa tudo, e nada daqui é interpretado como HTML.
export function ConteudoResumo({ resumo }: { resumo: ResumoDetalhe }) {
  const c = resumo.conteudo
  const parcial = resumo.paginas_lidas < resumo.total_paginas

  return (
    <article className="flex flex-col gap-6">
      <header>
        <h2 className="break-words text-xl font-semibold sm:text-2xl">{c.titulo}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="break-all">{resumo.nome_arquivo}</span> ·{" "}
          {formatarData(resumo.criado_em)} · Resumo {rotuloNivel(resumo.nivel).toLowerCase()}
        </p>
      </header>

      {parcial ? (
        <div
          role="note"
          className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p>
            Este resumo cobre o começo do PDF (cerca de {resumo.paginas_lidas} das{" "}
            {resumo.total_paginas} páginas). O restante não foi incluído.
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Cobre {plural(resumo.total_paginas, "página", "páginas")} do PDF.
        </p>
      )}

      <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          <Sparkles className="size-4" />
          Visão geral
        </h3>
        <p className="mt-2 text-sm leading-relaxed">{c.visao_geral}</p>
      </section>

      <section className="flex flex-col gap-4">
        {c.topicos.map((topico, indice) => (
          <div
            key={`${indice}-${topico.titulo}`}
            className="rounded-2xl border border-border bg-card p-4 sm:p-5"
          >
            <h3 className="flex items-start gap-3 text-base font-semibold">
              <span
                aria-hidden
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-300"
              >
                {indice + 1}
              </span>
              <span className="min-w-0 break-words">{topico.titulo}</span>
            </h3>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-emerald-500">
              {topico.pontos.map((ponto, i) => (
                <li key={i}>{ponto}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {c.conceitos_chave.length > 0 && (
        <section>
          <h3 className="mb-3 text-base font-semibold">Conceitos-chave</h3>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {c.conceitos_chave.map((conceito, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <dt className="text-sm font-semibold">{conceito.termo}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {conceito.definicao}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {c.para_memorizar.length > 0 && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Bookmark className="size-4 text-amber-600 dark:text-amber-400" />
            Para memorizar
          </h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed marker:text-amber-500">
            {c.para_memorizar.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-muted-foreground">
        Resumo gerado por IA. Pode conter erros ou omissões: confira sempre com o material
        original.
      </p>
    </article>
  )
}