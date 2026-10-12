import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface OpcoesConfirmacao {
  titulo: string
  descricao?: string
  textoConfirmar?: string
  textoCancelar?: string
  destrutivo?: boolean
}

type Confirmar = (opcoes: OpcoesConfirmacao) => Promise<boolean>

const ConfirmacaoContext = createContext<Confirmar | undefined>(undefined)

export function ConfirmacaoProvider({ children }: { children: ReactNode }) {
  const [aberto, setAberto] = useState(false)
  const [opcoes, setOpcoes] = useState<OpcoesConfirmacao>({ titulo: "" })
  const resolverRef = useRef<((resposta: boolean) => void) | null>(null)

  const confirmar = useCallback<Confirmar>((novasOpcoes) => {
    resolverRef.current?.(false)
    setOpcoes(novasOpcoes)
    setAberto(true)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  function responder(resposta: boolean) {
    resolverRef.current?.(resposta)
    resolverRef.current = null
    setAberto(false)
  }

  return (
    <ConfirmacaoContext.Provider value={confirmar}>
      {children}

      <Dialog
        open={aberto}
        onOpenChange={(novoEstado) => {
          if (!novoEstado) responder(false)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{opcoes.titulo}</DialogTitle>
          </DialogHeader>

          {opcoes.descricao && (
            <p className="text-sm text-muted-foreground">{opcoes.descricao}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => responder(false)}>
              {opcoes.textoCancelar ?? "Cancelar"}
            </Button>
            <Button
              type="button"
              variant={opcoes.destrutivo ? "destructive" : "default"}
              onClick={() => responder(true)}
            >
              {opcoes.textoConfirmar ?? "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmacaoContext.Provider>
  )
}

export function useConfirmar(): Confirmar {
  const contexto = useContext(ConfirmacaoContext)
  if (contexto === undefined) {
    throw new Error("useConfirmar precisa ser usado dentro de um ConfirmacaoProvider")
  }
  return contexto
}