import { CommandInteraction } from 'discord.js'
import { MusicSubscription } from '../../music/Subscription'
import { BaseCommand } from '../BaseCommand'

export default class PauseCommand extends BaseCommand {
  constructor() {
    super('pause', 'Pauses the song that is currently playing')
  }
  async execute(interaction: CommandInteraction, subscription: MusicSubscription): Promise<void> {
    if (subscription) {
      subscription.audioPlayer.pause()
      await interaction.reply({ content: `Paused!`, ephemeral: true })
      return
    }
    await interaction.reply('Not playing in this server!')
  }
}
