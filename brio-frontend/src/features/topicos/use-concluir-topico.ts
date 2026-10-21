import { useMutation, useQueryClient } from "@tanstack/react-query"

import { definirTopicoConcluido } from "@/features/topicos/api/topicos-api"
import type { Topico } from "@/features/topicos/types"
import { notificar } from "@/lib/toast"

export function useConcluirTopico(disciplinaId: number | null) {
  const queryClient = useQueryClient()
  const chaveTopicos = ["topicos", disciplinaId]

  return useMutation({
    mutationFn: ({ topicoId, concluido }: { topicoId: number; concluido: boolean }) =>
      definirTopicoConcluido(topicoId, concluido),

    onMutate: async ({ topicoId, concluido }) => {
      await queryClient.cancelQueries({ queryKey: chaveTopicos })
      const listaAnterior = queryClient.getQueryData<Topico[]>(chaveTopicos)

      queryClient.setQueryData<Topico[]>(chaveTopicos, (lista) =>
        lista?.map((topico) => (topico.id === topicoId ? { ...topico, concluido } : topico)),
      )

      return { listaAnterior }
    },

    onError: (erro, _variaveis, contexto) => {
      if (contexto?.listaAnterior) {
        queryClient.setQueryData(chaveTopicos, contexto.listaAnterior)
      }
      notificar.erro(erro)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["topicos"] })
      queryClient.invalidateQueries({ queryKey: ["disciplinas"] })
    },
  })
}