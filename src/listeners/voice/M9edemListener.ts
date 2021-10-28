import { Guild, TextChannel, VoiceChannel, VoiceState } from 'discord.js'
import RedisStorage from '../../storage/Redis'
import { TTSSubscriptions } from '../../tts/TTSSubscriptions'
import VoiceBaseListener from './VoiceBaseListener'

export interface Tbergiga {
  guildId: string
  userId: string
  type: string
}

export type Carnet = Record<string, Tbergiga[]>

export default class M9edemListener extends VoiceBaseListener {
  private _events: Carnet

  constructor() {
    super(new RedisStorage())
    this._events = {}
  }

  async addEvent(guildId: string, userId: string, type: string) {
    const events = this.events

    if (!events[guildId]) {
      events[guildId] = []
    }

    events[guildId].push({
      guildId,
      userId,
      type,
    })

    this.events = events
  }

  set events(events: Carnet) {
    this._events = events
    this.onEventsChange(events)
  }

  get events(): Carnet {
    return this._events
  }

  onEventsChange(events: Carnet) {
    this.storage.set('tbergigat', JSON.stringify(events))
  }

  async _process(newState: VoiceState, oldState: VoiceState) {
    // TODO: move this from here
    TTSSubscriptions.add(newState.guild)

    // Check for old events
    const storedEvents = await this.storage.get('tbergigat')

    if (storedEvents && this._events === {}) {
      this._events = JSON.parse(storedEvents as string)
    }

    const joinedChannel = newState.channelId && !oldState.channelId
    const leftChannel = oldState.channelId && !newState.channelId
    const changedChannels = oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId

    if (joinedChannel && newState.member) {
      this.addEvent(newState.guild.id, newState.member.id, 'join')
      this.onJoin(newState, oldState)
    }

    if (leftChannel && newState.member) {
      this.addEvent(newState.guild.id, newState.member.id, 'leave')
      this.onLeave(newState, oldState)
    }

    if (changedChannels && newState.member) {
      this.addEvent(newState.guild.id, newState.member.id, 'switch')
      this.onChange(newState, oldState)
    }
  }

  onChange(newState: VoiceState, oldState: VoiceState) {
    const generalChannel = getGeneralChannel(newState.guild)
    if (generalChannel) {
      generalChannel.send(`${newState.member?.displayName} switched voice channels`)
    }
    this.detectMusicChannel(newState)
  }

  onJoin(newState: VoiceState, oldState: VoiceState) {
    const generalChannel = getGeneralChannel(newState.guild)
    if (generalChannel) {
      generalChannel.send(`${newState.member?.displayName} joined the voice channel`)
    }
    this.detectMusicChannel(newState)
  }

  onLeave(newState: VoiceState, oldState: VoiceState) {
    const generalChannel = getGeneralChannel(newState.guild)
    if (generalChannel) {
      generalChannel.send(`${newState.member?.displayName} left the voice channel`)
    }
  }

  detectMusicChannel(newState: VoiceState) {
    // Check if music channel
    const musicChannel = getMusicChannel(newState.guild)
    if (musicChannel?.id === newState.channelId) {
      // Join the music channel
      TTSSubscriptions.get(newState.guild.id)?.say(`Salam habiba, ache hebe el khater ? Dir /play`, musicChannel)
    }
  }
}

function getGeneralChannel(guild: Guild): TextChannel | null {
  const textChannels = guild.channels.cache.filter((c) => c.isText() && c.name === 'mute-me')
  const firstChannel = textChannels.first()

  return (firstChannel as TextChannel) ?? null
}

function getMusicChannel(guild: Guild): VoiceChannel | null {
  const textChannels = guild.channels.cache.filter((c) => c.isVoice() && c.name === 'Music')
  const firstChannel = textChannels.first()

  return (firstChannel as VoiceChannel) ?? null
}
