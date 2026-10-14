"use client"

import { useRef, useState } from "react"
import { EditorContent, useEditor, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Heading2, Heading3, Heading4, ImageIcon, Italic, Link2, Link2Off,
  List, ListOrdered, Loader2, Minus, Pilcrow, Quote, Redo2, RemoveFormatting, Strikethrough, Underline as UnderlineIcon, Undo2,
} from "lucide-react"
import "@/styles/blog-content.css"

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  // Seçilen resmi sunucuya yükleyip adresini döndürür
  onUploadImage: (file: File) => Promise<string>
  placeholder?: string
}

function ToolButton({
  label, active = false, disabled = false, onClick, children,
}: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="sm"
      className="h-8 w-8 p-0"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function normalizeUrl(input: string): string | null {
  const value = input.trim()
  if (!value) return null
  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) return value
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(value)) return `https://${value}`
  return null
}

function Toolbar({ editor, onPickImage, uploading }: { editor: Editor; onPickImage: () => void; uploading: boolean }) {
  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined
    const input = window.prompt("Bağlantı adresi (https://... ). Boş bırakıp Tamam derseniz bağlantı kaldırılır.", previous ?? "https://")
    if (input === null) return
    if (input.trim() === "" || input.trim() === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    const href = normalizeUrl(input)
    if (!href) {
      toast({ title: "Geçersiz adres", description: "Adres https:// ile başlamalı (ör. https://petfendy.com)", variant: "destructive" })
      return
    }
    const external = !/^https?:\/\/(www\.)?petfendy\.com/i.test(href)
    editor.chain().focus().extendMarkRange("link").setLink({ href, target: external ? "_blank" : null }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1.5">
      <ToolButton label="Kalın" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="w-4 h-4" /></ToolButton>
      <ToolButton label="İtalik" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="w-4 h-4" /></ToolButton>
      <ToolButton label="Altı çizili" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="w-4 h-4" /></ToolButton>
      <ToolButton label="Üstü çizili" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="w-4 h-4" /></ToolButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolButton label="Paragraf" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow className="w-4 h-4" /></ToolButton>
      <ToolButton label="Başlık 2 (ana bölüm)" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="w-4 h-4" /></ToolButton>
      <ToolButton label="Başlık 3 (alt bölüm)" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="w-4 h-4" /></ToolButton>
      <ToolButton label="Başlık 4" active={editor.isActive("heading", { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}><Heading4 className="w-4 h-4" /></ToolButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolButton label="Madde işaretli liste" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="w-4 h-4" /></ToolButton>
      <ToolButton label="Numaralı liste" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="w-4 h-4" /></ToolButton>
      <ToolButton label="Alıntı" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="w-4 h-4" /></ToolButton>
      <ToolButton label="Ayırıcı çizgi" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="w-4 h-4" /></ToolButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolButton label="Sola hizala" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft className="w-4 h-4" /></ToolButton>
      <ToolButton label="Ortala" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter className="w-4 h-4" /></ToolButton>
      <ToolButton label="Sağa hizala" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight className="w-4 h-4" /></ToolButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolButton label="Bağlantı ekle / düzenle" active={editor.isActive("link")} onClick={setLink}><Link2 className="w-4 h-4" /></ToolButton>
      <ToolButton label="Bağlantıyı kaldır" disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}><Link2Off className="w-4 h-4" /></ToolButton>
      <ToolButton label="Resim ekle" disabled={uploading} onClick={onPickImage}>
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolButton label="Biçimi temizle" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><RemoveFormatting className="w-4 h-4" /></ToolButton>
      <ToolButton label="Geri al" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 className="w-4 h-4" /></ToolButton>
      <ToolButton label="Yinele" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 className="w-4 h-4" /></ToolButton>
    </div>
  )
}

export function RichTextEditor({ value, onChange, onUploadImage, placeholder = "Yazınızı buraya yazın..." }: RichTextEditorProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    immediatelyRender: false, // Next.js sunucu çıktısıyla uyumsuzluğu önler
    shouldRerenderOnTransaction: true, // Araç çubuğu düğmelerinin etkin durumu güncel kalır
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] }, // Sayfa başlığı (H1) zaten yazı başlığıdır
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } },
      }),
      Image.configure({ inline: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: { attributes: { class: "blog-content p-4 focus:outline-none" } },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  })

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file || !editor) return
    if (!/^image\/(jpeg|jpg|png|webp|gif)$/.test(file.type)) {
      toast({ title: "Hata", description: "Yalnızca JPG, PNG, WebP veya GIF eklenebilir", variant: "destructive" })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Hata", description: "Resim 10MB'tan büyük olamaz", variant: "destructive" })
      return
    }
    setUploading(true)
    try {
      const src = await onUploadImage(file)
      const alt = window.prompt("Resmin açıklaması (alt metin). Arama motorları ve ekran okuyucular için önemlidir:", "") ?? ""
      editor.chain().focus().setImage({ src, alt: alt.trim() }).run()
    } catch (error) {
      toast({ title: "Resim eklenemedi", description: error instanceof Error ? error.message : "Bilinmeyen hata", variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  if (!editor) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-md border text-muted-foreground">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Editör yükleniyor...
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-md border bg-background">
      <Toolbar editor={editor} onPickImage={() => fileInput.current?.click()} uploading={uploading} />
      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImage} />
      <EditorContent editor={editor} />
    </div>
  )
}
