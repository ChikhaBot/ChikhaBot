import BaseListener from './BaseListener'
import { Message } from 'discord.js'

class ChkonListener extends BaseListener {
  constructor() {
    super('message', 'chkon')
  }

  async do(msg: Message): Promise<void> {
    const author_id = msg.author.id
    const score = Number(await this.storage.get(`chkon_${author_id}`)) || 0
    const newScore = score + 1
    this.storage.set(`chkon_${author_id}`, newScore.toString())
    const replies = ['li 7wak', 'Nod tchelel', 'leee hwaaaak']
    const reply = replies[Math.floor(Math.random() * replies.length)]
    msg.reply(`${reply}. ${newScore}-0`)
  }
}

export default ChkonListener
