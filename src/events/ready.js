const { Client } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  /**
   * Runs once when bot ready
   * @param {Client} bot
   */
  async execute(bot) {
    bot.user.setActivity('Lord of the Skies over Êlaelin', {
      type: 'PLAYING',
    });
    const configChannelID = bot.config.configChannel;
    const channel = bot.channels.cache.get(configChannelID);
    try {
      const webhooks = await bot.guilds.cache
        .get(channel.guildId)
        ?.fetchWebhooks();

      const webhook = webhooks.get(bot.config.webhookID);

      if (!webhook) {
        await channel.createWebhook('talosHook', {
          channel: configChannel,
        });
        webhook = await channel.fetchWebhooks().get('talosHook');
        if (!webhook) {
          console.error('Unable to locate or create useable webhook');
        }
      } else if (webhook.channel !== configChannelID) {
        await webhook.edit({ channel: channel.id });
      }

      await webhook.send({
        content: `Hi WhacK. All systems appear to be online.`,
        username: bot.user.tag,
        avatarURL: bot.user.displayAvatarURL(),
      });
    } catch (error) {
      console.error('Error trying to send: ', error);
    }
    console.log(`Ready! Logged in as ${bot.user.tag}`);
  },
};
