cmdCooldown = {};

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    const { client: bot, author, content, channel, member } = message;
    const { ownerID, adminRole } = bot.config;
    try {
      if (author.bot) return; // Ignore all bots but avrae

      if (message.webhookId || !message.guild) return; // Ignore webhooks

      if (!message.guild.prefix) {
        // Load prefix into cache
        message.guild.prefix = bot.config.prefix;
      }
      if (bot.blacklist.has(channel.id)) return;

      // Define prefix as a variable
      const prefix = message.guild.prefix;

      // Check for mentions without prefix
      if (content === `<@!${bot.user.id}>` || content === `<@${bot.user.id}>`) {
        return message.reply({
          content: `Look's like you forgot to use the prefix: \`${prefix}\``,
          allowedMentions: { repliedUser: true },
        });
      }

      if (!content.toLowerCase().startsWith(prefix)) return; // Ignore no prefix

      //Checking if the message is a command
      const args = content.slice(prefix.length).trim().split(/ +/g);
      const commandName = args.shift().toLowerCase();
      const cmd =
        bot.commands.get(commandName) ||
        bot.commands.find(
          (cmd) => cmd.data.aliases && cmd.data.aliases.includes(commandName)
        );

      if (!cmd) return; // Invalid command return

      if (!channel.nsfw && cmd.data.nsfw) {
        return; // NSFW safety check Error
      }

      if (cmd.data.ownerOnly && author.id !== ownerID) {
        return;
      }

      let userPerms = [];
      cmd.data.memberPermissions.forEach((p) => {
        if (!channel.permissionsFor(member).has(p)) userPerms.push(p); // Add missing perms to list
      });

      //If user permissions arraylist length is more than one return error
      if (
        userPerms.length > 0 &&
        !member.roles.cache.find(
          (r) => r.name.toLowerCase() === adminRole.toLowerCase()
        )
      ) {
        bot.logger.cmd(
          `${message.author.tag} used ${cmd.data.name} - Missing permissions`
        );
        return channel.send(
          "Looks like you're missing the following permissions:\n" +
            userPerms.map((p) => `\`${p}\``).join(', ')
        );
      }

      let clientPerms = [];
      //Checking for client permissions
      cmd.data.botPermissions.forEach((perm) => {
        if (!channel.permissionsFor(message.guild.me).has(perm)) {
          clientPerms.push(perm);
        }
      });
      //If client permissions arraylist length is more than one return error
      if (clientPerms.length > 0) {
        bot.logger.cmd(
          `${author.tag} used ${cmd.data.name} - Missing permissions`
        );
        return channel.send(
          "Looks like I'm missing the following permissions:\n" +
            clientPerms.map((p) => `\`${p}\``).join(', ')
        );
      }

      let userCooldown = cmdCooldown[author.id];

      if (!userCooldown) {
        cmdCooldown[author.id] = {};
        uCooldown = cmdCooldown[author.id];
      }

      let time = uCooldown[cmd.data.name] || 0;

      //Check if user has a command cooldown
      if (time && time > Date.now()) {
        let timeLeft = Math.ceil((time - Date.now()) / 1000);
        return channel.send(
          `Command is on cooldown. You need to wait ${timeLeft} seconds`
        ); //Error message
      }

      cmdCooldown[author.id][cmd.data.name] = Date.now() + cmd.data.cooldown;

      let data = {};
      data.user = author.id;
      data.guild = message.guild.id;
      data.cmd = cmd;
      data.config = bot.config;

      //Execute the command and log the user in console
      cmd.execute(message, args, data);
      bot.logger.cmd(`${author.tag} used ${cmd.data.name}`);

      //Create a new log for the command
      bot.db.createLog(message, data);
    } catch (error) {
      console.error(`An unexpected error occurred.\nError: ${error.message}`);
    }
  },
};
