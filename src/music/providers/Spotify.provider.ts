import { Track } from '../Track'
import { YoutubeTrack } from '../YoutubeTrack'
import { BaseProvider } from './Provider'
import spotify from 'spotify-url-info'
import { yts } from '../../utils/yts'

export class SpotifyProvider implements BaseProvider {
  name = 'spotify'

  async handle(url: string, methods: Pick<Track, 'onStart' | 'onFinish' | 'onError'>): Promise<Track[]> {
    // TODO
    const isPlaylist = url.includes('playlist')

    if (isPlaylist) {
      const playlistData = await spotify.getData(url)
      const tracks = playlistData?.tracks?.items
      const youtubeTracks: Track[] = []

      if (!tracks) throw new Error('tplantit a kha hamid')

      await Promise.allSettled(
        tracks.map(async (t: any) => {
          //
          const artist = t?.track?.artists?.map((a: any) => a.name)?.join(', ')
          const trackName = t?.track?.name
          if (!artist || !trackName) return

          const s = `${artist} - ${trackName} lyrics`

          const results = await yts(s)

          if (results.videos.length === 0) {
            return
          }

          youtubeTracks.push(await YoutubeTrack.from(results.videos[0].url, methods))
        }),
      )

      return youtubeTracks
    }

    const songInfo = await spotify.getPreview(url)
    const results = await yts(`${songInfo.artist} - ${songInfo.title} lyrics`)

    if (results.videos.length === 0) {
      throw new Error(`Can't find song, blame spotify's API.`)
    }

    const track = await YoutubeTrack.from(results.videos[0].url, methods)
    return [track]
  }

  canPlay(message: string): boolean {
    if (message.match(/(?:https:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist)[/:]([A-Za-z0-9]+)/)) {
      return true
    }

    return false
  }
}
