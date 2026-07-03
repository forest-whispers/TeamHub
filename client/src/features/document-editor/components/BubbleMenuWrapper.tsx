import { useState } from "react"
import { BubbleMenu } from "@tiptap/react/menus"
import { Bold, Italic, Underline, Highlighter, Link } from "lucide-react"
import { LinkDialog } from "./LinkDialog"

interface BubbleMenuWrapperProps {
  editor: any
}

export function BubbleMenuWrapper({ editor }: BubbleMenuWrapperProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)

  if (!editor) return null

  const handleLinkSave = (url: string) => {
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  const handleLinkRemove = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
  }

  const currentLinkUrl = editor.getAttributes("link")?.href || ""

  return (
    <>
      <BubbleMenu
        editor={editor}
        className="flex items-center gap-0.5 bg-popover text-popover-foreground border border-border shadow-md rounded-md p-1 select-none"
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-muted cursor-pointer transition-colors ${
            editor.isActive("bold") ? "text-primary bg-primary/10" : "text-muted-foreground"
          }`}
          title="Bold"
        >
          <Bold className="size-3.5 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-muted cursor-pointer transition-colors ${
            editor.isActive("italic") ? "text-primary bg-primary/10" : "text-muted-foreground"
          }`}
          title="Italic"
        >
          <Italic className="size-3.5 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded hover:bg-muted cursor-pointer transition-colors ${
            editor.isActive("underline") ? "text-primary bg-primary/10" : "text-muted-foreground"
          }`}
          title="Underline"
        >
          <Underline className="size-3.5 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-1.5 rounded hover:bg-muted cursor-pointer transition-colors ${
            editor.isActive("highlight") ? "text-primary bg-primary/10" : "text-muted-foreground"
          }`}
          title="Highlight"
        >
          <Highlighter className="size-3.5 shrink-0" />
        </button>

        <div className="w-px h-4 bg-border mx-1 shrink-0" />

        <button
          type="button"
          onClick={() => setLinkDialogOpen(true)}
          className={`p-1.5 rounded hover:bg-muted cursor-pointer transition-colors ${
            editor.isActive("link") ? "text-primary bg-primary/10" : "text-muted-foreground"
          }`}
          title="Link"
        >
          <Link className="size-3.5 shrink-0" />
        </button>
      </BubbleMenu>

      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        initialUrl={currentLinkUrl}
        onSave={handleLinkSave}
        onRemove={handleLinkRemove}
      />
    </>
  )
}