import { CommandInteraction, MessageEmbed, Team } from 'discord.js'
import { Main } from '../main'
import { BaseCommand } from './BaseCommand'

export default class AboutCommand extends BaseCommand {
  constructor(client: Main) {
    super(client, 'about', 'About ChikhaBot.')
  }
  async execute(interaction: CommandInteraction): Promise<void> {
    if (!Main.Client.application?.owner) await Main.Client.application?.fetch()

    const owners = Main.Client.application?.owner as Team

    const about = new MessageEmbed()
      .setTitle('About ChikhaBot')
      .setDescription(
        'ChikhaBot is a discord bot created by the ChikhaBot Team for the sole purpose of annoying the rest of the server members and playing music. It does however provide a set of useful commands to manage your server and encourage member interactions.',
      )
      .addFields(
        {
          name: 'Version',
          value: '0.1',
          inline: true,
        },
        {
          name: 'Authors',
          value: `${owners.members.map((member) => member.user.tag).join(', ')}`,
          inline: true,
        },
        {
          name: 'GitHub',
          value: `
            [ChikhaBot](
              https://github.com/ChikhaBot/ChikhaBot
            )
          `,
          inline: true,
        },
        {
          name: 'Discord',
          value: `[Drari o bnat zwinin](
            https://discord.gg/RS6sx8Xq7m
          )`,
          inline: true,
        },
      )
      .setFooter('© [ChikhaBot Inc.](https://chikhabot.com) 2021', Main.Client.user?.displayAvatarURL())
    await interaction.reply({ embeds: [about] })
  }
}
