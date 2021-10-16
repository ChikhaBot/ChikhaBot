import Storage from './Base'

export default class MemoryStorage extends Storage {
  private _data: Record<string, string> = {}
  constructor() {
    super('MemoryStorage')
  }
  set(key: string, value: string): void {
    this._data[`${this.prefix}${key}`] = value
  }

  get(key: string) {
    return Promise.resolve(this._data?.[`${this.prefix}${key}`] ?? null)
  }
}
