import { useState, useEffect, useCallback, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Highlight from "@tiptap/extension-highlight"
import Placeholder from "@tiptap/extension-placeholder"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableCell } from "@tiptap/extension-table-cell"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import { SlashCommand } from "../extensions/SlashCommand"
import { EditorHeader } from "./EditorHeader"
import { EditorToolbar } from "./EditorToolbar"
import { BubbleMenuWrapper } from "./BubbleMenuWrapper"
import * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness.js";

import type { WorkspaceDocument } from "../types"
import type { AuthUser } from "@/features/auth/types";
import { useUpdateDocumentContent } from "../hooks/useUpdateDocumentContent"
import { useUpdateDocument } from "../../workspace-documents/hooks/useWorkspaceDocuments"
import { useDocumentTabs } from "../context/DocumentTabsContext"
import { getUserColor } from "@/shared/lib/utils";
import { toast } from "sonner"

interface TiptapEditorProps {
  documentData: WorkspaceDocument
  workspaceId: string
  ydoc: Y.Doc
  provider: { awareness: Awareness; }
  authUser?: AuthUser;
}

export function TiptapEditor({ documentData, workspaceId, ydoc, provider, authUser }: TiptapEditorProps) {
  const { openTabs, updateTabContent, updateTabName } = useDocumentTabs()
  const currentTab = openTabs.find((t) => t.id === documentData.id)
  const initialSavedContent = currentTab?.savedContent ?? null
  const initialIsDirty = currentTab?.isDirty ?? false

  const [savedContent, setSavedContent] = useState(initialSavedContent)
  const [isDirty, setIsDirty] = useState(initialIsDirty)

  const savedContentRef = useRef(initialSavedContent)

  const autoSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        undoRedo: false,
        link: false,
        underline: false,
      }),
      Collaboration.configure({
        document: ydoc,
        field: "default",
      }),
      CollaborationCaret.configure({
        provider,
        user: {
          id: authUser!.id,
          name: authUser!.name,
          color: getUserColor(authUser!.id),
          avatar: authUser!.avatar,
      },
    }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: "Type '/' for commands or start writing...",
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center"],
      }),
      SlashCommand,
    ],
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[400px] p-4 text-left text-sm space-y-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1",
      },
    },
    onUpdate: ({ editor, transaction }) => {
      // Ignore remote/sync updates from Yjs
      const isRemote = transaction.getMeta("y-sync$") !== undefined;
      if (isRemote) return;

      const currentJSON = editor.getJSON()
      const dirty = savedContentRef.current === null || JSON.stringify(currentJSON) !== JSON.stringify(savedContentRef.current);
      setIsDirty(dirty)
      updateTabContent(documentData.id, currentJSON, savedContentRef.current, dirty)
    },
  }, [ydoc])

  // Maintain refs of variables to access them in the unmount cleanup correctly
  const editorRef = useRef(editor)
  const isDirtyRef = useRef(isDirty)
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
        // const wsId = workspaceIdRef.current
        
        // Background fire-and-forget save
        saveContent({
          workspaceId: workspaceIdRef.current,
          documentId: documentIdRef.current,
          content,
          },
          {
            onSuccess: () => { 
              updateTabContent(docId, content, content, false) 
            } })
      }
    }
  }, [updateTabContent])

  // const { mutate: saveContent, isPending: isSaving } = useUpdateDocumentContent()
  const renameMutation = useUpdateDocument(workspaceId)

  const handleRename = async (newTitle: string) => {
    try {
      await renameMutation.mutateAsync({
        documentId: documentData.id,
        data: { title: newTitle },
      })
      updateTabName(documentData.id, newTitle)
      toast.success("Document renamed successfully!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to rename document")
    }
  }

  const handleSave = useCallback(() => {
    if (!editor || isSaving) return
    const content = editor.getJSON()

    if (!isDirtyRef) return

    saveContent({
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
        icon={documentData.icon}
        isDirty={isDirty}
        updatedAt={documentData.updatedAt}
        lastEditedBy={documentData.createdBy.name}
        onSave={handleSave}
        isSaving={isSaving}
        onRename={handleRename}
        isRenaming={renameMutation.isPending}
      />

      {/* Editor Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto bg-background/50 p-2 sm:p-3 relative">
        <div className="max-w-4xl mx-auto border border-border/50 rounded-lg min-h-full bg-background shadow-sm overflow-hidden">
          <EditorContent editor={editor} />
        </div>
        <BubbleMenuWrapper editor={editor} />
      </div>
    </div>
  )
}