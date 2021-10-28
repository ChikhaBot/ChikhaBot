import {
  VoiceConnection,
  AudioPlayer,
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
  createAudioResource,
} from '@discordjs/voice'
import { Guild, VoiceChannel } from 'discord.js'
import AbstractProvider from './providers/AbstractProvider'
import GoogleProvider from './providers/GoogleProvider'
import Payload from './providers/Payload'

class PayloadQueue {
  store: Payload[]
  constructor(initial = []) {
    if (!Array.isArray(initial)) {
      throw new TypeError('Queue may only contain an array as a store.')
    }

    this.store = initial
  }

  enqueue(item: Payload) {
    this.store.push(item)
  }

  dequeue() {
    return this.store.shift()
  }

  clear() {
    this.store = []
  }

  isEmpty() {
    return this.store.length === 0
  }
}

export default class TTSPlayer {
  guild: Guild
  queue: PayloadQueue
  speaking: boolean
  googleProvider: AbstractProvider

  connection!: VoiceConnection
  audioPlayer!: AudioPlayer

  constructor(guild: Guild) {
    this.guild = guild

    this.queue = new PayloadQueue()
    this.speaking = false

    this.googleProvider = new GoogleProvider()
  }

  async say(sentence: string, channel: VoiceChannel) {
    const provider = this.googleProvider

    const payload = await provider.createPayload(sentence)

    if (Array.isArray(payload)) {
      payload.forEach((p) => this.queue.enqueue(p))
    } else {
      this.queue.enqueue(payload)
    }

    if (!this.speaking) {
      this.play(channel)
    }
  }

  async play(channel: VoiceChannel) {
    if (this.queue.isEmpty()) {
      return
    }

    const payload = this.queue.dequeue()

    if (!payload) {
      return
    }

    const provider = this.googleProvider

    console.info(provider.getPlayLogMessage(payload, this.guild))

    this.speaking = true

    this.connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
    })
    this.connection.on('error', console.error)

    this.audioPlayer = new AudioPlayer()
    this.audioPlayer.on('error', console.error)
    this.connection.subscribe(this.audioPlayer)

    this.audioPlayer.play(createAudioResource(payload.resource))
  }
}
