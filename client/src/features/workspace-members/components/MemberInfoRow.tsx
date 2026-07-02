interface MemberInfoRowProps {
  label: string
  value: string
}

export function MemberInfoRow({ label, value }: MemberInfoRowProps) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border/40 text-xs">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className="text-foreground font-semibold text-right truncate max-w-50" title={value}>
        {value}
      </span>
    </div>
  )
}