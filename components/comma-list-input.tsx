"use client"

import { useEffect, useState, type ComponentProps } from "react"
import { Input } from "@/components/ui/input"

const parseList = (text: string): string[] =>
  text.split(",").map((item) => item.trim()).filter(Boolean)

type CommaListInputProps = Omit<ComponentProps<typeof Input>, "value" | "onChange"> & {
  value: string[] | undefined
  onChange: (items: string[]) => void
}

// Virgülle ayrılmış liste girişi. Yazılan ham metin (virgül ve boşluklar dahil) kutuda korunur,
// ebeveyne ise her değişimde temizlenmiş liste verilir. Böylece "Klima," yazarken virgül silinmez.
export function CommaListInput({ value, onChange, ...props }: CommaListInputProps) {
  const items = value ?? []
  const [text, setText] = useState(items.join(", "))

  // Liste dışarıdan değiştiyse (ör. başka oda seçildi) metni yeniden eşitle.
  useEffect(() => {
    if (JSON.stringify(parseList(text)) !== JSON.stringify(items)) {
      setText(items.join(", "))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items)])

  return (
    <Input
      {...props}
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        onChange(parseList(e.target.value))
      }}
    />
  )
}
