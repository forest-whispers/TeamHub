export interface WorkspaceFileUploadedBy {
  id: string
  name: string
  avatar: string | null
}

export interface WorkspaceFile {
  id: string
  originalName: string
  displayName: string
  storageKey: string
  url: string
  mimeType: string
  extension: string | null
  size: number
  createdAt: string
  updatedAt: string
  uploadedBy: WorkspaceFileUploadedBy
}