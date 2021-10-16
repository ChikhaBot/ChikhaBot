import { CommandInteraction } from 'discord.js'
import { MusicSubscription } from '../music/Subscription'
import { Command } from './Command'

export class SkipCommand extends Command {
  constructor() {
    super('skip', 'Skip to the next song in the queue')
  }
  async execute(interaction: CommandInteraction, subscription: MusicSubscription) {
    if (subscription) {
      // Calling .stop() on an AudioPlayer causes it to transition into the Idle state. Because of a state transition
      // listener defined in music/subscription.ts, transitions into the Idle state mean the next track from the queue
      // will be loaded and played.
      subscription.audioPlayer.stop()
      await interaction.reply('Skipped song!')

      return
    }
    await interaction.reply('Not playing in this server!')
  }
}
