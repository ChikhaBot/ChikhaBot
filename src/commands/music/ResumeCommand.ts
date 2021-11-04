import { CommandInteraction } from 'discord.js'
import { MusicSubscription } from '../../music/Subscription'
import { BaseCommand } from '../BaseCommand'

export default class ResumeCommand extends BaseCommand {
  constructor() {
    super('resume', 'Resume playback of the current song')
  }
  async execute(interaction: CommandInteraction, subscription: MusicSubscription): Promise<void> {
    if (subscription) {
      subscription.audioPlayer.unpause()
      await interaction.reply({ content: `Unpaused!`, ephemeral: true })
      return
    }
    await interaction.reply('Not playing in this server!')
  }
}
