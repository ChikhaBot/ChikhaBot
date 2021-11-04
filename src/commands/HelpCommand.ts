import { CommandInteraction, MessageEmbed } from 'discord.js'
import { Main } from '../main'
import { BaseCommand } from './BaseCommand'

export default class HelpCommand extends BaseCommand {
  constructor(client: Main) {
    super(client, 'help', 'List all available commands', [])

    this.author = {
      id: 'Stormix#2779',
    }
  }

  async execute(interaction: CommandInteraction): Promise<void> {
    const commands = Object.keys(Main._commands)
    const embed = new MessageEmbed()
      .setTitle('Available commands')
      .setDescription(
        `Here's a list of all available commands and their respective options. Make sure you click \`tab\` when running the commands to set an option value. `,
      )
      .addFields(
        ...commands.map((command) => {
          const cmd = Main._commands[command]
          return {
            name: `*${cmd.name}*`,
            value: cmd.toString() || 'No description',
          }
        }),
      )
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }
}
