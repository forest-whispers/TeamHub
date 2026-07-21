import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"
import type { DocumentDiscussion } from "../types/discussion"
import type { ComposerAnchorState } from "../components/DiscussionComposer"

export interface DiscussionDecorationOptions {
  discussions: DocumentDiscussion[]
  activeDiscussionId: string | null
  highlightedDiscussionId: string | null
  composerState?: ComposerAnchorState | null
  onSelectDiscussion?: (discussionId: string) => void
}

export const DiscussionDecorationKey = new PluginKey("discussionDecoration")

export const DiscussionDecorationExtension = Extension.create<DiscussionDecorationOptions>({
  name: "discussionDecoration",

  addOptions() {
    return {
      discussions: [],
      activeDiscussionId: null,
      highlightedDiscussionId: null,
      composerState: null,
      onSelectDiscussion: undefined,
    }
  },

  addProseMirrorPlugins() {
    const extensionThis = this

    return [
      new Plugin({
        key: DiscussionDecorationKey,
        state: {
          init(_, { doc }) {
            return buildDecorations(doc, extensionThis.options)
          },
          apply(tr, _oldDecorationSet, _oldState, newState) {
            // Check meta first
            const meta = tr.getMeta(DiscussionDecorationKey)
            if (meta) {
              return buildDecorations(newState.doc, meta)
            }
            // Always re-evaluate decorations against new document state to ensure
            // range stays strictly bound to quotedText and doesn't expand on typing
            return buildDecorations(newState.doc, extensionThis.options)
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
          handleClick(_view, _pos, event) {
            const target = event.target as HTMLElement | null
            if (!target) return false

            const discussionEl = target.closest("[data-discussion-id]") as HTMLElement | null
            if (discussionEl) {
              const discussionId = discussionEl.getAttribute("data-discussion-id")
              if (discussionId && extensionThis.options.onSelectDiscussion) {
                extensionThis.options.onSelectDiscussion(discussionId)
                return true
              }
            }
            return false
          },
        },
      }),
    ]
  },
})

function buildDecorations(doc: any, options: DiscussionDecorationOptions): DecorationSet {
  const { discussions, activeDiscussionId, highlightedDiscussionId, composerState } = options
  const decorations: Decoration[] = []

  // 1. If composer is active (creating a new discussion on selected text)
  if (composerState && composerState.quotedText) {
    const found = findTextRangeInDoc(doc, composerState.quotedText, composerState.from)
    const from = found ? found.from : composerState.from
    const to = found ? found.to : composerState.to

    if (from < to && to <= doc.content.size) {
      decorations.push(
        Decoration.inline(
          from,
          to,
          {
            class: "bg-primary/20 dark:bg-primary/30 border-b-2 border-primary ring-1 ring-primary/40 rounded-sm px-0.5 transition-all duration-200",
          },
          { inclusiveStart: false, inclusiveEnd: false }
        )
      )
    }
    return DecorationSet.create(doc, decorations)
  }

  // 2. Only highlight the single active or temporarily focused discussion
  const targetId = activeDiscussionId || highlightedDiscussionId
  if (!targetId || !discussions || discussions.length === 0) {
    return DecorationSet.empty
  }

  const activeDisc = discussions.find((d) => d.id === targetId)
  if (!activeDisc) {
    return DecorationSet.empty
  }

  const anchor = activeDisc.anchor || {}
  const quotedText = activeDisc.quotedText || anchor.quotedText

  let from = typeof anchor.from === "number" ? anchor.from : null
  let to = typeof anchor.to === "number" ? anchor.to : null

  // Always find exact range of quotedText in current document to prevent expansion on typing
  if (quotedText) {
    const foundRange = findTextRangeInDoc(doc, quotedText, from || 0)
    if (foundRange) {
      from = foundRange.from
      to = foundRange.to
    }
  }

  if (from !== null && to !== null && from < to && to <= doc.content.size) {
    const isHighlightedPulse = highlightedDiscussionId === activeDisc.id

    let className = "discussion-highlight cursor-pointer transition-all duration-300 rounded-sm px-0.5 "
    if (isHighlightedPulse) {
      className += "bg-amber-400/40 dark:bg-amber-400/30 border-b-2 border-amber-500 ring-2 ring-amber-400/50 animate-pulse"
    } else {
      className += "bg-primary/20 dark:bg-primary/30 border-b-2 border-primary ring-1 ring-primary/40"
    }

    decorations.push(
      Decoration.inline(
        from,
        to,
        {
          class: className.trim(),
          "data-discussion-id": activeDisc.id,
        },
        { inclusiveStart: false, inclusiveEnd: false }
      )
    )
  }

  return DecorationSet.create(doc, decorations)
}

function findTextRangeInDoc(doc: any, searchStr: string, hintPos: number): { from: number; to: number } | null {
  if (!searchStr) return null
  let result: { from: number; to: number } | null = null

  // Try searching starting near hintPos if valid
  doc.descendants((node: any, pos: number) => {
    if (result) return false
    if (node.isText && node.text) {
      const idx = node.text.indexOf(searchStr)
      if (idx !== -1) {
        result = {
          from: pos + idx,
          to: pos + idx + searchStr.length,
        }
        return false
      }
    }
  })

  return result
}