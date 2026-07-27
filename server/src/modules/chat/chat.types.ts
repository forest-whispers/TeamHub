export interface SendMessageDto {
    content: string;
    replyToId?: string;
    mentionedUserIds?: string[]
}

export interface EditMessageDto {
    content: string;
    mentionedUserIds?: string[]
}

export interface TypingDto {
    workspaceId: string;
    documentId: string;
    isTyping: boolean;
}

export interface ToggleReactionDto {
    emoji: "👍" | "❤️" | "😂" | "😮" | "😢" | "🎉";
}