import { CommandInteraction } from 'discord.js'
import { MusicSubscription } from '../../music/Subscription'
import { BaseCommand } from '../BaseCommand'
import { Main } from '../../main'

export default class ResumeCommand extends BaseCommand {
  constructor(client: Main) {
    super(client, 'resume', 'Resume playback of the current song')
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
