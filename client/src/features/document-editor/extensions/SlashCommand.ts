import { Extension } from "@tiptap/core"
import Suggestion from "@tiptap/suggestion"
import { ReactRenderer } from "@tiptap/react"
import tippy from "tippy.js"
import { CommandList } from "../components/CommandList"

export interface CommandItem {
  title: string
  label: string
  searchTerms: string[]
  icon: string
  command: (props: { editor: any; range: any }) => void
}

export const slashCommandsList: CommandItem[] = [
  {
    title: "Heading 1",
    label: "Big section heading",
    searchTerms: ["h1", "heading", "large"],
    icon: "Heading1",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run()
    },
  },
  {
    title: "Heading 2",
    label: "Medium section heading",
    searchTerms: ["h2", "heading", "medium"],
    icon: "Heading2",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run()
    },
  },
  {
    title: "Heading 3",
    label: "Small section heading",
    searchTerms: ["h3", "heading", "small"],
    icon: "Heading3",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run()
    },
  },
  {
    title: "Bullet List",
    label: "Create a simple bulleted list",
    searchTerms: ["bullet", "list", "ul"],
    icon: "List",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    title: "Numbered List",
    label: "Create a list with numbering",
    searchTerms: ["numbered", "list", "ol"],
    icon: "ListOrdered",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  {
    title: "Task List",
    label: "Track tasks with checkboxes",
    searchTerms: ["task", "todo", "checkbox"],
    icon: "CheckSquare",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    },
  },
  {
    title: "Quote",
    label: "Capture a quote",
    searchTerms: ["quote", "blockquote"],
    icon: "Quote",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
    },
  },
  {
    title: "Code Block",
    label: "Write code snippet",
    searchTerms: ["code", "block", "snippet"],
    icon: "Code",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    },
  },
  {
    title: "Horizontal Rule",
    label: "Insert a dividing line",
    searchTerms: ["line", "divider", "hr"],
    icon: "Minus",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
  },
  {
    title: "Table",
    label: "Insert a 3x3 table grid",
    searchTerms: ["table", "grid"],
    icon: "Grid",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    },
  },
]

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range })
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }) => {
          return slashCommandsList.filter((item) => {
            const searchStr = query.toLowerCase()
            return (
              item.title.toLowerCase().includes(searchStr) ||
              item.label.toLowerCase().includes(searchStr) ||
              item.searchTerms.some((term) => term.includes(searchStr))
            )
          })
        },
        render: () => {
          let component: ReactRenderer | null = null
          let popup: any = null

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
              })

              if (!props.clientRect) {
                return
              }

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              })
            },

            onUpdate(props: any) {
              component?.updateProps(props)

              if (!props.clientRect) {
                return
              }

              popup?.[0]?.setProps({
                getReferenceClientRect: props.clientRect,
              })
            },

            onKeyDown(props: any) {
              if (props.event.key === "Escape") {
                popup?.[0]?.hide()
                return true
              }

              return (component?.ref as any)?.onKeyDown(props) ?? false
            },

            onExit() {
              popup?.[0]?.destroy()
              component?.destroy()
            },
          }
        },
      }),
    ]
  },
})