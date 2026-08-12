import { useCallback, useEffect, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import {
  Ban,
  Bold,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Underline as UnderlineIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { enviarImagem } from "@/features/uploads/uploads-api"
import { useDebounce } from "@/hooks/useDebounce"

interface EditorAnotacaoProps {
  conteudoInicial: string
  onSalvar: (html: string) => void
}

const CORES_DESTAQUE = ["#FEF08A", "#BBF7D0", "#BFDBFE", "#FBCFE8"]
const CORES_TEXTO = ["#17181B", "#DC2626", "#16A34A", "#4F46E5", "#FFFFFF"]
const TAMANHOS_IMAGEM = [
  { label: "P", largura: "240px" },
  { label: "M", largura: "400px" },
  { label: "G", largura: "100%" },
]

const CLASSES_CONTEUDO =
  "min-h-[300px] rounded-b-lg border border-border bg-background p-4 text-sm " +
  "focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 " +
  "[&_img]:rounded-md [&_img]:my-2 [&_a]:text-primary [&_a]:underline"

export function EditorAnotacao({ conteudoInicial, onSalvar }: EditorAnotacaoProps) {
  const [salvando, setSalvando] = useState(false)
  const [enviandoImagem, setEnviandoImagem] = useState(false)
  const salvarComDebounce = useDebounce((html: string) => {
    onSalvar(html)
    setSalvando(false)
  }, 2000)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      Highlight.configure({ multicolor: true }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: { default: "400px" },
          }
        },
      }),
      Link.configure({ openOnClick: false }),
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

  useEffect(() => {
    if (editor && conteudoInicial !== editor.getHTML()) {
      editor.commands.setContent(conteudoInicial)
    }
  }, [conteudoInicial, editor])

  const inserirImagem = useCallback(
    async (arquivo: File) => {
      if (!editor) return
      setEnviandoImagem(true)
      try {
        const url = await enviarImagem(arquivo)
        editor.chain().focus().setImage({ src: url }).run()
      } catch (erro) {
        console.error(erro)
      } finally {
        setEnviandoImagem(false)
      }
    },
    [editor],
  )

  const handleSelecionarArquivo = useCallback(
    (evento: React.ChangeEvent<HTMLInputElement>) => {
      const arquivo = evento.target.files?.[0]
      if (arquivo) inserirImagem(arquivo)
      evento.target.value = ""
    },
    [inserirImagem],
  )

  const handleDrop = useCallback(
    (evento: React.DragEvent<HTMLDivElement>) => {
      const arquivo = evento.dataTransfer.files?.[0]
      if (arquivo?.type.startsWith("image/")) {
        evento.preventDefault()
        inserirImagem(arquivo)
      }
    },
    [inserirImagem],
  )

  const handlePaste = useCallback(
    (evento: React.ClipboardEvent<HTMLDivElement>) => {
      const item = Array.from(evento.clipboardData.items).find((i) =>
        i.type.startsWith("image/"),
      )
      const arquivo = item?.getAsFile()
      if (arquivo) {
        evento.preventDefault()
        inserirImagem(arquivo)
      }
    },
    [inserirImagem],
  )

  function alterarTamanhoImagemSelecionada(largura: string) {
    editor?.chain().focus().updateAttributes("image", { width: largura }).run()
  }

  function inserirLink() {
    const url = window.prompt("URL do link:")
    if (url) {
      editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }
  }

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
        <Button
          type="button"
          variant={editor.isActive("underline") ? "secondary" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-4" />
        </Button>

        <div className="mx-1 h-5 w-px bg-border" />

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
        <Button
          type="button"
          variant={editor.isActive("link") ? "secondary" : "ghost"}
          size="sm"
          onClick={inserirLink}
        >
          <LinkIcon className="size-4" />
        </Button>

        <div className="mx-1 h-5 w-px bg-border" />

        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleSelecionarArquivo}
          />
          <span className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent">
            <ImagePlus className="size-4" />
          </span>
        </label>

        {editor.isActive("image") &&
          TAMANHOS_IMAGEM.map((tamanho) => (
            <button
              key={tamanho.label}
              type="button"
              onClick={() => alterarTamanhoImagemSelecionada(tamanho.largura)}
              className="flex size-7 items-center justify-center rounded-md text-xs text-muted-foreground hover:bg-accent"
            >
              {tamanho.label}
            </button>
          ))}

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
          {enviandoImagem ? "Enviando imagem..." : salvando ? "Salvando..." : "Salvo"}
        </span>
      </div>

      <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onPaste={handlePaste}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}