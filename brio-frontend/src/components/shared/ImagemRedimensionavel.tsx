import { useRef, useState } from "react"
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"

const LARGURA_MINIMA = 80
const LARGURA_MAXIMA_PADRAO = 640

export function ImagemRedimensionavel({ node, updateAttributes, selected }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [redimensionando, setRedimensionando] = useState(false)

  function iniciarRedimensionamento(evento: React.PointerEvent<HTMLSpanElement>) {
    evento.preventDefault()
    evento.stopPropagation()
    setRedimensionando(true)

    const larguraInicial = imgRef.current?.offsetWidth ?? 200
    const xInicial = evento.clientX
    // Nunca passa da largura do próprio editor (importante em telas pequenas)
    const larguraEditor = imgRef.current?.closest(".ProseMirror")?.clientWidth
    const maximo = Math.min(LARGURA_MAXIMA_PADRAO, larguraEditor ?? LARGURA_MAXIMA_PADRAO)

    function aoMover(e: PointerEvent) {
      const novaLargura = Math.min(maximo, Math.max(LARGURA_MINIMA, larguraInicial + (e.clientX - xInicial)))
      updateAttributes({ width: `${novaLargura}px` })
    }

    function aoSoltar() {
      setRedimensionando(false)
      window.removeEventListener("pointermove", aoMover)
      window.removeEventListener("pointerup", aoSoltar)
      window.removeEventListener("pointercancel", aoSoltar)
    }

    window.addEventListener("pointermove", aoMover)
    window.addEventListener("pointerup", aoSoltar)
    window.addEventListener("pointercancel", aoSoltar)
  }

  return (
    <NodeViewWrapper
      as="div"
      className="relative my-2 inline-block max-w-full"
      style={{ width: node.attrs.width }}
      data-drag-handle
    >
      <img
        ref={imgRef}
        src={node.attrs.src}
        alt={node.attrs.alt ?? ""}
        className={`block w-full rounded-md ${
          selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
        }`}
        draggable={false}
      />
      {selected && (
        <span
          onPointerDown={iniciarRedimensionamento}
          aria-hidden
          className={`absolute bottom-0 right-0 size-6 translate-x-1/3 translate-y-1/3 cursor-nwse-resize touch-none rounded-full border-2 border-background bg-primary sm:size-4 sm:translate-x-1/2 sm:translate-y-1/2 ${
            redimensionando ? "scale-125" : ""
          }`}
        />
      )}
    </NodeViewWrapper>
  )
}