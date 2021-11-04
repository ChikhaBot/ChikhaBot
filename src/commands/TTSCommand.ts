import { CommandInteraction, Guild, VoiceChannel } from 'discord.js'
import { Main } from '../main'
import { MusicSubscription } from '../music/Subscription'
import { TTSSubscriptions } from '../tts/TTSSubscriptions'
import { BaseCommand } from './BaseCommand'

export default class TTSCommand extends BaseCommand {
  constructor(client: Main) {
    super(client, 'tts', 'Text to speech', [
      {
        name: 'message',
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
    const guildId = (interaction.guild?.id as string) ?? null
    const guild = (Main.Client.guilds.cache.get(guildId) as Guild) ?? null
    const userId = interaction.user.id
    const message = interaction.options.get('message')?.value as string

    if (!guildId || !guild) {
      await interaction.followUp('This command can only be used in a server')
    }

    const member = guild.members.cache.get(userId)
    const voiceChannel = member?.voice.channel as VoiceChannel

    if (!voiceChannel) {
      await interaction.followUp('You must be in a voice channel to use this command')
    }

    console.log(`TTS: ${message}`, voiceChannel)

    const TTSSubscription = TTSSubscriptions.get(guildId)

    if (!TTSSubscription) {
      TTSSubscriptions.add(guild)
    }

    TTSSubscriptions.get(guildId)?.say(message, voiceChannel)

    if (subscription) {
      // Resume playback if already in the channel
      subscription.audioPlayer.unpause()
    }

    await interaction.followUp({ content: 'Joined voice!', ephemeral: true })
  }
}
