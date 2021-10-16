// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {}
export const batchArray = <T>(arr: T[], size: number) => {
  const result = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}
