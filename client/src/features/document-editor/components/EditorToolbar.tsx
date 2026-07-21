import { useState } from "react"
import { Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Underline,
  Highlighter,
  Link,
  AlignLeft,
  AlignCenter,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Trash,
  Trash2,
  MessageSquarePlus,
} from "lucide-react"
import { LinkDialog } from "./LinkDialog"
import { InsertDropdown } from "./InsertDropdown"
import type { ComposerAnchorState } from "./DiscussionComposer"

interface EditorToolbarProps {
  editor: Editor | null
  onStartComposer?: (state: ComposerAnchorState) => void
}

export function EditorToolbar({ editor, onStartComposer }: EditorToolbarProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)

  if (!editor) return null

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

  const isTableActive = editor.isActive("table")
  const hasSelection = !editor.state.selection.empty && Boolean(editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, " ").trim())

  // Context-aware Table calculations to disable delete when not applicable
  let canDeleteRow = true
  let canDeleteColumn = true

  if (isTableActive) {
    const { selection } = editor.state
    let tableNode: any = null
    for (let i = selection.$from.depth; i > 0; i--) {
      const node = selection.$from.node(i)
      if (node.type.name === "table") {
        tableNode = node
        break
      }
    }
    if (tableNode) {
      const rowCount = tableNode.childCount
      const colCount = tableNode.firstChild ? tableNode.firstChild.childCount : 0
      canDeleteRow = rowCount > 1
      canDeleteColumn = colCount > 1
    }
  }

  const handleLinkSave = (url: string) => {
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  const handleLinkRemove = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
  }

  const currentLinkUrl = editor.getAttributes("link")?.href || ""

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1 px-3 border-b border-border bg-muted/20 shrink-0 select-none text-left h-9">
      {/* Group: Text Styles */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
            editor.isActive("bold") ? "bg-accent text-accent-foreground font-semibold" : ""
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
            editor.isActive("italic") ? "bg-accent text-accent-foreground font-semibold" : ""
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
            editor.isActive("underline") ? "bg-accent text-accent-foreground font-semibold" : ""
          }`}
          title="Underline"
        >
          <Underline className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
            editor.isActive("highlight") ? "bg-accent text-accent-foreground font-semibold" : ""
          }`}
          title="Highlight"
        >
          <Highlighter className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setLinkDialogOpen(true)}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
            editor.isActive("link") ? "bg-accent text-accent-foreground font-semibold" : ""
          }`}
          title="Link"
        >
          <Link className="size-3.5" />
        </button>

        {onStartComposer && (
          <button
            type="button"
            onClick={handleAddDiscussion}
            disabled={!hasSelection}
            className={`p-1.5 rounded transition-colors ${
              hasSelection
                ? "text-primary hover:bg-primary/10 cursor-pointer"
                : "text-muted-foreground/40 cursor-not-allowed"
            }`}
            title={hasSelection ? "Add Discussion to selected text" : "Select text to add a discussion"}
          >
            <MessageSquarePlus className="size-3.5" />
          </button>
        )}
      </div>

      <div className="w-px h-4 bg-border mx-0.5" />

      {/* Group: Alignment */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
            editor.isActive({ textAlign: "left" }) ? "bg-accent text-accent-foreground font-semibold" : ""
          }`}
          title="Align Left"
        >
          <AlignLeft className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
            editor.isActive({ textAlign: "center" }) ? "bg-accent text-accent-foreground font-semibold" : ""
          }`}
          title="Align Center"
        >
          <AlignCenter className="size-3.5" />
        </button>
      </div>

      <div className="w-px h-4 bg-border mx-0.5" />

      {/* Group: Headings */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
            editor.isActive("heading", { level: 1 }) ? "bg-accent text-accent-foreground font-semibold" : ""
          }`}
          title="Heading 1"
        >
          <Heading1 className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
            editor.isActive("heading", { level: 2 }) ? "bg-accent text-accent-foreground font-semibold" : ""
          }`}
          title="Heading 2"
        >
          <Heading2 className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
            editor.isActive("heading", { level: 3 }) ? "bg-accent text-accent-foreground font-semibold" : ""
          }`}
          title="Heading 3"
        >
          <Heading3 className="size-3.5" />
        </button>
      </div>

      <div className="w-px h-4 bg-border mx-0.5" />

      {/* Group: Lists */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
            editor.isActive("bulletList") ? "bg-accent text-accent-foreground font-semibold" : ""
          }`}
          title="Bullet List"
        >
          <List className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
            editor.isActive("orderedList") ? "bg-accent text-accent-foreground font-semibold" : ""
          }`}
          title="Numbered List"
        >
          <ListOrdered className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ${
            editor.isActive("taskList") ? "bg-accent text-accent-foreground font-semibold" : ""
          }`}
          title="Task List"
        >
          <CheckSquare className="size-3.5" />
        </button>
      </div>

      <div className="w-px h-4 bg-border mx-0.5" />

      {/* Group: Insert Embeds Dropdown */}
      <InsertDropdown editor={editor} />

      {/* Group: Context-aware Table Controls */}
      {isTableActive && (
        <>
          <div className="w-px h-4 bg-border mx-0.5" />
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Add Row Above"
            >
              <ArrowUp className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Add Row Below"
            >
              <ArrowDown className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Add Column Left"
            >
              <ArrowLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Add Column Right"
            >
              <ArrowRight className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().deleteRow().run()}
              disabled={!canDeleteRow}
              className={`p-1.5 rounded hover:bg-muted transition-colors ${
                canDeleteRow
                  ? "text-muted-foreground hover:text-destructive cursor-pointer"
                  : "text-muted-foreground/35 cursor-not-allowed"
              }`}
              title="Delete Row"
            >
              <Trash className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              disabled={!canDeleteColumn}
              className={`p-1.5 rounded hover:bg-muted transition-colors ${
                canDeleteColumn
                  ? "text-muted-foreground hover:text-destructive cursor-pointer"
                  : "text-muted-foreground/35 cursor-not-allowed"
              }`}
              title="Delete Column"
            >
              <Trash className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
              title="Delete Table"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </>
      )}

      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        initialUrl={currentLinkUrl}
        onSave={handleLinkSave}
        onRemove={handleLinkRemove}
      />
    </div>
  )
}