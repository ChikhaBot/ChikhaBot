import BaseListener from './BaseListener'
import { Message, VoiceChannel } from 'discord.js'
import fs from 'fs'
import path from 'path'
import {
  AudioPlayer,
  createAudioResource,
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
  VoiceConnection,
} from '@discordjs/voice'
import TTSPlayer from '../../tts/TTSPlayer'

class DkholListener extends BaseListener {
  connection!: VoiceConnection
  audioPlayer!: AudioPlayer

  constructor() {
    super('messageCreate', 't3ali')
  }

  shouldRespond(msg: Message): boolean {
    return true
  }

  introduce() {
    // Get all audio files
    const files = fs.readdirSync(path.join(__dirname, '../../static/audio'))
    const randomAudio = files[Math.floor(Math.random() * files.length)]

    // Create a dispatcher
    const audioResource = createAudioResource(path.join(__dirname, '../static/audio', randomAudio))
    this.audioPlayer.play(audioResource)
  }

  async do(msg: Message): Promise<void> {
    // Join the same voice channel of the author of the message
    const channel = msg.member?.voice.channel as VoiceChannel
    if (channel) {
      this.connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
      })
      this.connection.on('error', console.error)

      this.audioPlayer = new AudioPlayer()
      this.audioPlayer.on('error', console.error)
      this.connection.subscribe(this.audioPlayer)

      if (msg.guild) {
        const test = new TTSPlayer(msg.guild)
        test.say('hana jite bebe', channel)
      }
    } else {
      msg.reply('3endak dkhol l chi voice channel')
    }
    this.introduce()
  }
}

export default DkholListener
