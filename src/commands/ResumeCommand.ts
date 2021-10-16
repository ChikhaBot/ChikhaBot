import { CommandInteraction } from 'discord.js'
import { MusicSubscription } from '../music/Subscription'
import { Command } from './Command'

export class ResumeCommand extends Command {
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
