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
import { DiscussionDecorationExtension, DiscussionDecorationKey } from "../extensions/DiscussionDecorationExtension"
import { EditorHeader } from "./EditorHeader"
import { EditorToolbar } from "./EditorToolbar"
import { BubbleMenuWrapper } from "./BubbleMenuWrapper"
import { VersionHistorySheet } from "./VersionHistorySheet"
import { DiscussionComposer, type ComposerAnchorState } from "./DiscussionComposer"
import { DiscussionThread } from "./DiscussionThread"
import { useDiscussions } from "../hooks/useDiscussions"
import * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness.js";

import type { WorkspaceDocument } from "../types"
import type { AuthUser } from "@/features/auth/types";
import { useSaveDocument } from "../hooks/useSaveDocument"
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
  const initialSavedContent = currentTab?.savedContent ?? documentData.content ?? null
  const initialIsDirty = currentTab?.isDirty ?? false

  const [savedContent, setSavedContent] = useState(initialSavedContent)
  const [isDirty, setIsDirty] = useState(initialIsDirty)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  // Discussion overlay states
  const [activeDiscussionId, setActiveDiscussionId] = useState<string | null>(null)
  const [highlightedDiscussionId, setHighlightedDiscussionId] = useState<string | null>(null)
  const [composerState, setComposerState] = useState<ComposerAnchorState | null>(null)
  const [anchorRect, setAnchorRect] = useState<{ top: number; left: number } | null>(null)

  const { data: discussions = [] } = useDiscussions(workspaceId, documentData.id)

  const activeDiscussion = discussions.find((d: any) => d.id === activeDiscussionId)

  const savedContentRef = useRef(initialSavedContent)
  const autoSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSelectDiscussion = useCallback((id: string) => {
    setComposerState(null)
    setActiveDiscussionId(id)
    setTimeout(() => {
      const el = document.querySelector(`[data-discussion-id="${id}"]`)
      if (el) {
        const rect = el.getBoundingClientRect()
        setAnchorRect({ top: rect.top, left: rect.left })
      } else {
        setAnchorRect(null)
      }
    }, 50)
  }, [])

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
        render: (user) => {
          const cursor = document.createElement("span");
          cursor.classList.add("collaboration-caret");
          cursor.style.setProperty("--caret-color", user.color);

          const label = document.createElement("span");
          label.classList.add("collaboration-caret-label");

          const content = document.createElement("span");
          content.classList.add("collaboration-caret-label-content");

          const text = document.createElement("span");
          text.classList.add("collaboration-caret-label-text");
          text.textContent = user.name;

          content.appendChild(text);
          label.appendChild(content);
          cursor.appendChild(label);
          return cursor;
        },
        selectionRender: (user) => {
          return {
            class: "collaboration-selection",
            style: `--selection-color: ${user.color}`,
          };
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
      DiscussionDecorationExtension.configure({
        discussions: [],
        activeDiscussionId: null,
        highlightedDiscussionId: null,
        onSelectDiscussion: handleSelectDiscussion,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[400px] p-4 text-left text-sm space-y-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1",
      },
    },
    onUpdate: ({ editor, transaction }) => {
      const isRemote = transaction.getMeta("y-sync$") !== undefined;
      if (isRemote) return;

      const currentJSON = editor.getJSON()
      const dirty = savedContentRef.current === null || JSON.stringify(currentJSON) !== JSON.stringify(savedContentRef.current);
      setIsDirty(dirty)
      updateTabContent(documentData.id, currentJSON, savedContentRef.current, dirty)
    },
  }, [ydoc, handleSelectDiscussion])

  // Update decorations when discussions or active selection changes
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.view.dispatch(
        editor.state.tr.setMeta(DiscussionDecorationKey, {
          discussions,
          activeDiscussionId,
          highlightedDiscussionId,
          composerState,
          onSelectDiscussion: handleSelectDiscussion,
        })
      )
    }
  }, [editor, discussions, activeDiscussionId, highlightedDiscussionId, composerState, handleSelectDiscussion])

  // Listen for selection from sidebar
  useEffect(() => {
    const handleSelectFromSidebar = (e: CustomEvent<{ discussionId: string }>) => {
      const discussionId = e.detail?.discussionId
      if (!discussionId) return

      setComposerState(null)
      setActiveDiscussionId(discussionId)
      setHighlightedDiscussionId(discussionId)

      // Fade out temporary highlight after 2.5 seconds
      setTimeout(() => {
        setHighlightedDiscussionId((prev) => (prev === discussionId ? null : prev))
      }, 2500)

      // Find element in editor and scroll smoothly into view
      setTimeout(() => {
        const el = document.querySelector(`[data-discussion-id="${discussionId}"]`)
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" })
          const rect = el.getBoundingClientRect()
          setAnchorRect({ top: rect.top, left: rect.left })
        } else {
          setAnchorRect(null)
        }
      }, 100)
    }

    window.addEventListener("select-document-discussion" as any, handleSelectFromSidebar)
    return () => {
      window.removeEventListener("select-document-discussion" as any, handleSelectFromSidebar)
    }
  }, [])

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

  const { mutate: saveContent, isPending: isSaving } = useSaveDocument()

  // Save on unmount if dirty
  useEffect(() => {
    return () => {
      if (isDirtyRef.current && editorRef.current) {
        const content = editorRef.current.getJSON()
        const docId = documentIdRef.current
        
        saveContent({
          workspaceId: workspaceIdRef.current,
          documentId: documentIdRef.current,
          content,
        },
        {
          onSuccess: () => { 
            updateTabContent(docId, content, content, false) 
          }
        })
      }
    }
  }, [updateTabContent])

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

  const handleSave = useCallback((isManual: boolean = true) => {
    if (!editor || isSaving) return
    const content = editor.getJSON()
    const snapshot = isManual ? Array.from(Y.encodeStateAsUpdateV2(ydoc)) : undefined

    if (!isDirtyRef) return

    saveContent({
      workspaceId: workspaceIdRef.current,
      documentId: documentIdRef.current,
      content,
      ...(snapshot && { snapshot, description: "Manual save" }),
      },
      {
        onSuccess: () => {
          setSavedContent(content)
          setIsDirty(false)
          updateTabContent(documentData.id, content, content, false)
          if (isManual) {
            toast.success("Document saved successfully!")
          }
        },
        onError: (err) => {
          if (isManual) {
            toast.error(err instanceof Error ? err.message : "Failed to save document")
          }
        },
      }
    )
  }, [editor, saveContent, savedContent, isSaving, workspaceId, documentData.id, updateTabContent, ydoc])

  // Ctrl+S / Cmd+S handler (Manual save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        handleSave(true)
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
      handleSave(false)
    }, 5000)

    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current)
      }
    }
  }, [isDirty, handleSave])

  const handleStartComposer = (state: ComposerAnchorState) => {
    setActiveDiscussionId(null)
    setComposerState(state)
    // Collapse text selection to end of quoted text so typing doesn't overwrite selected text
    if (editor && !editor.isDestroyed) {
      editor.commands.setTextSelection(state.to)
    }
  }

  const handleCreatedSuccess = (newDiscussionId: string) => {
    if (composerState && editor && !editor.isDestroyed) {
      editor.commands.setTextSelection(composerState.to)
    }
    setComposerState(null)
    setActiveDiscussionId(newDiscussionId)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background relative">
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
        onOpenVersionHistory={() => setIsHistoryOpen(true)}
      />

      {/* Editor Toolbar */}
      <EditorToolbar editor={editor} onStartComposer={handleStartComposer} />

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto bg-background/50 p-2 sm:p-3 relative">
        <div className="max-w-4xl mx-auto border border-border/50 rounded-lg min-h-full bg-background shadow-sm overflow-hidden">
          <EditorContent editor={editor} />
        </div>

        {/* Floating Composer Overlay */}
        {composerState && (
          <DiscussionComposer
            workspaceId={workspaceId}
            documentId={documentData.id}
            composerState={composerState}
            onClose={() => setComposerState(null)}
            onSuccess={handleCreatedSuccess}
          />
        )}

        {/* Floating Discussion Thread Overlay */}
        {activeDiscussion && !composerState && (
          <DiscussionThread
            workspaceId={workspaceId}
            documentId={documentData.id}
            discussion={activeDiscussion}
            authUser={authUser}
            anchorRect={anchorRect}
            onClose={() => setActiveDiscussionId(null)}
          />
        )}

        <BubbleMenuWrapper editor={editor} onStartComposer={handleStartComposer} />
      </div>

      {/* Version History Sheet */}
      <VersionHistorySheet
        workspaceId={workspaceId}
        documentId={documentData.id}
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        ydoc={ydoc}
      />
    </div>
  )
}