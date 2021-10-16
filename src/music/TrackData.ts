/**
 * This is the data required to create a Track object
 */

export interface TrackData {
  url: string
  title: string
  onStart: () => void
  onFinish: () => void
  onError: (error: Error) => void
}
