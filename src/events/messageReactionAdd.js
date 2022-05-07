const { MessageReaction, User, Permissions } = require('discord.js');
const { MANAGE_MESSAGES } = Permissions.FLAGS;

module.exports = {
  name: 'messageReactionAdd',
  /**
   * Event triggered when reacting
   * @param {MessageReaction} reaction
   * @param {User} user
   * @returns {Promise<void>}
   */
  async execute(reaction, user) {
    if (user.bot) return;

    const { emoji, message, client: bot } = reaction;

    const { channel, webhookId } = message;
    const { log, warn } = bot.logger;
    const { reactEmojis } = bot.config;
    const permissions = channel.permissionsFor(user.id);

    switch (emoji.name) {
      case reactEmojis.pin:
        if (permissions.has(MANAGE_MESSAGES)) {
          if (message.pinnable) {
            await message.pin();
            log(`${user.tag} pinned a message in ${channel.name}`);
            await channel.lastMessage.delete();
            return;
          }
        } else {
          warn(
            `${user.tag} tried to pin a message in ${channel.name} without permissions`
          );
          return;
        }
      case reactEmojis.delete:
        if (!message.webhookId) return;
        const messageToDelete = bot.recent[message.id + user.id];
        if (
          !messageToDelete ||
          !permissions.has(MANAGE_MESSAGES) ||
          messageToDelete?.author?.id !== user.id
        ) {
          warn(
            `${user.tag} tried to deleting a message in ${channel.name} without permissions`
          );
          return;
        }
        await message.delete();
        delete bot.recent[message.id + user.id];
        log(`${user.tag} deleted a message in ${channel.name}`);
        return;
      case reactEmojis.edit:
        if (!message.webhookId) return;
        const messageToEdit = bot.recent[message.id + user.id];
        if (
          !messageToEdit ||
          !permissions.has(MANAGE_MESSAGES) ||
          messageToEdit?.author?.id !== user.id
        ) {
          warn(
            `${user.tag} tried editing a message in ${channel.name} without permissions`
          );
          return;
        }
        try {
          const webhook = await bot.fetchWebhook(webhookId);
          if (!webhook) {
            throw new Error('No webhook found to edit message');
          }

          const needInputMessage = await channel.send({
            content: 'Please repond with the new content.',
          });
          const filter = (m) => m.author.id == user.id;

          channel
            .awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
            .then((messages) => {
              webhook.editMessage(message.id, {
                content: messages.first().cleanContent,
              });
              message.reactions.removeAll();
              needInputMessage.delete();
              messages.first().delete();
            })
            .catch(() => {
              channel.send('You did not enter any input!');
            });
          log(`${user.tag} edited a message in ${channel.name}`);
        } catch (err) {
          bot.err(err);
        }
        return;
      default:
        return;
    }
  },
};
