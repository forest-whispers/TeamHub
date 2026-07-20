import { useEffect, useRef } from "react"
import type { Message } from "../types"
import { MessageItem } from "./MessageItem"

interface MessageListProps {
  messages: Message[]
  currentUserName?: string
}

export function MessageList({ messages, currentUserName }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Scroll to the bottom whenever messages length changes
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} currentUserName={currentUserName} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}