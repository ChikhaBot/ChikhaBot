import _yts from 'yt-search'

export const yts = (query: string | _yts.Options): Promise<_yts.SearchResult> => {
  return new Promise((resolve, reject) => {
    _yts(query, (err, res) => {
      if (err) reject(err)
      resolve(res)
    })
  })
}
