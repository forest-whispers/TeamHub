import { Input } from "@/shared/components/ui/input"
import { SettingsSection } from "./SettingsSection"
import { SettingsField } from "./SettingsField"
import { SelectDropdown } from "@/shared/components/ui/SelectDropdown"
import type { WorkspaceSettings } from "../types"

interface GeneralSettingsSectionProps {
  name: string
  description: string
  accentColor: string
  onChange: (fields: Partial<WorkspaceSettings>) => void
}

export function GeneralSettingsSection({
  name,
  description,
  accentColor,
  onChange,
}: GeneralSettingsSectionProps) {
  return (
    <SettingsSection
      title="General Settings"
      description="Update your workspace identifying details and color brand accent"
    >
      <SettingsField label="Workspace Name" description="The public display name for the workspace.">
        <Input
          type="text"
          value={name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="text-xs h-9"
          placeholder="e.g. Engineering Team"
        />
      </SettingsField>

      <SettingsField
        label="Workspace Description"
        description="A short summary detailing the purpose of this workspace."
      >
        <Input
          type="text"
          value={description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="text-xs h-9"
          placeholder="e.g. Collaboration on core tasks"
        />
      </SettingsField>

      <SettingsField
        label="Workspace Accent Color"
        description="The primary accent color for UI elements in the sidebar and navigation."
      >
        <SelectDropdown
          value={accentColor}
          onChange={(val) => onChange({ accentColor: val })}
          options={[
            { value: "blue", label: "Blue" },
            { value: "green", label: "Green" },
            { value: "violet", label: "Violet" },
            { value: "indigo", label: "Indigo" },
            { value: "rose", label: "Rose" },
          ]}
          className="w-full"
        />
      </SettingsField>
    </SettingsSection>
  )
}
