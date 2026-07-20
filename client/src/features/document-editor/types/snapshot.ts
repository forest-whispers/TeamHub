export interface DocumentSnapshotUser {
  id: string
  name: string
  avatar: string | null
}

export interface DocumentSnapshotListItem {
  id: string
  createdAt: string
  description: string | null
  createdBy: DocumentSnapshotUser
}

export interface DocumentSnapshotDetail {
  id: string
  state: number[]
  createdAt: string
  description: string | null
  createdBy: DocumentSnapshotUser
}