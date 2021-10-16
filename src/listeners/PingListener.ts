import BaseListener from './BaseListener'
import { Message } from 'discord.js'

class PingListener extends BaseListener {
  constructor() {
    super('message', 'ping')
  }

  do(msg: Message): void {
    msg.reply('pong')
  }
}

export default PingListener
