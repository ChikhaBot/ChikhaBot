import env from './env'
import Discord, { Intents, Interaction, Snowflake } from 'discord.js'
import { generateDependencyReport } from '@discordjs/voice'
import { MusicSubscription } from './music/Subscription'

import { Command } from './commands/Command'
import { PlayCommand } from './commands/PlayCommand'
import { PauseCommand } from './commands/PauseCommand'
import { SkipCommand } from './commands/SkipCommand'
import { QueueCommand } from './commands/QueueCommand'
import { LeaveCommand } from './commands/LeaveCommand'
import { ResumeCommand } from './commands/ResumeCommand'

import { Provider } from './providers/Provider'
import { YoutubeProvider } from './providers/Youtube.provider'
import { SpotifyProvider } from './providers/Spotify.provider'

import BaseListener from './listeners/BaseListener'
import ChkonListener from './listeners/ChkonListener'
import DkholListener from './listeners/DkholListener'
import PingListener from './listeners/PingListener'

export class Main {
  private static _client: Discord.Client
  private static _commands: Record<string, Command> = {}
  private static _listeners: BaseListener[] = []
  private static _providers: Map<string, Provider> = new Map()

  // Maps guild IDs to music subscriptions, which exist if the bot has an active VoiceConnection to the guild.
  private static _subscriptions = new Map<Snowflake, MusicSubscription>()

  static prefix = '!'

  static get Client(): Discord.Client {
    return this._client
  }

  static get subscriptions() {
    return this._subscriptions
  }

  static get providers() {
    return this._providers
  }

  static registerCommands(commands: Command[]): void {
    for (const command of commands) {
      this._commands[command.name] = command
    }

    console.log(`> Registered ${commands.length} commands. Type ${Main.prefix}chikha to deploy them on the server.`)

    this._client.on('messageCreate', async (message) => {
      if (!message.guild) return
      if (!this._client.application?.owner) await this._client.application?.fetch()

      if (
        message.content.toLowerCase() === `${Main.prefix}chikha` &&
        message.author.id === this._client.application?.owner?.id
      ) {
        await message.guild.commands.set(commands.map((command) => command.toJson()) as any)
        await message.reply('Deployed!')
      }
    })
  }

  static registerProviders(providers: Provider[]): void {
    for (const provider of providers) {
      this._providers.set(provider.name, provider)
    }

    console.log(`> Registered ${providers.length} music providers.`)
  }

  static registerListeners(listeners: BaseListener[]) {
    for (const listener of listeners) {
      this._client.on('message', (arg) => listener.process(arg))
    }

    console.log(`> Registered ${listeners.length} message listener.`)
  }

  static async start(): Promise<void> {
    this._client = new Discord.Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES, // Can speak
      ],
    })

    this._client.on('ready', (client) => {
      const botTag = client.user?.tag

      console.log(`=======================================`)
      console.log(`Ready! Logged in as ${botTag}`)
      console.log(`=======================================`)

      if (env.DEBUG) {
        console.log('Dependacy report: ')
        console.log(generateDependencyReport())
      }
    })

    this.registerProviders([new YoutubeProvider(), new SpotifyProvider()])
    this.registerCommands([
      new PlayCommand(),
      new PauseCommand(),
      new ResumeCommand(),
      new QueueCommand(),
      new SkipCommand(),
      new LeaveCommand(),
    ])
    this.registerListeners([new PingListener(), new ChkonListener(), new DkholListener()])

    this.listenForInteractions()

    this._client.on('error', console.error)
    this._client.login(env.BOT_TOKEN)
  }

  static async stop(): Promise<void> {
    await this._client.destroy()
  }

  static listenForInteractions(): void {
    this._client.on('interactionCreate', async (interaction: Interaction) => {
      if (!interaction.isCommand() || !interaction.guildId) return
      const subscription = this._subscriptions.get(interaction.guildId)

      const command = this._commands?.[interaction.commandName]

      if (!command) {
        await interaction.reply('Unknown command')
      }

      try {
        await command.execute(interaction, subscription)
      } catch (error) {
        console.error(error)
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
      }
    })
  }
}

Main.start()
