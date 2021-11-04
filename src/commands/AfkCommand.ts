import { CommandInteraction } from 'discord.js'
import { BaseCommand } from './BaseCommand'

export default class AfkCommand extends BaseCommand {
  constructor() {
    super('afk', 'Put user into AFK and specify reason', [
      {
        name: 'user',
        description: 'The user to put afk',
        type: 'USER',
        required: true,
      },
      {
        name: 'reason',
        description: 'The reason why he is going afk',
        type: 'STRING',
        required: false,
      },
    ])
  }
  async execute(interaction: CommandInteraction): Promise<void> {
    const guildId = interaction.guildId as string
    const userId = interaction.options.get('user')?.value as string
    const reason = interaction.options.get('reason')?.value as string

    await interaction.reply(`${userId} is going AFK, Reason : ${reason} `)
  }
}
