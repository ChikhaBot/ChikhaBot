import { ClientEvents, Message } from 'discord.js'
import env from '../../env'
import Storage from '../../storage/Base'
import MemoryStorage from '../../storage/Memory'

abstract class BaseListener {
  constructor(
    public event: keyof ClientEvents,
    public command: string,
    public storage: Storage = new MemoryStorage(),
    public OwnerOnly = false,
  ) {}

  checkPermission(msg: Message): boolean {
    return !this.OwnerOnly || (this.OwnerOnly && msg.author.id === env.BOT_OWNER_ID)
  }

  isMy(msg: Message): boolean {
    return msg.author.id === env.BOT_ID
  }

  shouldRespond(msg: Message): boolean {
    return this.checkPermission(msg) && !this.isMy(msg)
  }

  isMentioned(msg: Message): boolean {
    return msg.mentions.users.some((u) => u.id === env.BOT_ID)
  }

  process(msg: Message): void {
    if (msg.content.indexOf(this.command) > -1) {
      if (this.shouldRespond(msg)) {
        this.do(msg)
      } else {
        msg.reply('Tmchi t9wed la ?')
      }
    }
  }
  abstract do(args: Message): void
}

export default BaseListener
