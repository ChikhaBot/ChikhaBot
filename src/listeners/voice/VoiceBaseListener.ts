import { ClientEvents, TextChannel, VoiceState, GuildMember } from 'discord.js'
import Storage from '../../storage/Base'
import MemoryStorage from '../../storage/Memory'

abstract class VoiceBaseListener {
  constructor(
    public event: keyof ClientEvents,
    public command: string,
    public storage: Storage = new MemoryStorage(),
    public OwnerOnly = false,
    public currentChannelID: string,
    public maintextChannel: TextChannel,
  ) {}

  isMyCurrentChannel(): boolean {
    return true
  }
  isMe(): boolean {
    return false
  }

  process(oldState: VoiceState, newState: VoiceState, user: GuildMember): void {
    if (this.isMyCurrentChannel()) {
      this.do()
    } else {
      userId = user
      this.maintextChannel
        .send(`<@${userId}> Khroj ola dkhel mchi so9i?`)
        .then((message) => console.log(`Sent message: ${message.content}`))
        .catch(console.error)
    }
  }

  abstract do(): void
}

export default BaseListener
