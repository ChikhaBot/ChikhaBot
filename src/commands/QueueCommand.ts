import { AudioPlayerStatus, AudioResource } from '@discordjs/voice'
import { CommandInteraction } from 'discord.js'
import { MusicSubscription } from '../music/Subscription'
import { Track } from '../music/Track'
import { Command } from './Command'

export class QueueCommand extends Command {
  constructor() {
    super('queue', 'See the music queue')
  }
  async execute(interaction: CommandInteraction, subscription: MusicSubscription): Promise<void> {
    // Print out the current queue, including up to the next 5 tracks to be played.
    if (subscription) {
      const current =
        subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
          ? `Nothing is currently playing!`
          : `Playing **${(subscription.audioPlayer.state.resource as AudioResource<Track>).metadata.title}**`

      const queue = subscription.queue
        .slice(0, 5)
        .map((track, index) => `${index + 1}) ${track.title}`)
        .join('\n')

      await interaction.reply(`${current}\n\n${queue}`)
      return
    }
    await interaction.reply('Not playing in this server!')
  }
}
