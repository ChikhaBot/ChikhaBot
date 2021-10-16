import { bool, cleanEnv, str } from 'envalid'
import dotenv from 'dotenv'

dotenv.config()

const env = cleanEnv(process.env, {
  BOT_TOKEN: str(),
  BOT_OWNER_ID: str(),
  BOT_ID: str(),
  DEBUG: bool({ default: false }),
  REDIS_HOST: str({ default: 'localhost' }),
  REDIS_PORT: str({ default: '6379' }),
  REDIS_PASSWORD: str({ default: '' }),
})

export default env
