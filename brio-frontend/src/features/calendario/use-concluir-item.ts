import { useMutation, useQueryClient } from "@tanstack/react-query"

import { atualizarEvento } from "@/features/calendario/api/calendario-api"
import type { ItemCalendario } from "@/features/calendario/types"
import { concluirRevisao } from "@/features/revisoes/api/revisoes-api"
import { notificar } from "@/lib/toast"

interface Variaveis {
  item: ItemCalendario
  concluido: boolean
}

export function useConcluirItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ item, concluido }: Variaveis) => {
      if (item.tipo === "revisao") await concluirRevisao(item.id)
      else await atualizarEvento(item.id, { concluido })
    },

    onMutate: async ({ item, concluido }) => {
      await queryClient.cancelQueries({ queryKey: ["calendario"] })
      const anteriores = queryClient.getQueriesData<ItemCalendario[]>({
        queryKey: ["calendario"],
      })

      // O mesmo item pode estar no cache do mês e no da agenda: atualiza todos de uma vez
      queryClient.setQueriesData<ItemCalendario[]>({ queryKey: ["calendario"] }, (lista) =>
        lista?.map((i) =>
          i.tipo === item.tipo && i.id === item.id ? { ...i, concluido } : i,
        ),
      )
      return { anteriores }
    },

    onError: (erro, _variaveis, contexto) => {
      contexto?.anteriores.forEach(([chave, dados]) => queryClient.setQueryData(chave, dados))
      notificar.erro(erro)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["calendario"] })
      queryClient.invalidateQueries({ queryKey: ["revisoes"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}