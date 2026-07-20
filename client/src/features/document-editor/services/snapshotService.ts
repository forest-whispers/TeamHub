import api from "@/shared/lib/api"
import type { DocumentSnapshotListItem, DocumentSnapshotDetail } from "../types/snapshot"

export const snapshotService = {
  getSnapshots: async (
    workspaceId: string,
    documentId: string
  ): Promise<DocumentSnapshotListItem[]> => {
    const { data } = await api.get(
      `/workspaces/${workspaceId}/documents/${documentId}/history`
    )
    return data
  },

  getSnapshotDetail: async (
    workspaceId: string,
    documentId: string,
    snapshotId: string
  ): Promise<DocumentSnapshotDetail> => {
    const { data } = await api.get(
      `/workspaces/${workspaceId}/documents/${documentId}/history/${snapshotId}`
    )
    return data
  },
}