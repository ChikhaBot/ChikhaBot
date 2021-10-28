import { Stream } from 'stream'

export default class Payload {
  constructor(
    public resource: string | Stream,
    public sentence: string,
    public providerName: string,
    public extras: Record<string, any> = {},
  ) {}
}
