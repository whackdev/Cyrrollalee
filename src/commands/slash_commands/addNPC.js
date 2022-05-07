const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, CommandInteraction } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-npc')
    .setDescription('adds an NPC to the database')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription("The NPC's name. (MUST BE UNIQUE).")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('avatar-url')
        .setDescription("The url for the NPC's avatar image.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('username')
        .setDescription(
          'The `displayName` for the NPC. Defaults to the NPC name.'
        )
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('home-channel')
        .setDescription(
          'The `discord id` for the channel the NPC lives in. Defaults to the channel the command executed in.'
        )
        .setRequired(false)
    ),
  /**
   *
   * @param {CommandInteraction} interaction
   * @returns
   */
  async execute(interaction) {
    const {
      client: bot,
      channelId: homeChannel,
      member,
      guild,
      user,
      options: opts,
    } = interaction;
    if (bot.blacklist.has(homeChannel)) return; // Blacklsited channels aren't watched

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
      const npcName = opts.getString('name');
      const username = opts.getString('username') || npcName;
      const newNPC = bot.db.addNPC(
        npcName,
        opts.getString('homeChannel') ?? homeChannel,
        opts.getString('avatarURL') ?? bot.config.defaultImage,
        bot.tools.titleCase(username.trim()),
        bot.config.guildID
      );
    } catch (error) {
      bot.logger.error(error.message);
      return interaction.editReply({
        content: 'Unable to save NPC.',
        ephemeral: true,
      });
    }
    return interaction.editReply({
      content: 'NPC saved succesfully.',
      ephemeral: true,
    });
  },
};
