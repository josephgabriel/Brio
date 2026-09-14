import { useRef, useState } from "react"
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"

const LARGURA_MINIMA = 80
const LARGURA_MAXIMA = 640

export function ImagemRedimensionavel({ node, updateAttributes, selected }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [redimensionando, setRedimensionando] = useState(false)

  function iniciarRedimensionamento(evento: React.MouseEvent) {
    evento.preventDefault()
    setRedimensionando(true)

    const larguraInicial = imgRef.current?.offsetWidth ?? 200
    const xInicial = evento.clientX

    function aoMover(e: MouseEvent) {
      const deltaX = e.clientX - xInicial
      const novaLargura = Math.min(
        LARGURA_MAXIMA,
        Math.max(LARGURA_MINIMA, larguraInicial + deltaX),
      )
      updateAttributes({ width: `${novaLargura}px` })
    }

    function aoSoltar() {
      setRedimensionando(false)
      window.removeEventListener("mousemove", aoMover)
      window.removeEventListener("mouseup", aoSoltar)
    }

    window.addEventListener("mousemove", aoMover)
    window.addEventListener("mouseup", aoSoltar)
  }

  return (
    <NodeViewWrapper
      as="div"
      className="relative my-2 inline-block"
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
          onMouseDown={iniciarRedimensionamento}
          className={`absolute bottom-0 right-0 size-3.5 translate-x-1/2 translate-y-1/2 cursor-nwse-resize rounded-full border-2 border-background bg-primary ${
            redimensionando ? "scale-125" : ""
          }`}
        />
      )}
    </NodeViewWrapper>
  )
}