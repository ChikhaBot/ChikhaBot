import { CommandInteraction } from 'discord.js'
import { Main } from '../main'
import { BaseCommand } from './BaseCommand'

export default class AvatarCommand extends BaseCommand {
  constructor(client: Main) {
    super(client, 'avatar', 'Get user avatar', [
      {
        name: 'user',
        description: 'The user to put afk',
        type: 'USER',
        required: false,
      },
    ])
  }
  async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply()
  }
}
