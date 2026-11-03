import { useMutation, useQueryClient } from "@tanstack/react-query"

import { concluirRevisao } from "@/features/revisoes/api/revisoes-api"
import { apiFetch } from "@/lib/api-client"
import { notificar } from "@/lib/toast"

export interface RevisaoItem {
  id: number
  prova_id: number
  sessao_estudo_id?: number | null
  topico_id: number | null
  disciplina: string
  assunto: string
  intervalo_numero: number
  data_agendada: string
  concluida_em: string | null
}

export const CHAVE_REVISOES = ["revisoes", "todas"] as const

export async function buscarRevisoes(): Promise<RevisaoItem[]> {
  const response = await apiFetch("/api/v1/revisoes")
  if (!response.ok) throw new Error("Não foi possível carregar as revisões")
  return response.json()
}

export function useConcluirRevisao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => concluirRevisao(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: CHAVE_REVISOES })
      const anterior = queryClient.getQueryData<RevisaoItem[]>(CHAVE_REVISOES)
      queryClient.setQueryData<RevisaoItem[]>(CHAVE_REVISOES, (lista) =>
        lista?.map((r) => (r.id === id ? { ...r, concluida_em: new Date().toISOString() } : r)),
      )
      return { anterior }
    },

    onError: (erro, _id, contexto) => {
      if (contexto?.anterior) queryClient.setQueryData(CHAVE_REVISOES, contexto.anterior)
      notificar.erro(erro)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["revisoes"] })
      queryClient.invalidateQueries({ queryKey: ["calendario"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}