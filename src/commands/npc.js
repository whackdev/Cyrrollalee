const { Message, Permissions } = require('discord.js');
const {
  SEND_MESSAGES,
  SEND_MESSAGES_IN_THREADS,
  EMBED_LINKS,
  MANAGE_MESSAGES,
  READ_MESSAGE_HISTORY,
} = Permissions.FLAGS;
const { prefix, webhookID } = require('../config/config.json');

module.exports = {
  data: {
    name: 'npc',
    usage: [
      'Used to interact as a server NPC.',
      `Used to interact as a server NPC. \`\`\`${prefix}npc <npc_name> <text>\`\`\``,
    ],
    enabled: true,
    aliases: ['say', 'use'],
    category: 'NPC',
    memberPermissions: [SEND_MESSAGES, READ_MESSAGE_HISTORY],
    botPermissions: [
      SEND_MESSAGES,
      EMBED_LINKS,
      MANAGE_MESSAGES,
      READ_MESSAGE_HISTORY,
    ],
    //Settings for command
    nsfw: false,
    ownerOnly: false,
    cooldown: 0,
  },
  /**
   * This command uses a `webhook` to speak as an `NPC` in a various channel.
   * @param {Message} message the message that evoked the command
   * @param {Array<String>} args space separated messsage content
   */
  async execute(message, args) {
    const {
      channelId,
      content: originalContent,
      client: bot,
      author: originalAuthor,
      guildId,
      channel,
    } = message;

    const { adminRole, webhookID, dungeonMasterRole } = bot.config;
    const npcName = args.shift().toLowerCase();
    const speechText = args.join(' ');
    try {
      const npc = await bot.db.fetchNPC((id = npcName), (guildID = guildId));
      if (!npc) {
        throw new Error(
          `Sorry I am unable to find the requested NPC,${npcName}, please try again or reach out to a <@&${adminRole}>.`
        );
      }
      const webhook = await bot.fetchWebhook(webhookID);

      if (!webhook) {
        throw new Error('No webhook was found that I can use!');
      }
      if (channelId !== npc.homeChannel) {
        const hasElevatedPermissions = bot.guilds.cache
          .get(npc.guildID)
          ?.roles.cache.some(
            (role) => role.id === adminRole || role.id === dungeonMasterRole
          );

        if (!hasElevatedPermissions) {
          throw new Error(
            `Sorry, ${npc.username} cannot be used here. Try interacting with them in <#${npc.homeChannel}>.`
          );
        }
        await webhook.edit({ channel: channelId });
      }

      await webhook
        .send({
          content: speechText,
          username: `${npc.username} [NPC]`,
          avatarURL: npc.avatarURL,
        })
        .then((m) => {
          bot.recent[m.id + originalAuthor.id] = message;
        })
        .catch((e) => bot.logger.error(e));
      await message.delete();
    } catch (error) {
      bot.logger.error('Error trying to send. \nError: ', error);
      return message.reply({
        content: error.message,
        allowedMentions: { repliedUser: true, roles: false },
      });
    }
  },
};
