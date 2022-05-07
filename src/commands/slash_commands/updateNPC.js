const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('update-npc')
    .setDescription('updates a NPC in the database')
    .addStringOption((option) =>
      option.setName('name').setDescription("The NPC's name.").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('key')
        .setDescription('The NPC property to update.')
        .setRequired(true)
        .addChoice('Home Channel', 'npc_homeChannel')
        .addChoice('Avatar URL', 'npc_avatarURL')
        .addChoice('Username', 'npc_username')
    )
    .addStringOption((option) =>
      option
        .setName('value')
        .setDescription('The new value for the `field` being updated.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const { client: bot, guild, user, options: opts } = interaction;
    if (bot.blacklist.has(homeChannel)) return; // Blacklsited channels aren't watched

    await interaction.deferReply({ ephemeral: true });

    const perms =
      interaction.memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR) ||
      bot?.application?.owner;

    if (!perms) {
      await bot.logger.warn(
        `${user.tag} tried to update a NPC without permission`
      );
      return interaction.editReply({
        content: 'You do not have permission to complete this action.',
        ephemeral: true,
      });
    }

    try {
      await bot.db.updateNPC(
        opts.getString('name'),
        opts.getString('key'),
        opts.getString('value')
      );
    } catch (error) {
      bot.logger.error(error.message);
      return interaction.editReply({
        content: 'Unable to update NPC.',
        ephemeral: true,
      });
    }
    return interaction.editReply({
      content: 'NPC updated succesfully.',
      ephemeral: true,
    });
  },
};
