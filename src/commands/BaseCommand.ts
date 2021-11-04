import { SlashCommandBuilder } from '@discordjs/builders'
import { ApplicationCommandDataResolvable, CommandInteraction } from 'discord.js'
import { Main } from '../main'

export interface Option {
  name: string
  description: string
  type: string
  required?: boolean
}

export interface ICommand {
  name: string
  description: string
  options?: Option[]
  execute(interaction: CommandInteraction): Promise<void>
}

export abstract class BaseCommand implements ICommand {
  name: string
  description: string
  options?: Option[]
  client: Main
  author?: {
    id: string
    avatarURL?: string
  }

  constructor(client: Main, name: string, description: string, options?: Option[]) {
    this.name = name
    this.description = description
    this.options = options
    this.client = client
  }

  abstract execute(interaction: CommandInteraction, ...args: unknown[]): Promise<void>

  toJson(): ApplicationCommandDataResolvable {
    const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description)

    if (this.options) {
      this.options.forEach((opt) => {
        switch (opt.type) {
          case 'STRING':
            command.addStringOption((option) =>
              option
                .setName(opt.name)
                .setDescription(opt.description)
                .setRequired(opt?.required ?? false),
            )
            break
          case 'USER':
            command.addUserOption((option) =>
              option
                .setName(opt.name)
                .setDescription(opt.description)
                .setRequired(opt?.required ?? false),
            )
            break
          default:
            console.warn('Only string options are supported')
            break
        }
      })
    }

    return command.toJSON() as unknown as ApplicationCommandDataResolvable
  }

  toString(): string {
    const base = `${this.description}`
    const options = this.options
      ?.map((opt) => `  - *${opt.name}*: ${opt.description} (${opt.required ? 'required' : 'optional'})`)
      .join('\n')

    return options ? `${base}\n${options}` : base
  }
}
