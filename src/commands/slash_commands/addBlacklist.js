const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, CommandInteraction } = require('discord.js');
const fs = require('node:fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('adds an ID to the blacklist')
    .addStringOption((option) =>
      option
        .setName('id')
        .setDescription('The channel or user ID to ignore.')
        .setRequired(true)
    ),
  /**
   *
   * @param {CommandInteraction} interaction
   * @returns
   */
  async execute(interaction) {
    const { client: bot, channelId, user, options: opts } = interaction;
    if (bot.blacklist.has(channelId)) return; // Blacklsited channels aren't watched

    await interaction.deferReply({ ephemeral: true });

    const perms =
      interaction.memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR) ||
      bot?.application?.owner;

    if (!perms) {
      await bot.logger.warn(
        `${user.tag} tried to add an NPC without permission`
      );
      return interaction.editReply({
        content: 'You do not have permission to complete this action.',
        ephemeral: true,
      });
    }
    try {
      await bot.blacklist.add(opts.get('id'));
      await fs.writeFile(
        '../../config/blacklist.json',
        JSON.stringify(bot.blacklist)
      );
    } catch (error) {
      bot.logger.error(error.message);
      return interaction.editReply({
        content: 'Unable to blacklist this ID',
        ephemeral: true,
      });
    }
    return interaction.editReply({
      content: 'ID blacklisted succesfully.',
      ephemeral: true,
    });
  },
};
