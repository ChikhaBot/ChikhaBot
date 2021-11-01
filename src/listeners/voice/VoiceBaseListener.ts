import { Guild, GuildMember, VoiceChannel, VoiceState } from 'discord.js'
import env from '../../env'
import Storage from '../../storage/Base'
import MemoryStorage from '../../storage/Memory'

abstract class VoiceBaseListener {
  constructor(public storage: Storage = new MemoryStorage(), public OwnerOnly = false) {}
  isMemberMe(member: GuildMember): boolean{
    return member.id == env.BOT_ID
  }
  isMe(state: VoiceState): boolean {
    return state.member?.id === env.BOT_ID
  }
  process(newState: VoiceState, oldState: VoiceState): void {
    
    if (!this.isMe(newState)) {
      this._process(newState, oldState)
    }
  }
  abstract _process(newState: VoiceState, oldState: VoiceState): void

  async LeaveAfter(seconds: number,guild : Guild){
    const myVoiceState = guild.me?.voice
    if(myVoiceState){
      setTimeout(() => {myVoiceState.disconnect()}, seconds*1000);
    }
    
  }
}

export default VoiceBaseListener
