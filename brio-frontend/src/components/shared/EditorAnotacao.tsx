import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
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
  Palette,
  Pilcrow,
  Quote,
  Redo2,
  RotateCw,
  Strikethrough,
  Type,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react"

import { notificar } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  chaveRascunho: string
  onSalvar: (html: string) => Promise<unknown>
}

// Cores com contraste razoável tanto no tema claro quanto no escuro.
// (O "Grafite" antigo, #374151, quase sumia no fundo escuro.)
const CORES_DESTAQUE = [
  { nome: "Amarelo", hex: "#FEF08A" },
  { nome: "Menta", hex: "#BBF7D0" },
  { nome: "Azul", hex: "#BFDBFE" },
  { nome: "Rosa", hex: "#FBCFE8" },
  { nome: "Roxo", hex: "#DDD6FE" },
]

const CORES_TEXTO = [
  { nome: "Padrão", hex: "inherit" },
  { nome: "Cinza", hex: "#6B7280" },
  { nome: "Vermelho", hex: "#EF4444" },
  { nome: "Verde", hex: "#10B981" },
  { nome: "Azul", hex: "#3B82F6" },
  { nome: "Roxo", hex: "#8B5CF6" },
]

const CLASSES_CONTEUDO =
  "mx-auto min-h-[320px] sm:min-h-[560px] max-w-[760px] rounded-b-xl border border-t-0 border-border bg-card p-4 sm:p-8 md:p-12 " +
  "text-base leading-7 text-card-foreground shadow-sm focus:outline-none " +
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5 " +
  "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 " +
  "[&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-tight " +
  "[&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight " +
  "[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold " +
  "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 " +
  "[&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground " +
  "[&_hr]:my-6 [&_hr]:border-border/60 [&_p]:my-2 " +
  // Destaque tem fundo pastel: no tema escuro o texto claro herdado ficava ilegível em cima dele
  "[&_mark]:rounded-sm [&_mark]:px-0.5 [&_mark]:text-zinc-900"

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

// Rascunho local: se o armazenamento do navegador estiver bloqueado (aba privada, por exemplo),
// o editor continua funcionando, só sem o rascunho.
function lerRascunho(chave: string): string | null {
  try {
    return localStorage.getItem(chave)
  } catch {
    return null
  }
}

function gravarRascunho(chave: string, html: string) {
  try {
    localStorage.setItem(chave, html)
  } catch {
    // sem armazenamento local: segue sem rascunho
  }
}

function apagarRascunho(chave: string) {
  try {
    localStorage.removeItem(chave)
  } catch {
    // sem armazenamento local: nada a apagar
  }
}

const EH_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform)
const MOD = EH_MAC ? "⌘" : "Ctrl+"

type Bloco = "paragrafo" | "titulo1" | "titulo2" | "titulo3"
type Alinhamento = "left" | "center" | "right" | "justify"

const ROTULO_BLOCO: Record<Bloco, string> = {
  paragrafo: "Texto normal",
  titulo1: "Título 1",
  titulo2: "Título 2",
  titulo3: "Título 3",
}

function blocoAtual(editor: Editor): Bloco {
  if (editor.isActive("heading", { level: 1 })) return "titulo1"
  if (editor.isActive("heading", { level: 2 })) return "titulo2"
  if (editor.isActive("heading", { level: 3 })) return "titulo3"
  return "paragrafo"
}

function alinhamentoAtual(editor: Editor): Alinhamento {
  if (editor.isActive({ textAlign: "center" })) return "center"
  if (editor.isActive({ textAlign: "right" })) return "right"
  if (editor.isActive({ textAlign: "justify" })) return "justify"
  return "left"
}

const ALINHAMENTOS: { valor: Alinhamento; rotulo: string; icone: typeof AlignLeft }[] = [
  { valor: "left", rotulo: "Alinhar à esquerda", icone: AlignLeft },
  { valor: "center", rotulo: "Centralizar", icone: AlignCenter },
  { valor: "right", rotulo: "Alinhar à direita", icone: AlignRight },
  { valor: "justify", rotulo: "Justificar", icone: AlignJustify },
]

// Botões de ícone da barra: um estilo só, ativo na cor da marca
const CLASSE_BOTAO =
  "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "disabled:pointer-events-none disabled:opacity-40 sm:size-8"

function classeBotao(ativo?: boolean): string {
  return `${CLASSE_BOTAO} ${
    ativo
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-accent hover:text-foreground"
  }`
}

interface BotaoFerramentaProps {
  ativo?: boolean
  rotulo: string
  atalho?: string
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
}

/**
 * O gatilho do tooltip já é o botão. Antes havia um <Button> dentro dele (botão dentro de
 * botão), e o botão só tinha o tooltip como nome, que não aparece no celular nem para leitor de tela.
 */
function BotaoFerramenta({ ativo, rotulo, atalho, onClick, disabled, children }: BotaoFerramentaProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-label={rotulo}
        aria-pressed={ativo}
        className={classeBotao(ativo)}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs [@media(hover:none)]:hidden">
        {rotulo}
        {atalho && <span className="ml-2 opacity-70">{atalho}</span>}
      </TooltipContent>
    </Tooltip>
  )
}

function DivisorToolbar() {
  return <div role="separator" aria-orientation="vertical" className="mx-1 h-5 w-px shrink-0 bg-border" />
}

interface AmostraProps {
  nome: string
  cor: string
  ativa: boolean
  corDoCheck: string
  onClick: () => void
  children?: ReactNode
}

function Amostra({ nome, cor, ativa, corDoCheck, onClick, children }: AmostraProps) {
  return (
    <button
      type="button"
      title={nome}
      aria-label={nome}
      aria-pressed={ativa}
      onClick={onClick}
      className={`flex size-9 items-center justify-center rounded-md border border-border transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:size-7 ${
        ativa ? "ring-2 ring-primary" : ""
      }`}
      style={{ backgroundColor: cor }}
    >
      {ativa ? <Check className={`size-3.5 ${corDoCheck}`} /> : children}
    </button>
  )
}

export function EditorAnotacao({ conteudoInicial, chaveRascunho, onSalvar }: EditorAnotacaoProps) {
  const [salvando, setSalvando] = useState(false)
  const [enviandoImagem, setEnviandoImagem] = useState(false)
  const [erroSalvar, setErroSalvar] = useState(false)
  const [arrastando, setArrastando] = useState(false)
  const [linkAberto, setLinkAberto] = useState(false)
  const [urlLink, setUrlLink] = useState("")
  const chaveStorage = `brio_rascunho_${chaveRascunho}`
  const jaCarregouConteudoInicial = useRef(false)
  const inputImagemRef = useRef<HTMLInputElement>(null)

  const salvarComDebounce = useDebounce(async (html: string) => {
    try {
      await onSalvar(html)
      apagarRascunho(chaveStorage)
      setErroSalvar(false)
    } catch {
      setErroSalvar(true)
    } finally {
      setSalvando(false)
    }
  }, 800)

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
    // A barra lê o estado do editor (negrito ativo, alinhamento, desfazer...). Sem isso,
    // mudar só a seleção não atualizava os botões.
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      gravarRascunho(chaveStorage, html)
      setSalvando(true)
      salvarComDebounce(html)
    },
    editorProps: {
      attributes: { class: CLASSES_CONTEUDO },
    },
  })

  useEffect(() => {
    if (!editor || jaCarregouConteudoInicial.current) return
    jaCarregouConteudoInicial.current = true

    const rascunho = lerRascunho(chaveStorage)
    if (rascunho && rascunho !== conteudoInicial) {
      editor.commands.setContent(rascunho)
      salvarComDebounce(rascunho)
    } else {
      editor.commands.setContent(conteudoInicial)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- o conteúdo inicial só é aplicado uma vez
  }, [editor])

  const tentarSalvarDeNovo = useCallback(() => {
    if (!editor) return
    setSalvando(true)
    salvarComDebounce(editor.getHTML())
  }, [editor, salvarComDebounce])

  const inserirImagem = useCallback(
    async (arquivo: File) => {
      if (!editor) return
      setEnviandoImagem(true)
      try {
        const url = await enviarImagem(arquivo)
        editor.chain().focus().setImage({ src: url }).run()
      } catch (erro) {
        notificar.erro(erro)
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
      setArrastando(false)
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
      const item = Array.from(evento.clipboardData.items).find((i) => i.type.startsWith("image/"))
      const arquivo = item?.getAsFile()
      if (arquivo) {
        evento.preventDefault()
        inserirImagem(arquivo)
      }
    },
    [inserirImagem],
  )

  const aplicarLink = useCallback(() => {
    if (!editor) return
    const digitado = urlLink.trim()

    if (!digitado) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      // Quem digita "brio.app" quer um link externo, não um caminho relativo ao site
      const href = /^(https?:|mailto:|tel:|#|\/)/i.test(digitado) ? digitado : `https://${digitado}`

      if (editor.state.selection.empty && !editor.isActive("link")) {
        // Sem texto selecionado: o próprio endereço vira o texto do link
        editor
          .chain()
          .focus()
          .insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] })
          .run()
      } else {
        editor.chain().focus().extendMarkRange("link").setLink({ href }).run()
      }
    }
    setLinkAberto(false)
  }, [editor, urlLink])

  const removerLink = useCallback(() => {
    if (!editor) return
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
    setLinkAberto(false)
  }, [editor])

  const aplicarBloco = useCallback(
    (valor: string) => {
      if (!editor) return
      if (valor === "paragrafo") editor.chain().focus().setParagraph().run()
      if (valor === "titulo1") editor.chain().focus().toggleHeading({ level: 1 }).run()
      if (valor === "titulo2") editor.chain().focus().toggleHeading({ level: 2 }).run()
      if (valor === "titulo3") editor.chain().focus().toggleHeading({ level: 3 }).run()
    },
    [editor],
  )

  if (!editor) {
    return null
  }

  const alinhamento = alinhamentoAtual(editor)
  const IconeAlinhamento = ALINHAMENTOS.find((a) => a.valor === alinhamento)?.icone ?? AlignLeft
  const corTextoAtual = (editor.getAttributes("textStyle").color as string | undefined)?.toLowerCase()
  const palavras = editor.storage.characterCount.words()
  const caracteres = editor.storage.characterCount.characters()

  return (
    <TooltipProvider>
      <div className="flex flex-col">
        {/* Barra de formatação */}
        <div
          role="toolbar"
          aria-label="Formatação do texto"
          className="sticky top-2 z-10 mx-auto flex w-full max-w-[760px] items-center justify-between gap-1.5 rounded-t-xl border border-border bg-background/95 p-1.5 shadow-xs backdrop-blur-md"
        >
          <div className="no-scrollbar flex flex-nowrap items-center gap-0.5 overflow-x-auto sm:flex-wrap [&>*]:shrink-0">
            <BotaoFerramenta
              rotulo="Desfazer"
              atalho={`${MOD}Z`}
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo2 className="size-4" />
            </BotaoFerramenta>
            <BotaoFerramenta
              rotulo="Refazer"
              atalho={EH_MAC ? "⇧⌘Z" : "Ctrl+Y"}
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo2 className="size-4" />
            </BotaoFerramenta>

            <DivisorToolbar />

            {/* Antes o campo mostrava o valor interno ("titulo1"); agora mostra o nome do estilo */}
            <Select value={blocoAtual(editor)} onValueChange={aplicarBloco}>
              <SelectTrigger
                aria-label="Estilo do parágrafo"
                className="h-10 w-[7.75rem] border-none bg-transparent text-xs font-medium shadow-none hover:bg-accent sm:h-8"
              >
                <SelectValue placeholder="Estilo">{ROTULO_BLOCO[blocoAtual(editor)]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paragrafo">
                  <div className="flex items-center gap-2">
                    <Pilcrow className="size-3.5 text-muted-foreground" />
                    <span>{ROTULO_BLOCO.paragrafo}</span>
                  </div>
                </SelectItem>
                <SelectItem value="titulo1">
                  <div className="flex items-center gap-2 font-bold">
                    <Heading1 className="size-3.5 text-muted-foreground" />
                    <span>{ROTULO_BLOCO.titulo1}</span>
                  </div>
                </SelectItem>
                <SelectItem value="titulo2">
                  <div className="flex items-center gap-2 font-semibold">
                    <Heading2 className="size-3.5 text-muted-foreground" />
                    <span>{ROTULO_BLOCO.titulo2}</span>
                  </div>
                </SelectItem>
                <SelectItem value="titulo3">
                  <div className="flex items-center gap-2 font-medium">
                    <Heading3 className="size-3.5 text-muted-foreground" />
                    <span>{ROTULO_BLOCO.titulo3}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <DivisorToolbar />

            {/* Estilo do texto */}
            <BotaoFerramenta
              rotulo="Negrito"
              atalho={`${MOD}B`}
              ativo={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="size-4" />
            </BotaoFerramenta>
            <BotaoFerramenta
              rotulo="Itálico"
              atalho={`${MOD}I`}
              ativo={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="size-4" />
            </BotaoFerramenta>
            <BotaoFerramenta
              rotulo="Sublinhado"
              atalho={`${MOD}U`}
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

            {/* Parágrafo: os quatro alinhamentos viram um botão só, que mostra o atual */}
            <Popover>
              <PopoverTrigger
                type="button"
                aria-label="Alinhamento do texto"
                title="Alinhamento do texto"
                className={classeBotao(false)}
              >
                <IconeAlinhamento className="size-4" />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1" align="start">
                <div className="flex items-center gap-0.5">
                  {ALINHAMENTOS.map(({ valor, rotulo, icone: Icone }) => (
                    <button
                      key={valor}
                      type="button"
                      aria-label={rotulo}
                      aria-pressed={alinhamento === valor}
                      title={rotulo}
                      className={classeBotao(alinhamento === valor)}
                      onClick={() => editor.chain().focus().setTextAlign(valor).run()}
                    >
                      <Icone className="size-4" />
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

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

            {/* Cores */}
            <Popover>
              <PopoverTrigger
                type="button"
                aria-label="Cor de destaque"
                title="Cor de destaque"
                className={classeBotao(editor.isActive("highlight"))}
              >
                <Highlighter className="size-4" />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">Cor de destaque</p>
                <div className="flex items-center gap-1.5">
                  {CORES_DESTAQUE.map((cor) => (
                    <Amostra
                      key={cor.hex}
                      nome={cor.nome}
                      cor={cor.hex}
                      ativa={editor.isActive("highlight", { color: cor.hex })}
                      corDoCheck="text-zinc-900"
                      onClick={() => editor.chain().focus().toggleHighlight({ color: cor.hex }).run()}
                    />
                  ))}
                  <button
                    type="button"
                    title="Remover destaque"
                    aria-label="Remover destaque"
                    className="flex size-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:size-7"
                    onClick={() => editor.chain().focus().unsetHighlight().run()}
                  >
                    <Ban className="size-3.5" />
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger
                type="button"
                aria-label="Cor do texto"
                title="Cor do texto"
                className={classeBotao(Boolean(corTextoAtual))}
              >
                <Palette className="size-4" />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">Cor do texto</p>
                <div className="flex items-center gap-1.5">
                  {CORES_TEXTO.map((cor) => {
                    const padrao = cor.hex === "inherit"
                    return (
                      <Amostra
                        key={cor.hex}
                        nome={cor.nome}
                        cor={padrao ? "transparent" : cor.hex}
                        ativa={padrao ? !corTextoAtual : corTextoAtual === cor.hex.toLowerCase()}
                        corDoCheck={padrao ? "text-foreground" : "text-white"}
                        onClick={() => {
                          if (padrao) {
                            editor.chain().focus().unsetColor().run()
                          } else {
                            editor.chain().focus().setColor(cor.hex).run()
                          }
                        }}
                      >
                        {padrao && <Type className="size-3.5 text-muted-foreground" />}
                      </Amostra>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>

            <DivisorToolbar />

            {/* Link: um campinho no lugar do window.prompt */}
            <Popover
              open={linkAberto}
              onOpenChange={(aberto) => {
                setLinkAberto(aberto)
                if (aberto) setUrlLink((editor.getAttributes("link").href as string | undefined) ?? "")
              }}
            >
              <PopoverTrigger
                type="button"
                aria-label="Inserir link"
                title="Inserir link"
                className={classeBotao(editor.isActive("link"))}
              >
                <LinkIcon className="size-4" />
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3" align="end">
                <form
                  className="flex flex-col gap-3"
                  onSubmit={(evento) => {
                    evento.preventDefault()
                    aplicarLink()
                  }}
                >
                  <Input
                    autoFocus
                    type="text"
                    inputMode="url"
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-label="Endereço do link"
                    placeholder="Cole ou digite o endereço"
                    value={urlLink}
                    onChange={(e) => setUrlLink(e.target.value)}
                    className="text-base md:text-sm"
                  />
                  <div className="flex items-center justify-between gap-2">
                    {editor.isActive("link") ? (
                      <Button type="button" variant="ghost" size="sm" onClick={removerLink}>
                        Remover link
                      </Button>
                    ) : (
                      <span />
                    )}
                    <Button type="submit" size="sm">
                      Aplicar
                    </Button>
                  </div>
                </form>
              </PopoverContent>
            </Popover>

            <BotaoFerramenta rotulo="Inserir imagem" onClick={() => inputImagemRef.current?.click()}>
              <ImagePlus className="size-4" />
            </BotaoFerramenta>
          </div>

          {/* Situação do salvamento */}
          <div role="status" aria-live="polite" className="flex shrink-0 items-center border-l border-border pl-2">
            {erroSalvar ? (
              <button
                type="button"
                onClick={tentarSalvarDeNovo}
                aria-label="Não foi possível salvar. Tentar de novo"
                className="flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full px-2 text-xs font-medium text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-8"
              >
                <RotateCw className="size-3.5" />
                <span className="hidden sm:inline">Tentar de novo</span>
              </button>
            ) : (
              <span className="flex items-center gap-1.5 px-1.5 text-xs text-muted-foreground">
                {enviandoImagem ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin text-primary motion-reduce:animate-none" />
                    <span className="hidden sm:inline">Enviando imagem...</span>
                  </>
                ) : salvando ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" />
                    <span className="hidden sm:inline">Salvando...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-3.5 text-emerald-500" />
                    <span className="hidden sm:inline">Salvo</span>
                  </>
                )}
              </span>
            )}
          </div>
        </div>

        <input
          ref={inputImagemRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          tabIndex={-1}
          aria-hidden
          onChange={handleSelecionarArquivo}
        />

        {/* Folha de anotação */}
        <div
          className={`relative mx-auto w-full max-w-[760px] rounded-b-xl transition-shadow ${
            arrastando ? "ring-2 ring-primary/50" : ""
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            if (e.dataTransfer.types.includes("Files")) setArrastando(true)
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setArrastando(false)
          }}
          onPaste={handlePaste}
        >
          <EditorContent editor={editor} />

          {editor.isEmpty && (
            <p
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 p-4 text-base leading-7 text-muted-foreground/70 sm:p-8 md:p-12"
            >
              Comece a escrever. Você também pode colar ou arrastar uma imagem aqui.
            </p>
          )}
        </div>

        <div className="mx-auto flex w-full max-w-[760px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-2 pt-2 text-xs text-muted-foreground">
          {erroSalvar && (
            <p role="alert" className="text-destructive">
              Não foi possível salvar agora. Seu texto continua guardado neste aparelho.
            </p>
          )}
          <p className="ml-auto tabular-nums">
            {palavras} {palavras === 1 ? "palavra" : "palavras"}, {caracteres}{" "}
            {caracteres === 1 ? "caractere" : "caracteres"}
          </p>
        </div>
      </div>
    </TooltipProvider>
  )
}