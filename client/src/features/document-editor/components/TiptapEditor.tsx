import { useState, useEffect, useCallback, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { EditorHeader } from "./EditorHeader"
import { EditorToolbar } from "./EditorToolbar"
import type { WorkspaceDocument } from "../types"
import { useUpdateDocumentContent } from "../hooks/useUpdateDocumentContent"
import { useDocumentTabs } from "../context/DocumentTabsContext"
import { toast } from "sonner"

interface TiptapEditorProps {
  documentData: WorkspaceDocument
  workspaceId: string
}

export function TiptapEditor({ documentData, workspaceId }: TiptapEditorProps) {
  const { openTabs, updateTabContent } = useDocumentTabs()
  const currentTab = openTabs.find((t) => t.id === documentData.id)
  const initialContent = currentTab?.content ?? documentData.content
  const initialSavedContent = currentTab?.savedContent ?? documentData.content
  const initialIsDirty = currentTab?.isDirty ?? false

  const [savedContent, setSavedContent] = useState(initialSavedContent)
  const [isDirty, setIsDirty] = useState(initialIsDirty)

  const autoSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[400px] p-4 text-left text-sm space-y-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1",
      },
    },
    onUpdate: ({ editor }) => {
      const currentJSON = editor.getJSON()
      const dirty = JSON.stringify(currentJSON) !== JSON.stringify(savedContentRef.current)
      setIsDirty(dirty)
      updateTabContent(documentData.id, currentJSON, savedContent, dirty)
    },
  })

  // Maintain refs of variables to access them in the unmount cleanup correctly
  const editorRef = useRef(editor)
  const isDirtyRef = useRef(isDirty)
  const savedContentRef = useRef(initialSavedContent)
  const documentIdRef = useRef(documentData.id)
  const workspaceIdRef = useRef(workspaceId)

  useEffect(() => {
    editorRef.current = editor
  }, [editor])

  useEffect(() => {
    isDirtyRef.current = isDirty
  }, [isDirty])

  useEffect(() => {
    savedContentRef.current = savedContent
  }, [savedContent])

  useEffect(() => {
    documentIdRef.current = documentData.id
  }, [documentData.id])

  useEffect(() => {
    workspaceIdRef.current = workspaceId
  }, [workspaceId])

  const { mutate: saveContent, isPending: isSaving } = useUpdateDocumentContent()

  // Save on unmount if dirty
  useEffect(() => {
    return () => {
      if (isDirtyRef.current && editorRef.current) {
        const content = editorRef.current.getJSON()
        const docId = documentIdRef.current
        
        // Background fire-and-forget save
        saveContent(
          {
            workspaceId: workspaceIdRef.current,
            documentId: documentIdRef.current,
            content,
          },
          {
            onSuccess: () => {
              updateTabContent(docId, content, content, false)
            }})
      }
    }
  }, [updateTabContent])

  const handleSave = useCallback(() => {
    if (!editor || isSaving) return
    const content = editor.getJSON()

    if (!isDirty) return

    saveContent(
      {
        workspaceId: workspaceIdRef.current,
        documentId: documentIdRef.current,
        content,
      },
      {
        onSuccess: () => {
          setSavedContent(content)
          setIsDirty(false)
          updateTabContent(documentData.id, content, content, false)
          toast.success("Document saved successfully!")
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to save document")
        },
      }
    )
  }, [editor, saveContent, savedContent, isSaving, workspaceId, documentData.id, updateTabContent])

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

  // Autosave timeout effect
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