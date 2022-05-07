const { MessageEmbed, Message } = require('discord.js');

/**
 * 
 * @param {Message} message 
 * @param {MessageEmbed} embed 
 */
module.exports.send = async function (message, embed) {
  const { color, footer } = message.client.config;
  let newEmbed = new Discord.MessageEmbed()
    .setFooter(config.footer)
    .setColor(color);
  embed = { ...newEmbed, ...embed };

  return message.channel.send({ embeds: [embed] });
};

module.exports.usage = async function (message, data) {
  let cmd = data.cmd;
  let usageDesc = await cmd.data.usage
    .join('\n')
    .replace(/{prefix}/g, data.guild.prefix);

  let newEmbed = new MessageEmbed()
    .setFooter(footer)
    .setColor('RED')
    .setAuthor('Uh Oh!', message.author.displayAvatarURL())
    .setDescription(
      'Missing arguments for command. Please provide the valid inputs.'
    )
    .addField('__Usage__', usageDesc);

  return message.channel.send({ embeds: [newEmbed] });
};
