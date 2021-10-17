import { joinVoiceChannel, DiscordGatewayAdapterCreator, entersState, VoiceConnectionStatus } from '@discordjs/voice'
import { CommandInteraction, GuildMember } from 'discord.js'
import { Main } from '../main'
import { MusicSubscription } from '../music/Subscription'
import { batchArray } from '../utils'
import { Command } from './Command'
import { yts } from './yts'

export class PlayCommand extends Command {
  constructor() {
    super('play', 'Play a song', [
      {
        name: 'song',
        type: 'STRING' as const,
        description: 'The URL of the song to play',
        required: true,
      },
    ])
  }

  public async execute(interaction: CommandInteraction, subscription: MusicSubscription) {
    await interaction.deferReply() // As this will take longer than the default timeout (3s), we need to defer the reply

    const guildId = interaction.guildId as string
    // Extract the video URL from the command
    const song = interaction.options.get('song')?.value as string

    // If a connection to the guild doesn't already exist and the user is in a voice channel, join that channel
    // and create a subscription.
    if (!subscription) {
      if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
        const channel = interaction.member.voice.channel
        subscription = new MusicSubscription(
          joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
          }),
        )
        subscription.voiceConnection.on('error', console.warn)
        Main.subscriptions.set(guildId, subscription)
      }
    }

    // If there is no subscription, tell the user they need to join a channel.
    if (!subscription) {
      await interaction.followUp('Join a voice channel and then try that again!')
      return
    }

    // Make sure the connection is ready before processing the user's request
    try {
      await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3)
    } catch (error) {
      console.warn(error)
      await interaction.followUp('Failed to join voice channel within 20 seconds, please try again later!')
      return
    }

    try {
      // Check if the requested song is a url or a search query
      let url = song

      if (!song.startsWith('http')) {
        // This is a search query, so we need to search for it
        const results = await yts(song)
        if (results.videos.length === 0) {
          await interaction.followUp('No results found for that query!')
          return
        }

        url = results.videos[0].url
      }

      // Get music provider for url
      const supportedProvider = [...Main.providers].find(([, p]) => p.canPlay(url))

      if (!supportedProvider) {
        await interaction.followUp(`That song url \`${url}\` is not supported :(`)
        return
      }

      const [providerName, provider] = supportedProvider

      // Create a track from the user's url
      await interaction.followUp(`Loading ${providerName} song...`)

      const tracks = await provider.handle(url, {
        onStart() {
          interaction.followUp({ content: ``, ephemeral: true }).catch(console.warn)
        },
        onFinish() {
          interaction.followUp({ content: '', ephemeral: true }).catch(console.warn)
        },
        onError(error) {
          console.warn(error)
          interaction.followUp({ content: `Error: ${error.message}`, ephemeral: true }).catch(console.warn)
        },
      })

      // Enqueue the track and reply a success message to the user
      for (const track of tracks) {
        subscription.enqueue(track)
      }

      if (tracks.length > 10) {
        // Batch the tracks
        for (const batch of batchArray(tracks, 10)) {
          const tracksStr = batch.map((t, i) => `${i + 1}. ${t.title}`).join('\n')
          await interaction.followUp(`Enqueued \n\`${tracksStr}\``)
        }
      }
    } catch (error) {
      console.warn(error)
      await interaction.reply('Failed to play track, please try again later!')
    }
  }
}
