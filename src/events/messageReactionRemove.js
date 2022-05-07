const { MessageReaction, User, Permissions } = require('discord.js');
const { MANAGE_MESSAGES } = Permissions.FLAGS;

module.exports = {
  name: 'messageReactionRemove',
  /**
   * Event triggered when reacting
   * @param {MessageReaction} reaction
   * @param {User} user
   * @returns {Promise<void>}
   */
  async execute(reaction, user) {
    if (user.bot) return;
    const { emoji, message, client } = reaction;
    const { channel } = message;
    const { reactEmojis } = client.config;
    const { log, warn } = client.logger;
    const permissions = channel.permissionsFor(user.id);

    switch (emoji.name) {
      case reactEmojis.pin:
        if (permissions.has(MANAGE_MESSAGES)) {
          if (message.pinned) {
            await message.unpin();
            log(`${user.tag} unpinned a message in ${message.channel.name}`);
          }
          return;
        }
        warn(
          `${user.tag} tried to unpin a message in ${message.channel.name} without permissions.`
        );
      default:
        return;
    }
  },
};
