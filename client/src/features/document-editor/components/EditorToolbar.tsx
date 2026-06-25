import { Editor } from "@tiptap/react"
import { Bold, Italic, Heading2, Heading3, List, ListOrdered } from "lucide-react"

interface EditorToolbarProps {
  editor: Editor | null
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 px-3 border-b border-border bg-muted/20 shrink-0 select-none text-left">
      {/* Bold */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
          editor.isActive("bold") ? "bg-accent text-accent-foreground font-semibold" : ""
        }`}
        title="Bold (Ctrl+B)"
      >
        <Bold className="size-4" />
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
          editor.isActive("italic") ? "bg-accent text-accent-foreground font-semibold" : ""
        }`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="size-4" />
      </button>

      <div className="w-[1px] h-4 bg-border mx-1" />

      {/* Heading 2 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
          editor.isActive("heading", { level: 2 }) ? "bg-accent text-accent-foreground font-semibold" : ""
        }`}
        title="Heading 2"
      >
        <Heading2 className="size-4" />
      </button>

      {/* Heading 3 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
          editor.isActive("heading", { level: 3 }) ? "bg-accent text-accent-foreground font-semibold" : ""
        }`}
        title="Heading 3"
      >
        <Heading3 className="size-4" />
      </button>

      <div className="w-[1px] h-4 bg-border mx-1" />

      {/* Bullet List */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
          editor.isActive("bulletList") ? "bg-accent text-accent-foreground font-semibold" : ""
        }`}
        title="Bullet List"
      >
        <List className="size-4" />
      </button>

      {/* Ordered List */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
          editor.isActive("orderedList") ? "bg-accent text-accent-foreground font-semibold" : ""
        }`}
        title="Ordered List"
      >
        <ListOrdered className="size-4" />
      </button>
    </div>
  )
}
