import { Streamable } from './providers/Streamable'

export class Queue {
  private static _streams: Streamable[] = []

  public static clear() {
    Queue._streams = []
  }

  public static add(streamable: Streamable) {
    Queue._streams.push(streamable)
  }

  public static remove(streamable: Streamable) {
    Queue._streams = Queue._streams.filter((s) => s.url !== streamable.url)
  }

  public static get size(): number {
    return Queue._streams.length
  }

  public static get next(): Streamable {
    const last = Queue._streams[Queue.length]
    Queue._streams = Queue._streams.slice(0, Queue.length - 1)
    return last
  }
}
