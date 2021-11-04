import { Guild, TextChannel, VoiceChannel, VoiceState, GuildMember, StageChannel } from 'discord.js'
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
    const guild = newState.guild;
    const generalChannel = getGeneralChannel(guild)
    const member = newState.member

    if (generalChannel) {
      generalChannel.send(`${member?.displayName} switched voice channels`)
    }
    this.detectMusicChannel(newState)

    const voiceChannel = newState.channel
    const is_alone = this.isAloneInChannel(member, voiceChannel)
    if (is_alone && !this.isMe(newState)) {
      generalChannel?.send(`${member?.displayName} rah bo7do f ${voiceChannel?.name}`)
    }
    const me_in_channel = oldState.channel?.members.find(user => this.isMemberMe(user));
    if (me_in_channel && this.isAloneInChannel(me_in_channel, oldState.channel)) {
      console.log("Ah shit i'm gonna leave")
      this.LeaveAfter(10, guild);
    }


  }

  onJoin(newState: VoiceState, oldState: VoiceState) {
    const generalChannel = getGeneralChannel(newState.guild) //redundant or whatever it should be defined at bot connection not at every ev
    const member = newState.member

    if (generalChannel) {
      generalChannel.send(`${member?.displayName} joined the voice channel`)
    }
    this.detectMusicChannel(newState)
    const voiceChannel = newState.channel

    const is_alone = this.isAloneInChannel(member, voiceChannel)
    if (is_alone && !this.isMe(newState)) {
      generalChannel?.send(`${member?.displayName} rah bo7do f ${voiceChannel?.name}`)
    }
  }

  onLeave(newState: VoiceState, oldState: VoiceState) {
    const guild = oldState.guild;
    const generalChannel = getGeneralChannel(guild)
    if (generalChannel) {
      generalChannel.send(`${newState.member?.displayName} left the voice channel`)
    }
    const me_in_channel = oldState.channel?.members.find(user => this.isMemberMe(user));
    console.log("me_in_channel")
    if (me_in_channel && this.isAloneInChannel(me_in_channel, oldState.channel)) {
      console.log("Ah shit i'm gonna leave")
      this.LeaveAfter(10, guild);
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
  isAloneInChannel(member: GuildMember | null, voiceChannel: VoiceChannel | StageChannel | null) {
    if (member && voiceChannel && voiceChannel.members.get(member.id) && voiceChannel.members.size == 1) {
      return true;
    }
    return false;
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
