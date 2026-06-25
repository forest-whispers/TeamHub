import { SettingsSection } from "./SettingsSection"
import { SettingsField } from "./SettingsField"
import { SettingsToggle } from "./SettingsToggle"
import { SelectDropdown } from "@/shared/components/ui/SelectDropdown"
import type { WorkspaceSettings } from "../types"

interface PreferencesSettingsSectionProps {
  defaultHomePage: string
  compactMode: boolean
  enableNotifications: boolean
  onChange: (fields: Partial<WorkspaceSettings>) => void
}

export function PreferencesSettingsSection({
  defaultHomePage,
  compactMode,
  enableNotifications,
  onChange,
}: PreferencesSettingsSectionProps) {
  return (
    <SettingsSection
      title="Preferences"
      description="Customize workspace interface configurations and local behavior preferences"
    >
      <SettingsField
        label="Default Home Page"
        description="The default page loaded when navigating to this workspace."
      >
        <SelectDropdown
          value={defaultHomePage}
          onChange={(val) => onChange({ defaultHomePage: val })}
          options={[
            { value: "home", label: "Home" },
            { value: "documents", label: "Documents" },
            { value: "members", label: "Members" },
            { value: "chat", label: "Chat" },
            { value: "files", label: "Files" },
          ]}
          className="w-full"
        />
      </SettingsField>

      <div className="border-t border-border/40 my-3" />

      <div className="space-y-4">
        <SettingsToggle
          label="Compact Mode"
          description="Reduce font sizes and padding across document lists, editor margins, and layout views."
          checked={compactMode}
          onChange={(checked) => onChange({ compactMode: checked })}
        />

        <SettingsToggle
          label="Enable Notifications"
          description="Receive instant local push banners when documents are updated or chat rooms receive messages."
          checked={enableNotifications}
          onChange={(checked) => onChange({ enableNotifications: checked })}
        />
      </div>
    </SettingsSection>
  )
}
