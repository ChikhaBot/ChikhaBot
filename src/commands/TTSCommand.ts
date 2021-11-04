import { CommandInteraction } from 'discord.js'
import env from '../env'
import { Main } from '../main'
import { MusicSubscription } from '../music/Subscription'
import { BaseCommand } from './BaseCommand'

export default class TTSCommand extends BaseCommand {
  constructor(client: Main) {
    super(client, 'tts', 'Text to speech', [
      {
        name: 'tts',
        description: 'The message to play in voice',
        type: 'STRING',
        required: true,
      },
    ])
  }
  async execute(interaction: CommandInteraction, subscription: MusicSubscription): Promise<void> {
    await interaction.deferReply()

    if (subscription) {
      // Pause playback if already in the channel
      subscription.audioPlayer.pause()
    }

    // Process
    await interaction.reply(`This feature is still a work in progress.. Gol ldak <@${env.BOT_OWNER_ID}> ykemlha.`)

    if (subscription) {
      // Resume playback if already in the channel
      subscription.audioPlayer.unpause()
    }
  }
}
