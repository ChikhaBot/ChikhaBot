import Storage from '../storage/Base'
import RedisStorage from '../storage/Redis'
import { Track } from './Track'
import { YoutubeTrack } from './YoutubeTrack'

// TODO: move from singelton to class linked to subscription (to support multiple queues)
export default class Queue {
  public static queue: Track[]
  public static current: Track | null
  public static storage: Storage

  private constructor() {
    //
  }

  public static async init() {
    //
    Queue.storage = new RedisStorage()
    Queue.queue = []
    const oldQueue = await Queue.storage.get('queue')

    if (oldQueue) {
      try {
        const tracksUrls = JSON.parse(oldQueue).map((t: { url: string; title: string }) => t.url)
        const tracks = await Promise.all<Track>(tracksUrls.map(async (url: string) => YoutubeTrack.from(url)))
        Queue.queue = tracks
      } catch (error) {
        Queue.queue = []
        console.warn('Failed to parse queue from storage')
      }
    }

    Queue.current = null
  }

  public static queueChanged(): void {
    Queue.persist()
  }

  public static persist(): void {
    Queue.storage.set('queue', JSON.stringify(Queue.queue))
  }

  public static add(track: Track): void {
    Queue.queue.push(track)
    Queue.queueChanged()
  }

  public static remove(track: Track): void {
    Queue.queue = Queue.queue.filter((t) => t.url !== track.url)
    Queue.queueChanged()
  }

  public static clear(): void {
    Queue.queue = []
    Queue.queueChanged()
  }

  public static next(): Track | null {
    if (Queue.queue.length === 0) {
      return null
    }

    Queue.current = Queue.queue.shift() ?? null
    Queue.queueChanged()

    return Queue.current
  }

  public static skip(to: number): void {
    if (to < 0) {
      to = 0
    } else if (to > Queue.queue.length) {
      to = Queue.queue.length
    }

    Queue.queue = Queue.queue.slice(to)
    Queue.queueChanged()
  }

  public static isEmpty(): boolean {
    return Queue.queue.length === 0
  }
}
