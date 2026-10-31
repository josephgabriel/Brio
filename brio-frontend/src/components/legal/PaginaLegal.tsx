import { useEffect } from "react"
import { Link } from "react-router-dom"

import {
  DATA_ATUALIZACAO,
  VERSAO_TERMOS,
  camposPendentes,
} from "@/features/legal/constantes"
import type { Secao } from "@/features/legal/tipos"

interface PaginaLegalProps {
  titulo: string
  resumo: string
  secoes: Secao[]
  atual: "termos" | "privacidade"
}

function classeNavegacao(ativo: boolean): string {
  return ativo ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
}

export function PaginaLegal({ titulo, resumo, secoes, atual }: PaginaLegalProps) {
  const pendentes = import.meta.env.DEV ? camposPendentes() : []

  useEffect(() => {
    // Ao trocar de documento, volta ao topo (a menos que a URL já aponte para uma seção)
    if (!window.location.hash) window.scrollTo(0, 0)
  }, [titulo])

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold">
            Brio
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link
              to="/termos"
              aria-current={atual === "termos" ? "page" : undefined}
              className={classeNavegacao(atual === "termos")}
            >
              Termos de Uso
            </Link>
            <Link
              to="/privacidade"
              aria-current={atual === "privacidade" ? "page" : undefined}
              className={classeNavegacao(atual === "privacidade")}
            >
              Privacidade
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        {pendentes.length > 0 && (
          <div
            role="alert"
            className="mb-8 rounded-lg border border-status-atencao/40 bg-status-atencao/10 p-4 text-sm"
          >
            Rascunho: faltam preencher {pendentes.join(", ")} em{" "}
            <code>src/features/legal/constantes.ts</code>. Este aviso só aparece em
            desenvolvimento.
          </div>
        )}

        <h1 className="text-3xl font-semibold">{titulo}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Versão {VERSAO_TERMOS} · atualizada em {DATA_ATUALIZACAO}
        </p>
        <p className="mt-6 text-muted-foreground">{resumo}</p>

        <nav aria-label="Sumário" className="mt-8 rounded-xl border border-border bg-card p-5">
          <p className="mb-2 text-sm font-medium">Nesta página</p>
          <ol className="flex flex-col gap-1 text-sm text-muted-foreground">
            {secoes.map((secao, indice) => (
              <li key={secao.titulo}>
                <a
                  href={`#secao-${indice + 1}`}
                  className="hover:text-foreground hover:underline"
                >
                  {indice + 1}. {secao.titulo}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 flex flex-col gap-10">
          {secoes.map((secao, indice) => (
            <section key={secao.titulo} id={`secao-${indice + 1}`} className="scroll-mt-6">
              <h2 className="mb-3 text-xl font-semibold">
                {indice + 1}. {secao.titulo}
              </h2>
              <div className="flex flex-col gap-3 text-sm leading-relaxed">
                {secao.blocos.map((bloco, posicao) =>
                  typeof bloco === "string" ? (
                    <p key={posicao}>{bloco}</p>
                  ) : (
                    <ul key={posicao} className="list-disc space-y-1.5 pl-6">
                      {bloco.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}