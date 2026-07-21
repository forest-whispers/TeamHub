import { useState } from "react"
import { BubbleMenu } from "@tiptap/react/menus"
import { Bold, Italic, Underline, Highlighter, Link, MessageSquarePlus } from "lucide-react"
import { LinkDialog } from "./LinkDialog"
import type { ComposerAnchorState } from "./DiscussionComposer"

interface BubbleMenuWrapperProps {
  editor: any
  onStartComposer?: (state: ComposerAnchorState) => void
}

export function BubbleMenuWrapper({ editor, onStartComposer }: BubbleMenuWrapperProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)

  if (!editor) return null

  const handleLinkSave = (url: string) => {
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  const handleLinkRemove = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
  }

  const handleAddDiscussion = () => {
    if (!onStartComposer || !editor) return
    const { from, to } = editor.state.selection
    const quotedText = editor.state.doc.textBetween(from, to, " ")
    if (!quotedText || !quotedText.trim()) return

    const coords = editor.view.coordsAtPos(from)
    onStartComposer({
      from,
      to,
      quotedText,
      top: coords.top,
      left: coords.left,
    })
  }

  const currentLinkUrl = editor.getAttributes("link")?.href || ""

  return (
    <>
      <BubbleMenu
        editor={editor}
        shouldShow={({ state, from, to }) => {
          if (!state || !state.selection || state.selection.empty) return false
          const text = state.doc.textBetween(from, to, " ")
          return Boolean(text && text.trim().length > 0)
        }}
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

        {onStartComposer && (
          <>
            <div className="w-px h-4 bg-border mx-1 shrink-0" />
            <button
              type="button"
              onClick={handleAddDiscussion}
              className="p-1.5 rounded hover:bg-primary/10 cursor-pointer transition-colors text-primary flex items-center gap-1 text-xs font-semibold"
              title="Add Discussion"
            >
              <MessageSquarePlus className="size-3.5 shrink-0" />
              <span>Comment</span>
            </button>
          </>
        )}
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