import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction } from 'discord.js'
import { Main } from '../main'
import { BaseCommand } from './BaseCommand'

export default class VotekickCommand extends BaseCommand {
  constructor(client: Main) {
    super(client, 'votekick', 'Vote kick a user from the server', [
      {
        name: 'user',
        description: 'The user to vote kick',
        type: 'USER',
        required: true,
      },
    ])
  }
  async execute(interaction: CommandInteraction): Promise<void> {
    const guildId = interaction.guildId as string
    const userId = interaction.options.get('user')?.value as string

    const voteButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`yes-${userId}`).setLabel('Jri 3lih').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`no-${userId}`).setLabel('Laysameh').setStyle(ButtonStyle.Danger),
    )

    const existingVotes = Main.votekick.get(guildId) ?? []
    const currentVote = existingVotes.find((vote) => vote.userId === userId) ?? { userId: userId, yes: [], no: [] }
    const newVotes = existingVotes.filter((vote) => vote.userId !== userId)

    newVotes.push(currentVote)
    Main.votekick.set(guildId, newVotes)

    console.log(`Votekick: ${guildId} ${userId}`)

    await interaction.reply({
      content: `Votiw njriw 3la zamel boh <@${userId}> (yes: 0, no: 0)`,
      components: [voteButtons as any],
    })
    return
  }
}
