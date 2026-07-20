import { useMemo, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import Collaboration from "@tiptap/extension-collaboration"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Highlight from "@tiptap/extension-highlight"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableCell } from "@tiptap/extension-table-cell"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import * as Y from "yjs"

interface SnapshotReadOnlyEditorProps {
  state: number[]
}

export function SnapshotReadOnlyEditor({ state }: SnapshotReadOnlyEditorProps) {
  // Reconstruct a temporary isolated Y.Doc from snapshot state
  const ydoc = useMemo(() => {
    const doc = new Y.Doc()
    if (state && state.length > 0) {
      try {
        Y.applyUpdateV2(doc, new Uint8Array(state))
      } catch (err) {
        console.error("Failed to apply snapshot update to Y.Doc:", err)
      }
    }
    return doc
  }, [state])

  // Destroy the temporary Y.Doc when it changes or component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      ydoc.destroy()
    }
  }, [ydoc])

  const editor = useEditor(
    {
      editable: false,
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
        Underline,
        Highlight.configure({ multicolor: true }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        Table.configure({
          resizable: false,
        }),
        TableRow,
        TableHeader,
        TableCell,
        Link.configure({
          openOnClick: true,
          autolink: true,
        }),
        TextAlign.configure({
          types: ["heading", "paragraph"],
          alignments: ["left", "center"],
        }),
      ],
      editorProps: {
        attributes: {
          class:
            "focus:outline-none min-h-[300px] p-4 text-left text-sm space-y-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1 text-foreground bg-background",
        },
      },
    },
    [ydoc]
  )

  return (
    <div className="w-full h-full overflow-y-auto border border-border/60 rounded-lg bg-background shadow-xs">
      <EditorContent editor={editor} />
    </div>
  )
}