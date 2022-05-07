require('dotenv').config();
// Require the necessary discord.js classes
const { Intents } = require('discord.js');

const Bot = require('./bot.js');

// Create a new client instance
const bot = new Bot({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_WEBHOOKS,
  ],
});

bot.launch();

process.on('unhandledRejection', (err) => {
  console.log('Unknown error occured:\n');
  console.log(err);
});
