import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getDiscussions, createDiscussion, replyDiscussion, resolveDiscussion, deleteDiscussion, deleteReply } from "../services/discussion.service"
import type { CreateDiscussionPayload, ReplyDiscussionPayload, ResolveDiscussionPayload, DocumentDiscussion } from "../types/discussion";

export function useDiscussions(
    workspaceId: string,
    documentId: string,
    enabled = true
) {
    return useQuery({
        queryKey: ["document-discussions", workspaceId, documentId],
        queryFn: () =>
        getDiscussions(workspaceId, documentId),
        enabled: Boolean(workspaceId && documentId && enabled),
    });
}

export function useCreateDiscussion(
    workspaceId: string,
    documentId: string
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateDiscussionPayload) =>
            createDiscussion(workspaceId, documentId, payload),

        onSuccess: (discussion) => {
            queryClient.setQueryData(
                ["document-discussions", workspaceId, documentId],
                (old: DocumentDiscussion[] = []) => [...old, discussion]
            );
        },
    });
}

export function useReplyDiscussion(
    workspaceId: string,
    documentId: string
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ discussionId, payload }: { discussionId: string; payload: ReplyDiscussionPayload }) =>
            replyDiscussion(workspaceId, documentId, discussionId, payload),

        onSuccess: (reply, variables) => {
            queryClient.setQueryData(
                ["document-discussions", workspaceId, documentId],
                (old: DocumentDiscussion[] = []) =>
                    old.map((discussion) =>
                        discussion.id === variables.discussionId
                            ? {
                                ...discussion,
                                replies: [...discussion.replies, reply],
                            }
                            : discussion
                    )
            );
        },
    });
}

export function useResolveDiscussion(
    workspaceId: string,
    documentId: string
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ discussionId, payload }: { discussionId: string; payload: ResolveDiscussionPayload }) =>
            resolveDiscussion(workspaceId, documentId, discussionId, payload),

        onSuccess: (updated) => {
            queryClient.setQueryData(
                ["document-discussions", workspaceId, documentId],
                (old: DocumentDiscussion[] = []) =>
                    old.map((discussion) =>
                        discussion.id === updated.id ? updated : discussion
                    )
            );
        },
    });
}

export function useDeleteDiscussion(
    workspaceId: string,
    documentId: string
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (discussionId: string) =>
            deleteDiscussion(workspaceId, documentId, discussionId),

        onSuccess: (_, discussionId) => {
            queryClient.setQueryData(
                ["document-discussions", workspaceId, documentId],
                (old: DocumentDiscussion[] = []) =>
                    old.filter((discussion) => discussion.id !== discussionId)
            );
        },
    });
}

export function useDeleteReply(
    workspaceId: string,
    documentId: string
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (replyId: string) =>
            deleteReply(workspaceId, documentId, replyId),

        onSuccess: (_, replyId) => {
            queryClient.setQueryData(
                ["document-discussions", workspaceId, documentId],
                (old: DocumentDiscussion[] = []) =>
                    old.map((discussion) => ({
                        ...discussion,
                        replies: (discussion.replies || []).filter(
                            (reply) => reply.id !== replyId
                        ),
                    }))
            );
        },
    });
}