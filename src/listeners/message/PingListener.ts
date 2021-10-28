import BaseListener from './BaseListener'
import { Message } from 'discord.js'

class PingListener extends BaseListener {
  constructor() {
    super('messageCreate', 'ping')
  }

  do(msg: Message): void {
    msg.reply('pong')
  }
}

export default PingListener
