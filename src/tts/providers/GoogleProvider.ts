import AbstractProvider from './AbstractProvider'
import Payload from './Payload'
import { getAllAudioUrls } from 'google-tts-api'
import { Guild } from 'discord.js'

/**
 * A concrete TTS provider for the Google Translate API TTS.
 */
export default class GoogleProvider extends AbstractProvider {
  public lang: string
  public slow: boolean

  constructor() {
    super()
    this.lang = 'ar'
    this.slow = false
  }

  createPayload(sentence: string): Promise<Payload[]> {
    return new Promise((resolve, reject) => {
      try {
        const data = getAllAudioUrls(sentence, {
          lang: this.lang,
          slow: this.slow,
          splitPunct: ',.?!',
        })

        resolve(
          data.map(({ url, shortText }) => {
            return new Payload(url, shortText, GoogleProvider.name, {
              lang: this.lang,
              slow: this.slow,
            })
          }),
        )
      } catch (error) {
        reject(error)
      }
    })
  }

  getPlayLogMessage(payload: Payload, guild: Guild): string {
    const {
      sentence,
      extras: { lang, slow },
    } = payload
    const speed = slow ? 'slow' : 'normal'

    return `(TTS): Playing googleTTS for ${sentence} with language ${lang} with ${speed} speed in guild ${guild.name}.`
  }

  setSpeed(newSpeed: string) {
    if (newSpeed !== 'normal' && newSpeed !== 'slow') {
      throw new Error('Invalid speed!')
    }

    this.slow = newSpeed === 'slow'
    return newSpeed
  }
}
