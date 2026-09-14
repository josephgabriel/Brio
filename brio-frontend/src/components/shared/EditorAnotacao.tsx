import { useCallback, useEffect, useState } from "react"
import { EditorContent, ReactNodeViewRenderer, useEditor, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import CharacterCount from "@tiptap/extension-character-count"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Ban,
  Bold,
  Check,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Palette,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Type,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ImagemRedimensionavel } from "@/components/shared/ImagemRedimensionavel"
import { enviarImagem } from "@/features/uploads/uploads-api"
import { useDebounce } from "@/hooks/useDebounce"

interface EditorAnotacaoProps {
  conteudoInicial: string
  onSalvar: (html: string) => void
}

// Paleta Curada e Suave (Ideal para Leitura e Estudo)
const CORES_DESTAQUE = [
  { nome: "Amarelo Soft", hex: "#FEF08A" },
  { nome: "Menta Soft", hex: "#BBF7D0" },
  { nome: "Azul Soft", hex: "#BFDBFE" },
  { nome: "Rosa Soft", hex: "#FBCFE8" },
  { nome: "Roxo Soft", hex: "#DDD6FE" },
]

const CORES_TEXTO = [
  { nome: "Padrão", hex: "inherit" },
  { nome: "Grafite", hex: "#374151" },
  { nome: "Vermelho Soft", hex: "#EF4444" },
  { nome: "Verde Soft", hex: "#10B981" },
  { nome: "Azul Soft", hex: "#3B82F6" },
  { nome: "Roxo Soft", hex: "#8B5CF6" },
]

const CLASSES_CONTEUDO =
  "mx-auto min-h-[560px] max-w-[760px] rounded-b-xl border border-t-0 border-border bg-card p-8 md:p-12 " +
  "text-sm leading-relaxed text-card-foreground shadow-sm focus:outline-none " +
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5 " +
  "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 " +
  "[&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-tight " +
  "[&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight " +
  "[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold " +
  "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 " +
  "[&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground " +
  "[&_hr]:my-6 [&_hr]:border-border/60 [&_p]:my-2"

const ImagemComRedimensionamento = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: "100%" },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImagemRedimensionavel)
  },
})

function rotuloBlocoAtual(editor: Editor): string {
  if (editor.isActive("heading", { level: 1 })) return "titulo1"
  if (editor.isActive("heading", { level: 2 })) return "titulo2"
  if (editor.isActive("heading", { level: 3 })) return "titulo3"
  return "paragrafo"
}

interface BotaoFerramentaProps {
  ativo?: boolean
  rotulo: string
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
}

function BotaoFerramenta({ ativo, rotulo, onClick, disabled, children }: BotaoFerramentaProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={ativo ? "secondary" : "ghost"}
          size="icon"
          className={`h-8 w-8 rounded-md transition-colors ${
            ativo ? "bg-accent text-accent-foreground font-medium shadow-xs" : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {rotulo}
      </TooltipContent>
    </Tooltip>
  )
}

function DivisorToolbar() {
  return <div className="mx-0.5 h-4 w-px bg-border/60 shrink-0" />
}

export function EditorAnotacao({ conteudoInicial, onSalvar }: EditorAnotacaoProps) {
  const [salvando, setSalvando] = useState(false)
  const [enviandoImagem, setEnviandoImagem] = useState(false)
  
  const salvarComDebounce = useDebounce((html: string) => {
    onSalvar(html)
    setSalvando(false)
  }, 1500)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CharacterCount,
      Highlight.configure({ multicolor: true }),
      ImagemComRedimensionamento,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "cursor-pointer" } }),
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

  function inserirLink() {
    const url = window.prompt("Digite a URL do link:")
    if (url) {
      editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }
  }

  function aplicarBloco(valor: string) {
    if (!editor) return
    if (valor === "paragrafo") editor.chain().focus().setParagraph().run()
    if (valor === "titulo1") editor.chain().focus().toggleHeading({ level: 1 }).run()
    if (valor === "titulo2") editor.chain().focus().toggleHeading({ level: 2 }).run()
    if (valor === "titulo3") editor.chain().focus().toggleHeading({ level: 3 }).run()
  }

  if (!editor) {
    return null
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col">
        {/* TOOLBAR UNIFICADA */}
        <div className="sticky top-2 z-10 mx-auto flex w-full max-w-[760px] items-center justify-between gap-1.5 rounded-t-xl border border-border bg-background/95 p-1.5 backdrop-blur-md shadow-xs">
          <div className="flex flex-wrap items-center gap-0.5 overflow-x-auto no-scrollbar">
            
            {/* Agrupamento: Desfazer / Refazer */}
            <BotaoFerramenta
              rotulo="Desfazer"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo2 className="size-4" />
            </BotaoFerramenta>
            <BotaoFerramenta
              rotulo="Refazer"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo2 className="size-4" />
            </BotaoFerramenta>

            <DivisorToolbar />

            {/* Selector Tipo de Bloco */}
            <Select value={rotuloBlocoAtual(editor)} onValueChange={aplicarBloco}>
              <SelectTrigger className="h-8 w-[130px] border-none bg-transparent hover:bg-accent text-xs font-medium focus:ring-0">
                <SelectValue placeholder="Estilo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paragrafo">
                  <div className="flex items-center gap-2">
                    <Pilcrow className="size-3.5 text-muted-foreground" />
                    <span>Texto normal</span>
                  </div>
                </SelectItem>
                <SelectItem value="titulo1">
                  <div className="flex items-center gap-2 font-bold">
                    <Heading1 className="size-3.5 text-muted-foreground" />
                    <span>Título 1</span>
                  </div>
                </SelectItem>
                <SelectItem value="titulo2">
                  <div className="flex items-center gap-2 font-semibold">
                    <Heading2 className="size-3.5 text-muted-foreground" />
                    <span>Título 2</span>
                  </div>
                </SelectItem>
                <SelectItem value="titulo3">
                  <div className="flex items-center gap-2 font-medium">
                    <Heading3 className="size-3.5 text-muted-foreground" />
                    <span>Título 3</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <DivisorToolbar />

            {/* Formatação Básica */}
            <BotaoFerramenta
              rotulo="Negrito"
              ativo={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="size-4" />
            </BotaoFerramenta>
            <BotaoFerramenta
              rotulo="Itálico"
              ativo={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="size-4" />
            </BotaoFerramenta>
            <BotaoFerramenta
              rotulo="Sublinhado"
              ativo={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="size-4" />
            </BotaoFerramenta>
            <BotaoFerramenta
              rotulo="Tachado"
              ativo={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="size-4" />
            </BotaoFerramenta>

            <DivisorToolbar />

            {/* Listas e Estrutura */}
            <BotaoFerramenta
              rotulo="Lista com marcadores"
              ativo={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="size-4" />
            </BotaoFerramenta>
            <BotaoFerramenta
              rotulo="Lista numerada"
              ativo={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="size-4" />
            </BotaoFerramenta>
            <BotaoFerramenta
              rotulo="Citação"
              ativo={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="size-4" />
            </BotaoFerramenta>

            <DivisorToolbar />

            {/* Cores & Highlights */}
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Highlighter className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <div className="text-[10px] font-semibold text-muted-foreground mb-1.5 px-1">COR DE DESTAQUE</div>
                <div className="flex items-center gap-1.5">
                  {CORES_DESTAQUE.map((cor) => (
                    <button
                      key={cor.hex}
                      type="button"
                      title={cor.nome}
                      className="size-6 rounded-md border border-border/80 transition-transform hover:scale-110 focus:outline-none"
                      style={{ backgroundColor: cor.hex }}
                      onClick={() => editor.chain().focus().toggleHighlight({ color: cor.hex }).run()}
                    />
                  ))}
                  <button
                    type="button"
                    title="Remover destaque"
                    className="flex size-6 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-accent"
                    onClick={() => editor.chain().focus().unsetHighlight().run()}
                  >
                    <Ban className="size-3.5" />
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Palette className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <div className="text-[10px] font-semibold text-muted-foreground mb-1.5 px-1">COR DO TEXTO</div>
                <div className="flex items-center gap-1.5">
                  {CORES_TEXTO.map((cor) => (
                    <button
                      key={cor.hex}
                      type="button"
                      title={cor.nome}
                      className="size-6 rounded-md border border-border/80 transition-transform hover:scale-110 focus:outline-none"
                      style={{ backgroundColor: cor.hex === "inherit" ? "transparent" : cor.hex }}
                      onClick={() => {
                        if (cor.hex === "inherit") {
                          editor.chain().focus().unsetColor().run()
                        } else {
                          editor.chain().focus().setColor(cor.hex).run()
                        }
                      }}
                    >
                      {cor.hex === "inherit" && <Type className="size-3.5 mx-auto text-muted-foreground" />}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <DivisorToolbar />

            {/* Mídia e Mídia Externa */}
            <BotaoFerramenta
              rotulo="Inserir link"
              ativo={editor.isActive("link")}
              onClick={inserirLink}
            >
              <LinkIcon className="size-4" />
            </BotaoFerramenta>

            <Tooltip>
              <TooltipTrigger asChild>
                <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={handleSelecionarArquivo}
                  />
                  <ImagePlus className="size-4" />
                </label>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Inserir imagem
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Status Discreto */}
          <div className="flex items-center pl-2 border-l border-border/40 shrink-0">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted/50">
              {enviandoImagem ? (
                <>
                  <Loader2 className="size-3 animate-spin text-primary" />
                  <span className="hidden sm:inline">Enviando...</span>
                </>
              ) : salvando ? (
                <>
                  <Loader2 className="size-3 animate-spin text-muted-foreground" />
                  <span className="hidden sm:inline">Salvando...</span>
                </>
              ) : (
                <>
                  <Check className="size-3 text-emerald-500" />
                  <span className="hidden sm:inline text-muted-foreground">Salvo</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* ÁREA DO EDITOR */}
        <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onPaste={handlePaste}>
          <EditorContent editor={editor} />
        </div>

        {/* CONTADOR DE PALAVRAS / RODAPÉ */}
        <div className="mx-auto flex w-full max-w-[760px] justify-end pt-2 px-2 text-xs text-muted-foreground/80 font-mono">
          {editor.storage.characterCount.words()} palavras ·{" "}
          {editor.storage.characterCount.characters()} caracteres
        </div>
      </div>
    </TooltipProvider>
  )
}