import BaseListener from './BaseListener'
import { Message } from 'discord.js'

class NinjutsuListener extends BaseListener {
  constructor() {
    super('message', 'ninjutsu')
  }

  do(msg: Message): void {
    msg.reply('#clear')
  }
}

export default NinjutsuListener
