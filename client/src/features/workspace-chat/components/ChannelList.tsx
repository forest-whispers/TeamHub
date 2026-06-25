import type { Channel } from "../types"
import { ChannelItem } from "./ChannelItem"

interface ChannelListProps {
  channels: Channel[]
  selectedChannelId: string | null
  onSelectChannel: (channelId: string) => void
}

export function ChannelList({ channels, selectedChannelId, onSelectChannel }: ChannelListProps) {
  return (
    <div className="space-y-1">
      {channels.length === 0 ? (
        <p className="text-[11px] text-muted-foreground italic px-3 py-2">No channels found</p>
      ) : (
        channels.map((channel) => (
          <ChannelItem
            key={channel.id}
            channel={channel}
            isSelected={channel.id === selectedChannelId}
            onClick={() => onSelectChannel(channel.id)}
          />
        ))
      )}
    </div>
  )
}
