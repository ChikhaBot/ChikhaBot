import { CommandInteraction } from 'discord.js'
import Queue from '../../music/Queue'
import { MusicSubscription } from '../../music/Subscription'
import { BaseCommand } from '../BaseCommand'

export default class SkipCommand extends BaseCommand {
  constructor() {
    super('skip', 'Skip to the next song in the queue', [
      {
        name: 'index',
        type: 'STRING' as const,
        description: 'The song to skip too',
        required: false,
      },
    ])
  }
  async execute(interaction: CommandInteraction, subscription: MusicSubscription) {
    if (subscription) {
      // Get the index to skip to

      const index = interaction.options.get('index')?.value as string | undefined

      if (index) {
        const indexNumber = parseInt(index) - 1
        Queue.skip(indexNumber)
      }

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
