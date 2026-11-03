import { useMutation, useQueryClient } from "@tanstack/react-query"

import { definirConclusaoAtividade } from "@/features/cronograma/api/cronograma-api"
import type { OcorrenciaCronograma } from "@/features/cronograma/types"
import { notificar } from "@/lib/toast"

interface Variaveis {
  itemId: number
  data: string
  concluido: boolean
}

export function useConcluirAtividade(chaveSemana: readonly unknown[]) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, data, concluido }: Variaveis) =>
      definirConclusaoAtividade(itemId, data, concluido),

    onMutate: async ({ itemId, data, concluido }) => {
      await queryClient.cancelQueries({ queryKey: chaveSemana })
      const anterior = queryClient.getQueryData<OcorrenciaCronograma[]>(chaveSemana)

      queryClient.setQueryData<OcorrenciaCronograma[]>(chaveSemana, (lista) =>
        lista?.map((o) => (o.item_id === itemId && o.data === data ? { ...o, concluido } : o)),
      )
      return { anterior }
    },

    onError: (erro, _variaveis, contexto) => {
      if (contexto?.anterior) queryClient.setQueryData(chaveSemana, contexto.anterior)
      notificar.erro(erro)
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: ["cronograma-semana"] }),
  })
}