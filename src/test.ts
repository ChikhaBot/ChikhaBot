import textToSpeech from '@google-cloud/text-to-speech'
import fs from 'fs'
import util from 'util'
import env from './env'
const client = new textToSpeech.TextToSpeechClient()

const main = async () => {
  const { BOT_ID } = env
  const text = 'hello ezbi'
  const request = {
    input: { text: text },
    // Select the language and SSML Voice
    // Voice selection is language-specific. Some voices do not support
    // some languages, so consider using a voice that best matches
    // the language of the text.
    voice: { languageCode: 'en-US', ssmlGender: 'FEMALE' as const },
    audioConfig: { audioEncoding: 'MP3' as const },
  }

  const [response] = await client.synthesizeSpeech(request)
  // Write the binary audio content to a local file

  const writeFile = util.promisify(fs.writeFile)
  await writeFile('output.mp3', response.audioContent as Uint8Array, 'binary')
  console.log('Audio content written to file: output.mp3')
}

main().catch(console.error)
