import { bool, cleanEnv, str } from 'envalid'
import dotenv from 'dotenv'

dotenv.config()

const env = cleanEnv(process.env, {
  BOT_TOKEN: str(),
  DEBUG: bool({ default: false }),
})

export default env
