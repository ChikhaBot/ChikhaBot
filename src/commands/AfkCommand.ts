import { CommandInteraction } from 'discord.js'
import { Main } from '../main'
import { BaseCommand } from './BaseCommand'

export default class AfkCommand extends BaseCommand {
  constructor(client: Main) {
    super(client, 'afk', 'Put user into AFK and specify reason', [
      {
        name: 'reason',
        description: 'The reason why he is going afk',
        type: 'STRING',
        required: false,
      },
      {
        name: 'user',
        description: 'The user to put afk',
        type: 'USER',
        required: false,
      },
    ])

    this.author = {
      id: 'Buninadev#6334',
    }
  }

  async execute(interaction: CommandInteraction): Promise<void> {
    const userId = (interaction.options.get('user')?.value as string) ?? interaction.member?.user.id
    const reason = (interaction.options.get('reason')?.value as string) || 'No reason specified'

    await interaction.reply(`<@${userId}> is going AFK, Reason : ${reason} `)
  }
}
