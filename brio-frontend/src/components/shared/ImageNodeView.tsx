import { useCallback, useRef, useState } from "react"
import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react"

export function ImageNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const [resizing, setResizing] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!imageRef.current) return

      startXRef.current = e.clientX
      startWidthRef.current = imageRef.current.clientWidth
      setResizing(true)

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startXRef.current
        const newWidth = Math.max(100, startWidthRef.current + deltaX)
        updateAttributes({ width: `${newWidth}px` })
      }

      const handleMouseUp = () => {
        setResizing(false)
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [updateAttributes],
  )

  const width = node.attrs.width || "400px"

  return (
    <NodeViewWrapper className="inline-block max-w-full my-2 relative leading-none select-none">
      <div
        className={`relative inline-block group ${
          selected ? "ring-2 ring-primary ring-offset-2 rounded-md" : ""
        }`}
        style={{ width }}
      >
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ""}
          className="rounded-md w-full h-auto block"
        />

        {/* Alça de redimensionamento no canto inferior direito */}
        <div
          onMouseDown={handleMouseDown}
          className={`absolute bottom-1 right-1 w-3.5 h-3.5 bg-primary rounded-sm cursor-nwse-resize border border-background shadow-md transition-opacity ${
            selected || resizing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          title="Arrastre para redimensionar"
        />
      </div>
    </NodeViewWrapper>
  )
}