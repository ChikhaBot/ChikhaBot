import { AudioPlayerStatus } from '@discordjs/voice'
import { CommandInteraction } from 'discord.js'
import Queue from '../../music/Queue'
import { MusicSubscription } from '../../music/Subscription'
import { BaseCommand } from '../BaseCommand'
import { Main } from '../../main'

export default class QueueCommand extends BaseCommand {
  constructor(client: Main) {
    super(client, 'queue', 'See the music queue')
  }
  async execute(interaction: CommandInteraction, subscription: MusicSubscription): Promise<void> {
    // Print out the current queue, including up to the next 5 tracks to be played.
    if (subscription) {
      const current =
        subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
          ? `Nothing is currently playing!`
          : `Playing **${Queue.current?.title}**`

      const queue = Queue.queue.map((track, index) => `${index + 1}) ${track.title}`).join('\n')

      await interaction.reply(`${current}\n\n${queue}`)
      return
    }
    await interaction.reply('Not playing in this server!')
  }
}
