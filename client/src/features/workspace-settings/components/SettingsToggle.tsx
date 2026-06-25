interface SettingsToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function SettingsToggle({ label, description, checked, onChange, disabled = false }: SettingsToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 text-left select-none">
      <div className="space-y-0.5 min-w-0 flex-1">
        <span className="text-xs font-semibold text-foreground block">
          {label}
        </span>
        {description && (
          <p className="text-[10px] text-muted-foreground leading-normal">
            {description}
          </p>
        )}
      </div>

      {/* Styled Toggle Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`pointer-events-none block size-4 rounded-full bg-background shadow-md ring-0 transition-transform duration-200 ${
            checked ? "translate-x-4.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  )
}
