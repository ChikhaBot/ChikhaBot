/**
 * This is the data required to create a Track object
 */

export interface TrackData {
  url: string
  title: string
  onStart: (track: string | null) => void
  onFinish: (track: string | null) => void
  onError: (error: Error) => void
}
