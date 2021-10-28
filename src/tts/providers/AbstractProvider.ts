import { Guild } from 'discord.js'
import Payload from './Payload'

/**
 * This class represents an abstract TTS provider. Any TTS provider should create a concrete implementation of this class.
 */
export default class AbstractProvider {
  constructor() {
    if (new.target === AbstractProvider) {
      throw new TypeError('Cannot instantiate AbstractProvider!')
    }
  }

  createPayload(sentence: string): Promise<Payload> | Promise<Payload[]> {
    throw new Error('Method not implemented!')
  }

  /**
   * Gets the message to log once a TTS message has been played.
   * @param {Payload} payload The payload for this TTS message.
   * @param {Discord.Guild} guild The guild where the TTS message was played.
   * @returns The message to log once the TTS message has been played.
   */
  getPlayLogMessage(payload: Payload, guild: Guild): string {
    throw new Error('Method not implemented!')
  }
}
