import AbstractProvider from './AbstractProvider'
import Payload from './Payload'
import googleTTS from 'google-tts-api'
import { Guild } from 'discord.js'
import fs from 'fs'
import path from 'path'

export const languages = JSON.parse(fs.readFileSync(path.join(__dirname, '../../languages.json'), 'utf8'))

/**
 * A concrete TTS provider for the Google Translate API TTS.
 */
export default class GoogleProvider extends AbstractProvider {
  public lang: string
  public slow: boolean
  public name = 'google'

  constructor() {
    super()
    this.lang = 'en'
    this.slow = false
  }

  createPayload(sentence: string): Promise<Payload[]> {
    return new Promise((resolve, reject) => {
      try {
        const data = googleTTS.getAllAudioUrls(sentence, {
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

  setLang(newLang: string) {
    if (!languages[newLang]) {
      throw new Error('Invalid language!')
    }

    if (this.lang === newLang) {
      throw new Error(`Language is already set to ${newLang}!`)
    }

    this.lang = newLang
    return languages[this.lang].name
  }

  getLang() {
    return languages[this.lang].name
  }

  setSpeed(newSpeed: string) {
    if (newSpeed !== 'normal' && newSpeed !== 'slow') {
      throw new Error('Invalid speed!')
    }

    this.slow = newSpeed === 'slow'
    return newSpeed
  }
}
