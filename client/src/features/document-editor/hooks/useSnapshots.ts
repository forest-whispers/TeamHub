import { useQuery } from "@tanstack/react-query"
import { snapshotService } from "../services/snapshotService"

export function useSnapshots(
  workspaceId: string,
  documentId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["document-snapshots", workspaceId, documentId],
    queryFn: () => snapshotService.getSnapshots(workspaceId, documentId),
    enabled: Boolean(workspaceId && documentId && enabled),
    staleTime: 1000 * 60 * 5,
  })
}

export function useSnapshotDetail(
  workspaceId: string,
  documentId: string,
  snapshotId: string | null,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["document-snapshot-detail", workspaceId, documentId, snapshotId],
    queryFn: () => snapshotService.getSnapshotDetail(workspaceId, documentId, snapshotId!),
    enabled: Boolean(workspaceId && documentId && snapshotId && enabled),
    staleTime: Infinity,
  })
}