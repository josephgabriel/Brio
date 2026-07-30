import { useEffect, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import { AlignCenter, AlignLeft, AlignRight, Ban, Bold, Italic, List, ListOrdered } from "lucide-react"
import TextAlign from "@tiptap/extension-text-align"

import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/useDebounce"

interface EditorAnotacaoProps {
  conteudoInicial: string
  onSalvar: (html: string) => void
}

const CORES_DESTAQUE = ["#FEF08A", "#BBF7D0", "#BFDBFE", "#FBCFE8"]
const CORES_TEXTO = ["#17181B", "#DC2626", "#16A34A", "#4F46E5", "#FFFFFF"]

const CLASSES_CONTEUDO =
  "min-h-[300px] rounded-b-lg border border-border bg-background p-4 text-sm " +
  "focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1"

export function EditorAnotacao({ conteudoInicial, onSalvar }: EditorAnotacaoProps) {
  const [salvando, setSalvando] = useState(false)
  const salvarComDebounce = useDebounce((html: string) => {
    onSalvar(html)
    setSalvando(false)
  }, 2000)

  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"]})
    ],
    content: conteudoInicial,
    onUpdate: ({ editor }) => {
      setSalvando(true)
      salvarComDebounce(editor.getHTML())
    },
    editorProps: {
      attributes: { class: CLASSES_CONTEUDO },
    },
  })

  // Se o tópico visualizado muda (troca no drawer, ou navegação entre
  // anotações) SEM o componente desmontar, o editor precisa ser
  // "realimentado" manualmente com o novo conteúdo.
  useEffect(() => {
    if (editor && conteudoInicial !== editor.getHTML()) {
      editor.commands.setContent(conteudoInicial)
    }
  }, [conteudoInicial, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-border bg-muted p-2">
        <Button
          type="button"
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </Button>

        <div className="mx-1 h-5 w-px bg-border" />

        <Button
          type="button"
          variant={editor.isActive({ textAlign: "left" }) ? "secondary" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive({ textAlign: "center" }) ? "secondary" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="size-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive({ textAlign: "right" }) ? "secondary" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="size-4" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </Button>

        <div className="mx-1 h-5 w-px bg-border" />

        <span className="text-xs text-muted-foreground">Destaque:</span>
        {CORES_DESTAQUE.map((cor) => (
          <button
            key={cor}
            type="button"
            className="size-5 rounded-full border border-border"
            style={{ backgroundColor: cor }}
            onClick={() => editor.chain().focus().toggleHighlight({ color: cor }).run()}
          />
        ))}
        <button
          type="button"
          title="Remover destaque"
          className="flex size-5 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"
          onClick={() => editor.chain().focus().unsetHighlight().run()}
        >
          <Ban className="size-3.5" />
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        <span className="text-xs text-muted-foreground">Cor:</span>
        {CORES_TEXTO.map((cor) => (
          <button
            key={cor}
            type="button"
            className="size-5 rounded-full border border-border"
            style={{ backgroundColor: cor }}
            onClick={() => editor.chain().focus().setColor(cor).run()}
          />
        ))}

        <span className="ml-auto text-xs text-muted-foreground">
          {salvando ? "Salvando..." : "Salvo"}
        </span>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}