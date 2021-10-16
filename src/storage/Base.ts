export default abstract class Storage {
  prefix = 'bot_'

  constructor(public name: string) {}

  abstract set(key: string, value: string): void
  abstract get(key: string): Promise<string | null>
}
