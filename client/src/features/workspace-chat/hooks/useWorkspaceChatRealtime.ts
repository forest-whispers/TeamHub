import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { socket } from "@/shared/lib/socket";
import type { Message } from "../types";

interface TypingUser {
    id: string;
    name: string;
}

interface Props {
    workspaceId: string;
    documentId: string;
}

export function useWorkspaceChatRealtime({
    workspaceId,
    documentId,
}: Props) {
    const queryClient = useQueryClient();

    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

    const typingTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(
        new Map()
    );

    const queryKey = [
        "workspace-chat-messages",
        workspaceId,
        documentId,
    ];

    const refreshTypingTimeout = useCallback((userId: string) => {
        const existing = typingTimeouts.current.get(userId);

        if (existing) clearTimeout(existing);

        const timeout = setTimeout(() => {
            setTypingUsers((users) =>
                users.filter((u) => u.id !== userId)
            );

            typingTimeouts.current.delete(userId);
        }, 3000);

        typingTimeouts.current.set(userId, timeout);
    }, []);

    useEffect(() => {
        if (!workspaceId || !documentId) return;

        queryClient.invalidateQueries({
            queryKey,
        });

        socket.emit(
            "chat:join",
            {
                workspaceId,
                documentId,
            },
            () => { }
        );

        const handleNewMessage = (message: Message) => {
            queryClient.setQueryData<Message[]>(queryKey, (old = []) => {
                if (old.some((m) => m.id === message.id)) return old;
                return [...old, message];
            });
        };

        const handleUpdatedMessage = (message: Message) => {
            queryClient.setQueryData<Message[]>(queryKey, (old = []) =>
                old.map((m) => (m.id === message.id ? message : m))
            );
        };

        const handleDeletedMessage = ({
            messageId,
        }: {
            messageId: string;
        }) => {
            queryClient.setQueryData<Message[]>(queryKey, (old = []) =>
                old.filter((m) => m.id !== messageId)
            );
        };

        const handlePinned = ({
            messageId,
            pinnedBy,
            pinnedAt,
        }: any) => {
            queryClient.setQueryData<Message[]>(queryKey, (old = []) =>
                old.map((m) =>
                    m.id === messageId
                        ? {
                            ...m,
                            isPinned: true,
                            pinnedBy,
                            pinnedAt,
                        }
                        : m
                )
            );
        };

        const handleUnpinned = ({
            messageId,
        }: {
            messageId: string;
        }) => {
            queryClient.setQueryData<Message[]>(queryKey, (old = []) =>
                old.map((m) =>
                    m.id === messageId
                        ? {
                            ...m,
                            isPinned: false,
                            pinnedBy: null,
                            pinnedAt: null,
                        }
                        : m
                )
            );
        };

        const handleReaction = ({
            messageId,
            reactions,
        }: any) => {
            queryClient.setQueryData<Message[]>(queryKey, (old = []) =>
                old.map((m) =>
                    m.id === messageId
                        ? {
                            ...m,
                            reactions,
                        }
                        : m
                )
            );
        };

        const handleTyping = ({
            user,
            isTyping,
        }: {
            user: TypingUser;
            isTyping: boolean;
        }) => {
            if (!isTyping) {
                setTypingUsers((users) =>
                    users.filter((u) => u.id !== user.id)
                );

                const timeout = typingTimeouts.current.get(user.id);

                if (timeout) clearTimeout(timeout);

                typingTimeouts.current.delete(user.id);

                return;
            }

            setTypingUsers((users) => {
                const exists = users.some((u) => u.id === user.id);

                if (exists) return users;

                return [...users, user];
            });

            refreshTypingTimeout(user.id);
        };

        socket.on("chat:message:new", handleNewMessage);
        socket.on("chat:message:updated", handleUpdatedMessage);
        socket.on("chat:message:deleted", handleDeletedMessage);
        socket.on("chat:message:pinned", handlePinned);
        socket.on("chat:message:unpinned", handleUnpinned);
        socket.on("chat:message:reaction", handleReaction);
        socket.on("chat:typing", handleTyping);

        return () => {
            socket.emit(
                "chat:leave",
                {
                    workspaceId,
                    documentId,
                },
                () => { }
            );

            socket.off("chat:message:new", handleNewMessage);
            socket.off("chat:message:updated", handleUpdatedMessage);
            socket.off("chat:message:deleted", handleDeletedMessage);
            socket.off("chat:message:pinned", handlePinned);
            socket.off("chat:message:unpinned", handleUnpinned);
            socket.off("chat:message:reaction", handleReaction);
            socket.off("chat:typing", handleTyping);

            typingTimeouts.current.forEach(clearTimeout);
            typingTimeouts.current.clear();
        };
    }, [workspaceId, documentId, queryClient, refreshTypingTimeout]);

    const setTyping = useCallback(
        (isTyping: boolean) => {
            socket.emit(
                "chat:typing",
                {
                    workspaceId,
                    documentId,
                    isTyping,
                },
                () => { }
            );
        },
        [workspaceId, documentId]
    );

    return {
        typingUsers,
        setTyping,
    };
}