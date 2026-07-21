import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import Collaboration, { isChangeOrigin } from "@tiptap/extension-collaboration";
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

const SafeCollaborationSelectionExtension = Extension.create({
  name: "safeCollaborationSelection",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("safeCollaborationSelection"),
        appendTransaction(transactions, oldState, newState) {
          const isRemoteSync = transactions.some((tr) => isChangeOrigin(tr) || Boolean(tr.getMeta("y-sync")) || Boolean(tr.getMeta("y-sync$")))
          if (!isRemoteSync) return null

          const oldSelection = oldState.selection
          const newDoc = newState.doc

          if (!oldSelection) return null

          const combinedMapping = transactions[0].mapping
          for (let i = 1; i < transactions.length; i++) {
            combinedMapping.appendMapping(transactions[i].mapping)
          }

          const mappedSelection = oldSelection.map(newDoc, combinedMapping)
          const currentSelection = newState.selection

          if (mappedSelection && !currentSelection.eq(mappedSelection)) {
            const tr = newState.tr
            tr.setSelection(mappedSelection)
            return tr
          }

          return null
        },
      }),
    ]
  },
})

interface TiptapEditorProps {
  documentData: WorkspaceDocument
  workspaceId: string
  ydoc: Y.Doc
  provider: { awareness: Awareness; }
  authUser?: AuthUser;
}

const EDITOR_PROPS = {
  attributes: {
    class:
      "focus:outline-none min-h-[400px] p-4 text-left text-sm space-y-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1",
  },
  handleDOMEvents: {
    mousedown: (view: any, event: MouseEvent) => {
      const target = event.target as HTMLElement
      // If click was on the editor container background (whitespace below/around text)
      if (target === view.dom || target.classList.contains("ProseMirror")) {
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
        // If click did not land directly on a specific text node
        if (!pos || !pos.pos) {
          const { selection } = view.state
          if (selection) {
            event.preventDefault()
            view.focus()
            const tr = view.state.tr.setSelection(selection)
            view.dispatch(tr)
            return true
          }
        }
      }
      return false
    },
  },
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

  const caretRender = useCallback((user: any) => {
    const cursor = document.createElement("span")
    cursor.classList.add("collaboration-caret")
    cursor.style.setProperty("--caret-color", user.color)

    // Location Pin SVG Icon
    const pointer = document.createElement("span")
    pointer.classList.add("collaboration-caret-pointer")
    pointer.innerHTML = `<svg width="14" height="18" viewBox="0 0 24 24" fill="${user.color}" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="#ffffff"/></svg>`

    // Rich Metadata Hover Card
    const card = document.createElement("div")
    card.classList.add("collaboration-caret-card")

    const getInitials = (name: string) =>
      (name || "U")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)

    const avatarHTML = user.avatar
      ? `<img src="${user.avatar}" class="collaboration-caret-avatar-img" />`
      : `<span class="collaboration-caret-avatar-initials">${getInitials(user.name)}</span>`

    card.innerHTML = `
      <div class="collaboration-caret-card-header">
        <div class="collaboration-caret-avatar-wrap" style="--caret-color: ${user.color}">
          ${avatarHTML}
        </div>
        <div class="collaboration-caret-card-info">
          <div class="collaboration-caret-card-name">${user.name}</div>
          <div class="collaboration-caret-card-role">${user.role || "Team Member"}</div>
        </div>
      </div>
      <div class="collaboration-caret-card-footer">
        <span class="collaboration-caret-pulse"></span>
        <span>Active in Document</span>
      </div>
    `

    cursor.appendChild(pointer)
    cursor.appendChild(card)
    return cursor
  }, [])

  const caretSelectionRender = useCallback((user: any) => {
    return {
      class: "collaboration-selection",
      style: `--selection-color: ${user.color}`,
    }
  }, [])

  const authUserId = authUser?.id
  const authUserName = authUser?.name
  const authUserAvatar = authUser?.avatar
  const authUserRole = (authUser as any)?.role

  const caretUser = useMemo(
    () => ({
      id: authUserId || "",
      name: authUserName || "",
      color: authUserId ? getUserColor(authUserId) : "#3b82f6",
      avatar: authUserAvatar,
      role: authUserRole || "Team Member",
    }),
    [authUserId, authUserName, authUserAvatar, authUserRole]
  )

  const extensions = useMemo(
    () => [
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
        user: caretUser,
        render: caretRender,
        selectionRender: caretSelectionRender,
      }),
      SafeCollaborationSelectionExtension,
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
      DiscussionDecorationExtension,
    ],
    [ydoc, provider, caretUser, caretRender, caretSelectionRender]
  )

  const updateTabContentRef = useRef(updateTabContent)
  useEffect(() => {
    updateTabContentRef.current = updateTabContent
  }, [updateTabContent])

  const handleUpdate = useCallback(
    ({ editor, transaction }: { editor: any; transaction: any }) => {
      if (!transaction || !transaction.docChanged) return
      const isRemote = isChangeOrigin(transaction)
      if (isRemote) return

      const currentJSON = editor.getJSON()
      const dirty = savedContentRef.current === null || JSON.stringify(currentJSON) !== JSON.stringify(savedContentRef.current)

      setIsDirty(dirty)
      updateTabContentRef.current(documentData.id, currentJSON, savedContentRef.current, dirty)
    },
    [documentData.id]
  )

  const editor = useEditor(
    {
      extensions,
      editorProps: EDITOR_PROPS,
      onUpdate: handleUpdate,
    },
    [extensions]
  )

  const prevDiscStateRef = useRef({
    discussions,
    activeDiscussionId,
    highlightedDiscussionId,
    composerState,
  })

  // Update discussion decoration options safely without dispatching view transactions on unrelated re-renders
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const ext = editor.extensionManager.extensions.find((e) => e.name === "discussionDecoration")
      if (ext) {
        ext.options.discussions = discussions
        ext.options.activeDiscussionId = activeDiscussionId
        ext.options.highlightedDiscussionId = highlightedDiscussionId
        ext.options.composerState = composerState
        ext.options.onSelectDiscussion = handleSelectDiscussion
      }

      const prev = prevDiscStateRef.current
      const hasChanged =
        prev.discussions !== discussions ||
        prev.activeDiscussionId !== activeDiscussionId ||
        prev.highlightedDiscussionId !== highlightedDiscussionId ||
        prev.composerState !== composerState

      if (hasChanged) {
        prevDiscStateRef.current = {
          discussions,
          activeDiscussionId,
          highlightedDiscussionId,
          composerState,
        }
        editor.view.dispatch(editor.state.tr.setMeta(DiscussionDecorationKey, true))
      }
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

  const lastSelectionRef = useRef<any>(null)

  // Continuously track mapped cursor selection
  useEffect(() => {
    if (!editor || editor.isDestroyed) return

    const handleTransaction = () => {
      if (editor.state?.selection) {
        lastSelectionRef.current = editor.state.selection
      }
    }

    editor.on("transaction", handleTransaction)
    return () => {
      editor.off("transaction", handleTransaction)
    }
  }, [editor])

  // Restore cursor position when switching back to browser window (window focus)
  useEffect(() => {
    const handleWindowFocus = () => {
      if (editor && !editor.isDestroyed) {
        const sel = lastSelectionRef.current || editor.state.selection
        if (sel && sel.from <= editor.state.doc.content.size) {
          editor.commands.focus(sel.from)
        }
      }
    }

    window.addEventListener("focus", handleWindowFocus)
    return () => {
      window.removeEventListener("focus", handleWindowFocus)
    }
  }, [editor])

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