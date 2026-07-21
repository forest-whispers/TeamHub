import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@/shared/lib/socket";
import type { DocumentDiscussion, DiscussionReply } from "../types/discussion";

interface UseDiscussionsRealtimeProps {
    workspaceId: string;
    documentId: string;
}

export function useDiscussionsRealtime({ workspaceId, documentId }: UseDiscussionsRealtimeProps) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!workspaceId || !documentId) return;

        function handleDiscussionCreated(discussion: DocumentDiscussion) {
            queryClient.setQueryData<DocumentDiscussion[]>(
                ["document-discussions", workspaceId, documentId],
                (old = []) => {
                    // Idempotency: prevent duplicates
                    if (old.some((d) => d.id === discussion.id)) {
                        return old;
                    }
                    // Appending at the end preserves the ascending order by createdAt
                    return [...old, discussion];
                }
            );
        }

        function handleDiscussionUpdated(updatedDiscussion: DocumentDiscussion) {
            queryClient.setQueryData<DocumentDiscussion[]>(
                ["document-discussions", workspaceId, documentId],
                (old = []) =>
                    old.map((d) => (d.id === updatedDiscussion.id ? updatedDiscussion : d))
            );
        }

        function handleDiscussionDeleted(payload: { discussionId: string }) {
            queryClient.setQueryData<DocumentDiscussion[]>(
                ["document-discussions", workspaceId, documentId],
                (old = []) => old.filter((d) => d.id !== payload.discussionId)
            );
        }

        function handleReplyCreated(payload: { discussionId: string; reply: DiscussionReply }) {
            queryClient.setQueryData<DocumentDiscussion[]>(
                ["document-discussions", workspaceId, documentId],
                (old = []) =>
                    old.map((d) => {
                        if (d.id !== payload.discussionId) return d;

                        const replies = d.replies || [];
                        // Idempotency: prevent duplicates
                        if (replies.some((r) => r.id === payload.reply.id)) {
                            return d;
                        }

                        // Appending at the end preserves the ascending order by createdAt
                        return {
                            ...d,
                            replies: [...replies, payload.reply],
                        };
                    })
            );
        }

        function handleReplyDeleted(payload: { discussionId: string; replyId: string }) {
            queryClient.setQueryData<DocumentDiscussion[]>(
                ["document-discussions", workspaceId, documentId],
                (old = []) =>
                    old.map((d) => {
                        if (d.id !== payload.discussionId) return d;
                        return {
                            ...d,
                            replies: (d.replies || []).filter((r) => r.id !== payload.replyId),
                        };
                    })
            );
        }

        // Register Socket.IO listeners
        socket.on("document:discussion:created", handleDiscussionCreated);
        socket.on("document:discussion:updated", handleDiscussionUpdated);
        socket.on("document:discussion:deleted", handleDiscussionDeleted);
        socket.on("document:reply:created", handleReplyCreated);
        socket.on("document:reply:deleted", handleReplyDeleted);

        // Cleanup on unmount or document switch to prevent duplicate listeners
        return () => {
            socket.off("document:discussion:created", handleDiscussionCreated);
            socket.off("document:discussion:updated", handleDiscussionUpdated);
            socket.off("document:discussion:deleted", handleDiscussionDeleted);
            socket.off("document:reply:created", handleReplyCreated);
            socket.off("document:reply:deleted", handleReplyDeleted);
        };
    }, [workspaceId, documentId, queryClient]);
}