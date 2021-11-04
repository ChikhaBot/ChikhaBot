import { CommandInteraction } from 'discord.js'
import { Main } from '../../main'
import { MusicSubscription } from '../../music/Subscription'
import { BaseCommand } from '../BaseCommand'

export default class LeaveCommand extends BaseCommand {
  constructor() {
    super('leave', 'Leave the voice channel')
  }
  async execute(interaction: CommandInteraction, subscription: MusicSubscription): Promise<void> {
    if (subscription) {
      subscription.voiceConnection.destroy()
      Main.subscriptions.delete(interaction.guildId as string)
      await interaction.reply({ content: `Left channel!`, ephemeral: true })
      return
    }
    await interaction.reply('Not playing in this server!')
  }
}
