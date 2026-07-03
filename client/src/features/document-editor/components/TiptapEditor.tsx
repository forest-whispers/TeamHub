import { useState, useEffect, useCallback, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { EditorHeader } from "./EditorHeader"
import { EditorToolbar } from "./EditorToolbar"
import type { WorkspaceDocument } from "../types"
import { useUpdateDocumentContent } from "../hooks/useUpdateDocumentContent"
import { toast } from "sonner"

interface TiptapEditorProps {
  documentData: WorkspaceDocument
  workspaceId: string
}

export function TiptapEditor({ documentData, workspaceId }: TiptapEditorProps) {
  const [savedContent, setSavedContent] = useState(documentData.content)
  const [isDirty, setIsDirty] = useState(false)

  const autoSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useEditor({
    extensions: [StarterKit],
    // content: documentData?.content ? {
    //   type: "doc",
    //   content: documentData.content,
    // } : null,
    content: documentData.content,
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[400px] p-4 text-left text-sm space-y-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1",
      },
    },
    onUpdate: ({ editor }) => {
      const currentJSON = editor.getJSON()
      setIsDirty(JSON.stringify(currentJSON) !== JSON.stringify(savedContent))
    },
  })

  // Keep lastSavedContent in sync if documentData.content changes from parent
  // useEffect(() => {
  //   console.log("documentData.content changed");
  //   setSavedContent(documentData.content)
  //   setIsDirty(false)
  // }, [documentData.content])

  // useEffect(() => {
  //   if (!editor) return;
  //   if (!documentData.content) return;

  //   editor.commands.setContent(documentData.content)
  //   setSavedContent(documentData.content);
  //   setIsDirty(false);
  // }, [documentData.id, editor]);

  // Update dirty check if lastSavedContent changes
  useEffect(() => {
    if (editor) {
      const currentJSON = editor.getJSON()
      setIsDirty(JSON.stringify(currentJSON) !== JSON.stringify(savedContent))
    }
  }, [savedContent, editor])

  const { mutate: saveContent, isPending: isSaving } = useUpdateDocumentContent(
    workspaceId,
    documentData.id
  )

  const handleSave = useCallback(() => {
    if (!editor || isSaving) return
    // if (!editor) return
    // if (isSaving || !isDirty) return
    const content = editor.getJSON()

    const hasChanges =
      JSON.stringify(content) !== JSON.stringify(savedContent)

    if (!hasChanges) return

    saveContent(content, {
      onSuccess: () => {
        setSavedContent(content)
        setIsDirty(false)
        toast.success("Document saved successfully!")
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to save document")
      },
    })
  }, [editor, saveContent, savedContent, isSaving])

  // Ctrl+S / Cmd+S handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleSave])

  useEffect(() => {
    if (!isDirty) return

    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current)
    }

    autoSaveTimeout.current = setTimeout(() => {
      handleSave()
    }, 5000)

    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current)
      }
    }
  }, [isDirty, handleSave])

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Editor Header */}
      <EditorHeader
        title={documentData.title}
        isDirty={isDirty}
        updatedAt={documentData.updatedAt}
        lastEditedBy={documentData.createdBy.name}
        onSave={handleSave}
        isSaving={isSaving}
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