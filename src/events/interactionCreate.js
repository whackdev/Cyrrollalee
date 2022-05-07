const { CommandInteraction } = require('discord.js');
module.exports = {
  name: 'interactionCreate',
  /** 
   * @param {CommandInteraction} interaction 
   */
  execute: async (interaction) => {
    if (interaction.isCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.editReply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    } else {
      return;
    }
  },
};
