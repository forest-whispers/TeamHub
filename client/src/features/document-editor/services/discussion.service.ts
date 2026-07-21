import api from "@/shared/lib/api"
import type { CreateDiscussionPayload, ReplyDiscussionPayload, ResolveDiscussionPayload, } from "../types/discussion";

export async function getDiscussions(
    workspaceId: string,
    documentId: string
) {
    const { data } = await api.get(`/workspaces/${workspaceId}/documents/${documentId}/discussions`);

    return data.data;
}

export async function createDiscussion(
    workspaceId: string,
    documentId: string,
    payload: CreateDiscussionPayload
) {
    const { data } = await api.post(`/workspaces/${workspaceId}/documents/${documentId}/discussions`, payload);

    return data.data;
}

export async function replyDiscussion(
    workspaceId: string,
    documentId: string,
    discussionId: string,
    payload: ReplyDiscussionPayload
) {
    const { data } = await api.post(`/workspaces/${workspaceId}/documents/${documentId}/discussions/${discussionId}/replies`, payload);

    return data.data;
}

export async function resolveDiscussion(
    workspaceId: string,
    documentId: string,
    discussionId: string,
    payload: ResolveDiscussionPayload
) {
    const { data } = await api.patch(`/workspaces/${workspaceId}/documents/${documentId}/discussions/${discussionId}/resolve`, payload);

    return data.data;
}

export async function deleteDiscussion(
    workspaceId: string,
    documentId: string,
    discussionId: string
) {
    await api.delete(`/workspaces/${workspaceId}/documents/${documentId}/discussions/${discussionId}`);
}

export async function deleteReply(
    workspaceId: string,
    documentId: string,
    replyId: string
) {
    await api.delete(`/workspaces/${workspaceId}/documents/${documentId}/discussions/replies/${replyId}`);
}