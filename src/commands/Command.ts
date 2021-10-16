import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'

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

export abstract class Command implements ICommand {
  name: string
  description: string
  options?: Option[]

  constructor(name: string, description: string, options?: Option[]) {
    this.name = name
    this.description = description
    this.options = options
  }

  abstract execute(interaction: CommandInteraction, ...args: unknown[]): Promise<void>

  toJson() {
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
          default:
            console.warn('Only string options are supported')
            break
        }
      })
    }

    return command.toJSON()
  }
}
