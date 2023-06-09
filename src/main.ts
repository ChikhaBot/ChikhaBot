import env from './env'
import Discord, { ButtonInteraction, GatewayIntentBits, Interaction, Snowflake, Team } from 'discord.js'
import { generateDependencyReport } from '@discordjs/voice'
import { MusicSubscription } from './music/Subscription'

import { BaseCommand } from './commands/BaseCommand'

import { BaseProvider } from './music/providers/Provider'
import { YoutubeProvider } from './music/providers/Youtube.provider'
import { SpotifyProvider } from './music/providers/Spotify.provider'

import BaseListener from './listeners/message/BaseListener'

import Queue from './music/Queue'
import path from 'path'
import glob from 'glob'
import VoiceBaseListener from './listeners/voice/VoiceBaseListener'

export class Main {
  private static _client: Discord.Client
  static _commands: Record<string, BaseCommand> = {}
  private static _providers: Map<string, BaseProvider> = new Map()
  private static _votekick: Map<
    Snowflake,
    {
      userId: Snowflake
      yes: Snowflake[]
      no: Snowflake[]
    }[]
  > = new Map()

  // Maps guild IDs to music subscriptions,
  // which exist if the bot has an active VoiceConnection to the guild.
  private static _subscriptions = new Map<Snowflake, MusicSubscription>()

  static prefix = '!'
  static keyword = 'chikha'

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

  static async commands() {
    const promises: Promise<BaseCommand>[] = []

    const commandFiles = glob
      .sync(path.join(__dirname, 'commands/**/*'))
      .filter(
        (file) =>
          !file.toLowerCase().includes('base') &&
          (file.toLowerCase().endsWith('.ts') || file.toLowerCase().endsWith('.js')),
      )

    for (const file of commandFiles) {
      const filePath = file.split('commands/')[1]
      promises.push(
        import(`./commands/${filePath}`).then((module) => {
          return new module.default(this)
        }),
      )
    }

    return Promise.all(promises)
  }

  static async listeners(type: 'message' | 'voice'): Promise<(BaseListener | VoiceBaseListener)[]> {
    const promises: Promise<BaseListener>[] = []

    const listenerFiles = glob
      .sync(path.join(__dirname, `listeners/${type}/**/*`))
      .filter(
        (file) =>
          !file.toLowerCase().includes('base') &&
          (file.toLowerCase().endsWith('.ts') || file.toLowerCase().endsWith('.js')),
      )

    for (const file of listenerFiles) {
      const filePath = file.split(`listeners/${type}/`)[1]
      promises.push(
        import(`./listeners/${type}/${filePath}`).then((module) => {
          return new module.default()
        }),
      )
    }

    return Promise.all(promises)
  }

  static async registerCommands() {
    const commands = await this.commands()
    for (const command of commands) {
      this._commands[command.name] = command
    }

    console.log(`> Registered ${commands.length} commands. Type ${Main.prefix}chikha to deploy them on the server.`)

    this._client.on('messageCreate', async (message) => {
      if (!message.guild) return
      if (!this._client.application?.owner) await this._client.application?.fetch()

      const owners = this._client.application?.owner as Team

      if (
        message.content.toLowerCase() === `${Main.prefix}${Main.keyword}` &&
        owners.members.findKey((user) => user.id == message.author.id)
      ) {
        await message.guild.commands.set(commands.map((command) => command.toJson()))
        await message.reply('Commands deployed!')
      }
    })

    await this.registerInteractionListeners()
  }

  static registerProviders(providers: BaseProvider[]): void {
    for (const provider of providers) {
      this._providers.set(provider.name, provider)
    }

    console.log(`> Registered ${providers.length} music providers.`)
  }

  static async registerMessageListeners() {
    const listeners = await this.listeners('message')
    for (const listener of listeners) {
      this._client.on('messageCreate', (arg) => (listener as BaseListener).process(arg))
    }

    console.log(`> Registered ${listeners.length} message listener.`)
  }

  static async registerVoiceListeners() {
    const listeners = await this.listeners('voice')
    for (const listener of listeners) {
      this._client.on('voiceStateUpdate', (oldState, newState) =>
        (listener as VoiceBaseListener).process(newState, oldState),
      )
    }
    console.log(`> Registered ${listeners.length} voice channel listener.`)
  }

  static async handleButtonInteraction(interaction: ButtonInteraction) {
    try {
      if (!interaction.guildId) return

      console.log(`> Received button interaction: ${interaction.customId}`)

      const voteThreshold = parseInt(env.VOTE_THRESHOLD ?? '3')
      const guildId = interaction.guildId

      const idParams = interaction.customId.split('-')
      const userId = idParams[1]
      const existingVotes = Main.votekick.get(guildId) ?? []
      const currentVote = existingVotes.find((vote) => vote.userId === userId) ?? {
        userId,
        yes: [],
        no: [],
      }
      const hasVoted = currentVote.yes.includes(interaction.user.id) || currentVote.no.includes(interaction.user.id)

      if (hasVoted) {
        return interaction.reply(`You have already voted! sir t7wa <@${interaction.user.id}>`)
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

      await interaction.reply(`<@${interaction.user.id}> voted: ${idParams[0]}`)

      const newVotes = [...existingVotes.filter((vote) => vote.userId !== userId), currentVote]

      Main.votekick.set(guildId, newVotes)

      // Update original message
      const originalMessageId = interaction.message.id
      const originalMessage = await interaction.channel?.messages.fetch(originalMessageId)

      if (originalMessage) {
        // Update message text
        const text = `Votiw njriw 3la zamel boh <@${userId}> (yes: ${currentVote.yes.length} , no: ${currentVote.no.length})`
        await originalMessage.edit(text)
      }

      if (currentVote.yes.length >= voteThreshold && currentVote.yes.length > currentVote.no.length) {
        const member = await interaction.guild?.members.cache.get(userId)
        if (member) {
          console.log('Kicking member')
          // await member.voice.disconnect('Kicked by votekick ! Sir dreb dwira.')
          await member.timeout(1 * 1000, 'Kicked by votekick ! Sir dreb dwira.')
          await interaction.reply(`- Votekick passed <@${userId}>! Khroj t9wd`)
        } else {
          return interaction.reply(`- Votekick passed <@${userId}>! Walakine 3ele9 weld l97ba`)
        }
      }

      if (currentVote.no.length >= voteThreshold && currentVote.no.length > currentVote.yes.length) {
        await interaction.reply(`- Votekick failed <@${userId}>! GG WP`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  static registerInteractionListeners(): void {
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

  static async start(): Promise<void> {
    this._client = new Discord.Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildBans,
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

    await this.registerCommands()
    await this.registerMessageListeners()
    await this.registerVoiceListeners()

    this._client.on('error', console.error)
    this._client.login(env.BOT_TOKEN)
  }

  static async stop(): Promise<void> {
    await this._client.destroy()
  }
}

if (env.ENABLED) {
  Queue.init()
  Main.start()
} else {
  console.log('> Bot is disabled.')
}
