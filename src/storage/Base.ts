export default abstract class Storage {
  prefix = 'chikha_bot_'

  constructor(public name: string) {}

  abstract set(key: string, value: string): void
  abstract get(key: string): Promise<string | null>
}
