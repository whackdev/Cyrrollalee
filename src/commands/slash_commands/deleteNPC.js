const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete-npc')
    .setDescription('deletes a NPC from the database')
    .addStringOption((option) =>
      option.setName('name').setDescription("The NPC's name.").setRequired(true)
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
        `${user.tag} tried to delete an NPC without permission`
      );
      return interaction.editReply({
        content: 'You do not have permission to complete this action.',
        ephemeral: true,
      });
    }
    try {
      await bot.db.deleteNPC(opts.getString('name'));
    } catch (error) {
      bot.logger.error(error.message);
      return interaction.editReply({
        content: 'Unable to delete NPC.',
        ephemeral: true,
      });
    }
    return interaction.editReply({
      content: 'NPC deleted succesfully.',
      ephemeral: true,
    });
  },
};
