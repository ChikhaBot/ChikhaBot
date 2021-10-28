import { Track } from '../Track'

export interface Provider {
  name: string
  canPlay: (message: string) => boolean
  handle: (url: string, methods: Pick<Track, 'onStart' | 'onFinish' | 'onError'>) => Promise<Track[]>
}
