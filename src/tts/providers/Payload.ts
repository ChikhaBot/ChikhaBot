import { Readable } from 'stream'

export default class Payload {
  constructor(
    public resource: string | Readable,
    public sentence: string,
    public providerName: string,
    public extras: Record<string, any> = {},
  ) {}
}
