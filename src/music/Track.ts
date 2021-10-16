import { AudioResource } from '@discordjs/voice'
import { TrackData } from './TrackData'

export abstract class Track implements TrackData {
  public readonly url: string
  public readonly title: string
  public readonly onStart: () => void
  public readonly onFinish: () => void
  public readonly onError: (error: Error) => void

  constructor({ url, title, onStart, onFinish, onError }: TrackData) {
    this.url = url
    this.title = title
    this.onStart = onStart
    this.onFinish = onFinish
    this.onError = onError
  }

  /**
   * Creates an AudioResource from this Track.
   */
  public abstract createAudioResource(): Promise<AudioResource<Track>>
}
