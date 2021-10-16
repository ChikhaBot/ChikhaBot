import Storage from './Base'
import Redis, { RedisClient } from 'redis'
import { promisify } from 'util'
import env from '../env'

class RedisStorage extends Storage {
  client: RedisClient
  constructor() {
    super('RedisStorage')
    this.client = Redis.createClient({
      port: Number(env.REDIS_PORT),
      host: env.REDIS_HOST,
      password: env.REDIS_PASSWORD,
    })
  }
  set(key: string, value: string): void {
    this.client.set(`${this.prefix}${key}`, value)
  }

  get(key: string) {
    const getAsync = promisify(this.client.get).bind(this.client)
    return getAsync(`${this.prefix}${key}`)
  }
}

export default RedisStorage
