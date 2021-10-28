import env from './env'
import Discord, { ButtonInteraction, Intents, Interaction, Message, Snowflake } from 'discord.js'
import { generateDependencyReport } from '@discordjs/voice'
import { MusicSubscription } from './music/Subscription'

import { Command } from './commands/Command'
import { PlayCommand } from './commands/PlayCommand'
import { PauseCommand } from './commands/PauseCommand'
import { SkipCommand } from './commands/SkipCommand'
import { QueueCommand } from './commands/QueueCommand'
import { LeaveCommand } from './commands/LeaveCommand'
import { ResumeCommand } from './commands/ResumeCommand'

import { Provider } from './music/providers/Provider'
import { YoutubeProvider } from './music/providers/Youtube.provider'
import { SpotifyProvider } from './music/providers/Spotify.provider'

import BaseListener from './listeners/message/BaseListener'
import ChkonListener from './listeners/message/ChkonListener'
import DkholListener from './listeners/message/DkholListener'
import PingListener from './listeners/message/PingListener'

import { VotekickCommand } from './commands/VoteKickCommand'
import Queue from './music/Queue'
import VoiceBaseListener from './listeners/voice/VoiceBaseListener'
import M9edemListener from './listeners/voice/M9edemListener'
import ChikhaListener from './listeners/message/ChikhaListener'

export class Main {
  private static _client: Discord.Client
  private static _commands: Record<string, Command> = {}
  private static _listeners: BaseListener[] = []
  private static _providers: Map<string, Provider> = new Map()
  private static _votekick: Map<
    Snowflake,
    {
      userId: Snowflake
      yes: Snowflake[]
      no: Snowflake[]
    }[]
  > = new Map()

  private static features: Record<string, boolean> = {}

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

  static get votekick() {
    return this._votekick
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

  static registerMessageListeners(listeners: BaseListener[]) {
    for (const listener of listeners) {
      this._client.on('messageCreate', (arg) => listener.process(arg))
    }

    console.log(`> Registered ${listeners.length} message listener.`)
  }

  static registerVoiceListeners(listeners: VoiceBaseListener[]) {
    for (const listener of listeners) {
      this._client.on('voiceStateUpdate', (oldState, newState) => listener.process(newState, oldState))
    }
    console.log(`> Registered ${listeners.length} voice channel listener.`)
  }

  static async start(): Promise<void> {
    this._client = new Discord.Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES, // Can speak
        Intents.FLAGS.GUILD_BANS,
      ],
    })

    this._client.on('ready', (client) => {
      const botTag = client.user?.tag

      console.log(`=======================================`)
      console.log(`Ready! Logged in as ${botTag}`)
      console.log(`=======================================`)
      console.log(`Features:`)

      Main.features.TTS = env.TTS

      for (const feature in Main.features) {
        console.log(`> ${feature}: ${Main.features[feature]}`)
      }

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
      new VotekickCommand(),
    ])

    this.registerMessageListeners([new PingListener(), new ChkonListener(), new DkholListener(), new ChikhaListener()])
    this.registerVoiceListeners([new M9edemListener()])

    this.listenForInteractions()

    this._client.on('error', console.error)
    this._client.login(env.BOT_TOKEN)
  }

  static async stop(): Promise<void> {
    await this._client.destroy()
  }

  static async handleButtonInteraction(interaction: ButtonInteraction) {
    try {
      if (!interaction.guildId) return
      const guildId = interaction.guildId
      const idParams = interaction.customId.split('-')
      const userId = idParams[1]
      const existingVotes = Main.votekick.get(guildId) ?? []
      const currentVote = existingVotes.find((vote) => vote.userId === userId) ?? {
        userId: userId,
        yes: [],
        no: [],
      }

      console.log(`> Received interaction for ${userId} in ${guildId}`)
      const respond = async (text: string) => {
        await interaction.reply(text)
      }
      const hasVoted = currentVote.yes.includes(interaction.user.id) || currentVote.no.includes(interaction.user.id)

      if (hasVoted) {
        await respond('You have already voted! sir t7wa')
        return
      }

      switch (idParams[0]) {
        case 'yes':
          currentVote.yes.push(interaction.user.id)
          break
        case 'no':
          currentVote.no.push(interaction.user.id)
          break
        default:
          break
      }

      const newVotes = existingVotes.filter((vote) => vote.userId !== userId)
      newVotes.push(currentVote)
      Main.votekick.set(guildId, newVotes)

      await respond(`- Votekick results <@${userId}>: ${currentVote.yes.length} / ${currentVote.no.length}`)

      if (currentVote.yes.length >= 2 && currentVote.yes.length > currentVote.no.length) {
        const member = await interaction.guild?.members.cache.get(userId)
        if (member) {
          await member.voice.disconnect('Kicked by votekick ! Sir dreb dwira.')
          await (interaction.message as Message).delete()
        } else {
          await interaction.editReply(`- Votekick passed <@${userId}>! Walakine 3ele9 weld l97ba`)
          return
        }
        await interaction.editReply(`- Votekick passed <@${userId}>! Khroj t9wd`)
      }

      if (currentVote.no.length >= 2 && currentVote.no.length > currentVote.yes.length) {
        await respond(`- Votekick failed <@${userId}>! GG WP`)
        await (interaction.message as Message).delete()
      }
    } catch (err) {
      console.error(err)
    }
  }

  static listenForInteractions(): void {
    this._client.on('interactionCreate', async (interaction: Interaction) => {
      if (interaction.isButton()) {
        await Main.handleButtonInteraction(interaction)
      }
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

if (env.ENABLED) {
  Queue.init()
  Main.start()
} else {
  console.log('> Bot is disabled.')
}
