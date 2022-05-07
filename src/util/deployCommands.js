require('dotenv').config();

const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { guildID, clientId } = require('../config/config.json');

const commands = [];
const commandFiles = fs
  .readdirSync('./src/commands/slash_commands/')
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`../commands/slash_commands/${file}`);
  console.log(`Loading file: ${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationGuildCommands(clientId, guildID), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();