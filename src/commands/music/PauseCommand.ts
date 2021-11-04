import { CommandInteraction } from 'discord.js'
import { MusicSubscription } from '../../music/Subscription'
import { BaseCommand } from '../BaseCommand'
import { Main } from '../../main'

export default class PauseCommand extends BaseCommand {
  constructor(client: Main) {
    super(client, 'pause', 'Pauses the song that is currently playing')
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
