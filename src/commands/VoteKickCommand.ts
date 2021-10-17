import { CommandInteraction, MessageActionRow, MessageButton } from 'discord.js'
import { Main } from '../main'
import { Command } from './Command'
export class VotekickCommand extends Command {
  constructor() {
    super('votekick', 'Vote kick a user from the server', [
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

    const voteButtons = new MessageActionRow().addComponents(
      new MessageButton().setCustomId(`yes-${userId}`).setLabel('Jri 3lih').setStyle('SUCCESS'),
      new MessageButton().setCustomId(`no-${userId}`).setLabel('Laysameh').setStyle('SECONDARY'),
    )

    const existingVotes = Main.votekick.get(guildId) ?? []
    const currentVote = existingVotes.find((vote) => vote.userId === userId) ?? { userId: userId, yes: [], no: [] }
    const newVotes = existingVotes.filter((vote) => vote.userId !== userId)

    newVotes.push(currentVote)
    Main.votekick.set(guildId, newVotes)

    console.log(`Votekick: ${guildId} ${userId}`)

    await interaction.reply({
      content: `Votiw njriw 3la zamel boh <@${userId}> (yes: 0, no: 0)`,
      components: [voteButtons],
    })
    return
  }
}
