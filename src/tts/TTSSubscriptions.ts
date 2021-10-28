import { Snowflake } from 'discord-api-types'
import { Guild } from 'discord.js'
import TTSPlayer from './TTSPlayer'

export class TTSSubscriptions {
  public static _subscriptions: Record<Snowflake, TTSPlayer> = {}

  private constructor() {
    //
  }
  public static get(id: Snowflake): TTSPlayer | undefined {
    return TTSSubscriptions._subscriptions[id]
  }

  public static add(guild: Guild): void {
    if (!TTSSubscriptions?._subscriptions[guild.id]) {
      TTSSubscriptions._subscriptions[guild.id] = new TTSPlayer(guild)
    }
  }
}
