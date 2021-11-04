import { CommandInteraction, TextChannel } from 'discord.js'
import { Main } from '../main'
import { BaseCommand } from './BaseCommand'

export default class AboutCommand extends BaseCommand {
  constructor(client: Main) {
    super(client, 'clear', 'Clears the chat history', [
      {
        name: 'amount',
        type: 'STRING' as const,
        description: 'The amount of messages to delete',
        required: false,
      },
    ])
  }
  async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true })

    const amount = parseInt((interaction.options.get('amount')?.value as string) ?? '100')
    const channel = interaction.channel

    if (!channel) {
      return interaction.reply('Could not find channel')
    }

    await (channel as TextChannel).bulkDelete(amount)
    await interaction.followUp({ content: 'Done!', ephemeral: true })
  }
}
