import { Track } from '../Track'

export interface BaseProvider {
  name: string
  canPlay: (message: string) => boolean
  handle: (url: string, methods: Pick<Track, 'onStart' | 'onFinish' | 'onError'>) => Promise<Track[]>
}
