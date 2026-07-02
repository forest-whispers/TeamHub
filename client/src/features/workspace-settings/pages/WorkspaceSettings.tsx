import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  useWorkspaceSettings,
  useUpdateWorkspaceSettings,
  useDeleteWorkspace,
  useRegenerateInviteCode,
} from "../hooks/useWorkspaceSettings"
import { useLeaveWorkspace } from "@/features/workspace/hooks/useWorkspaceMutations"
import { GeneralSettingsSection } from "../components/GeneralSettingsSection"
import { MembersSettingsSection } from "../components/MembersSettingsSection"
import { PreferencesSettingsSection } from "../components/PreferencesSettingsSection"
import { DangerZoneSection } from "../components/DangerZoneSection"
import { ConfirmationDialog } from "../components/ConfirmationDialog"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Settings, AlertCircle, Save, RotateCcw } from "lucide-react"
import type { WorkspaceSettings as SettingsType } from "../types"

export default function WorkspaceSettings() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const [formState, setFormState] = useState<SettingsType | null>(null)

  // Danger Zone dialog trigger states
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const leaveWorkspaceMutation = useLeaveWorkspace()

  // Fetch Settings
  const {
    data: fetchedSettings,
    isLoading,
    error,
    refetch,
  } = useWorkspaceSettings(workspaceId || "")

  // Navigate
  const navigate = useNavigate()

  // Save Settings Mutation
  const updateSettingsMutation = useUpdateWorkspaceSettings(workspaceId || "")

  // Delete Workspace Mutation
  const deleteWorkspaceMutation = useDeleteWorkspace(workspaceId || "")

  // Regenerate Invite Code Mutation
  const regenerateInviteMutation = useRegenerateInviteCode(workspaceId || "")

  // Sync fetched settings to local formState on initial load
  useEffect(() => {
    if (fetchedSettings && !formState) {
      setFormState({ ...fetchedSettings })
    }
  }, [fetchedSettings, formState])

  // Reset formState when workspace changes or settings are refetched
  useEffect(() => {
    if (fetchedSettings) {
      setFormState({ ...fetchedSettings })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId])

  // Compare local formState with query cache to check for unsaved edits
  const hasChanges = useMemo(() => {
    if (!fetchedSettings || !formState) return false
    return (
      formState.name !== fetchedSettings.name ||
      formState.description !== fetchedSettings.description ||
      formState.accentColor !== fetchedSettings.accentColor ||
      formState.defaultHomePage !== fetchedSettings.defaultHomePage ||
      formState.compactMode !== fetchedSettings.compactMode ||
      formState.enableNotifications !== fetchedSettings.enableNotifications
    )
  }, [formState, fetchedSettings])

  // Save changes handler
  const handleSave = () => {
    if (!formState) return
    updateSettingsMutation.mutate(formState, {
      onSuccess: (updated) => {
        toast.success("Workspace settings updated successfully!")
        setFormState({ ...updated })
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to save settings")
      },
    })
  }

  // Reset changes handler
  const handleReset = () => {
    if (fetchedSettings) {
      setFormState({ ...fetchedSettings })
      toast.info("Changes reset to original settings")
    }
  }

  // Local helper for field updates
  const handleFieldChange = (fields: Partial<SettingsType>) => {
    if (formState) {
      setFormState({ ...formState, ...fields })
    }
  }

  const handleLeaveWorkspace = () => {
    if (!workspaceId) return
    leaveWorkspaceMutation.mutate(workspaceId, {
      onSuccess: () => {
        setLeaveOpen(false)
        toast.success("Successfully left the workspace.")
        navigate("/dashboard")
      },
      onError: () => {
        toast.error("Something went wrong. Please try again.")
      },
    })
  }

  const handleDeleteWorkspace = () => {
    deleteWorkspaceMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Workspace deleted successfully!")
        setDeleteOpen(false)
        navigate("/dashboard")
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to delete workspace")
      },
    })
  }

  const handleRegenerateInviteCode = () => {
    regenerateInviteMutation.mutate(undefined, {
      onSuccess: (res) => {
        toast.success("Invite code regenerated successfully!")
        setFormState((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            inviteCode: res.inviteCode,
          }
        })
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to regenerate invite code")
      },
    })
  }

  // Render skeletons during initial fetch loading
  const renderLoadingSkeletons = () => (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, idx) => (
        <Card key={idx} className="border border-border/50 bg-card/45">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-56" />
            </div>
            <div className="space-y-3 pt-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-left select-none relative pb-28">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure workspace settings, details, default behaviors, and preferences
          </p>
        </div>
      </div>

      {isLoading ? (
        renderLoadingSkeletons()
      ) : error ? (
        /* Error display */
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex items-center justify-between gap-4 max-w-md w-full text-left">
            <span className="text-sm text-destructive font-medium flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              Failed to load workspace settings.
            </span>
            <Button size="xs" variant="outline" onClick={() => refetch()} className="cursor-pointer">
              Retry
            </Button>
          </div>
        </div>
      ) : !formState ? (
        /* Empty/Unavailable state */
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-xl bg-card/25 min-h-75">
          <Settings className="size-12 text-muted-foreground/60 mb-3" />
          <h3 className="text-sm font-bold text-foreground">Settings data unavailable</h3>
          <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">
            The configuration parameters for this workspace could not be fetched.
          </p>
        </div>
      ) : (
        /* Loaded Content */
        <div className="space-y-6">
          {/* General Section */}
          <GeneralSettingsSection
            name={formState.name}
            description={formState.description}
            accentColor={formState.accentColor}
            onChange={handleFieldChange}
          />

          {/* Members Section */}
          <MembersSettingsSection
            totalMembers={formState.totalMembers}
            owner={formState.owner}
            inviteCode={formState.inviteCode}
            isRegenerating={regenerateInviteMutation.isPending}
            onRegenerateInviteCode={handleRegenerateInviteCode}
            onManageMembers={() => toast.info("Manage members option triggered (placeholder)")}
          />

          {/* Preferences Section */}
          <PreferencesSettingsSection
            defaultHomePage={formState.defaultHomePage}
            compactMode={formState.compactMode}
            enableNotifications={formState.enableNotifications}
            onChange={handleFieldChange}
          />

          {/* Danger Zone Section */}
          <DangerZoneSection
            onLeaveWorkspace={() => setLeaveOpen(true)}
            onDeleteWorkspace={() => setDeleteOpen(true)}
          />

          {/* Unsaved Changes Sticky Banner */}
          {hasChanges && (
            <div className="fixed bottom-6 left-6 md:left-70 right-6 max-w-4xl mx-auto bg-card border border-border/80 rounded-xl px-4 py-3 flex items-center justify-between shadow-xl z-35 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold text-foreground">
                  Unsaved changes in settings
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleReset}
                  className="cursor-pointer gap-1 text-[11px]"
                >
                  <RotateCcw className="size-3" />
                  Reset
                </Button>
                <Button
                  size="xs"
                  onClick={handleSave}
                  disabled={updateSettingsMutation.isPending}
                  className="cursor-pointer gap-1 text-[11px]"
                >
                  <Save className="size-3" />
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog Placeholders */}
      <ConfirmationDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title="Leave Workspace"
        description="Are you sure you want to leave this workspace? You will lose access to all collaborative documents, files, and chat rooms. This is a structural placeholder and no action will be executed."
        confirmText="Leave Workspace"
        variant="destructive"
        onConfirm={handleLeaveWorkspace}
      />

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Workspace"
        description="Are you sure you want to permanently delete this workspace? This will destroy all documents, chat rooms, activity histories, and analytics reports. This action is irreversible."
        confirmText={deleteWorkspaceMutation.isPending ? "Deleting..." : "Delete Workspace"}
        variant="destructive"
        onConfirm={handleDeleteWorkspace}
      />
    </div>
  )
}