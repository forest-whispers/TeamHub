import { useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { EditorHeader } from "./EditorHeader"
import { EditorToolbar } from "./EditorToolbar"
import type { WorkspaceDocumentDetail } from "../types"

interface TiptapEditorProps {
  documentData: WorkspaceDocumentDetail
}

export function TiptapEditor({ documentData }: TiptapEditorProps) {
  const [isDirty, setIsDirty] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit],
    content: documentData.content,
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[400px] p-4 text-left text-sm space-y-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1",
      },
    },
    onUpdate: ({ editor }) => {
      const currentJSON = editor.getJSON()
      setIsDirty(JSON.stringify(currentJSON) !== JSON.stringify(documentData.content))
    },
  })

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Editor Header */}
      <EditorHeader
        name={documentData.name}
        isDirty={isDirty}
        lastEdited={documentData.lastEdited}
        lastEditedBy={documentData.lastEditedBy}
      />

      {/* Editor Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto bg-background/50 p-2 sm:p-3">
        <div className="max-w-4xl mx-auto border border-border/50 rounded-lg min-h-full bg-background shadow-sm overflow-hidden">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
