import BaseListener from './BaseListener'
import { Message } from 'discord.js'

class ChikhaListener extends BaseListener {
  constructor() {
    super('messageCreate', 'hikha aji')
  }

  do(msg: Message): void {
    const replies = [
      'la',
      'Deber lkerek m3ah',
      'Binatkom a weld l9e7ba',
      'Mal zamel boh hada',
      '3tini ti9ar a weld l9e7ba',
      'wache waldak o nassyak ? 9wed 3liya.',
    ]
    const caller = msg.author.id
    const randomReply = replies[Math.floor(Math.random() * replies.length)]
    msg.reply(`<@${caller}> ${randomReply}`)
  }
}

export default ChikhaListener
