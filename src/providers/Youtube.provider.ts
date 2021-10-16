import ytdl from 'ytdl-core'
import ytpl from 'ytpl'
import { Track } from '../music/Track'
import { YoutubeTrack } from '../music/YoutubeTrack'
import { Provider } from './Provider'
export class YoutubeProvider implements Provider {
  name = 'youtube'

  async handle(url: string, methods: Pick<Track, 'onStart' | 'onFinish' | 'onError'>) {
    const isPlaylist = /^.*(youtu.be\/|list=)([^#&?]*).*/gi.test(url)

    if (isPlaylist) {
      // Get playlist ID
      const playlistId = url.split('list=')[1].split('&index=')[0]

      if (!playlistId) {
        throw new Error(`Invalid playlist URL`)
      }

      // Get playlist info
      const playlistInfo = await ytpl(playlistId)

      // Get playlist tracks
      const tracks = await Promise.all(playlistInfo.items.map(async (item) => YoutubeTrack.from(item.url, methods)))

      return tracks
    }

    if (!ytdl.validateURL(url)) {
      throw new Error(`Invalid ${this.name} URL`)
    }

    return [await YoutubeTrack.from(url, methods)]
  }

  canPlay(message: string): boolean {
    // Match youtube videos and playlists
    if (message.match(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=)?(v\/)?\S+/)) {
      return true
    }

    return false
  }
}
