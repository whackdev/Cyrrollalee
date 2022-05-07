const { Client, Collection } = require('discord.js');
const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const config = require('./config/config.json');

const mongoose = require('mongoose');
const Sentry = require('@sentry/node');
Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

class Bot extends Client {
  constructor(options) {
    super(options);
  }

  async launch() {
    let bot = this;
    bot.sentry = Sentry;
    bot.commands = new Collection();
    bot.config = config;
    bot.config.reactEmojis = {
      delete: '❌',
      edit: '📝',
      whoIsIt: '❓',
      pin: '📌',
    };
    bot.db = require('./database/mongoose');
    bot.logger = require('./util/logger');
    bot.tools = require('./util/helpers');
    bot.embed = require('./util/embed');
    bot.recent = {};
    bot.dialog = {};
    try {
      bot.blacklist = new Set(JSON.parse(require('./config/blacklist.json')));
    } catch (e) {
      bot.blacklist = new Set();
    }

    require('./modules/util')(bot);
    require('./modules/server')(bot);

    const eventFiles = fs
      .readdirSync('./src/events')
      .filter((file) => file.endsWith('.js'));

    for (const file of eventFiles) {
      const event = require(`./events/${file}`);
      if (event.once) {
        bot.once(event.name, (...args) => event.execute(...args));
      } else {
        bot.on(event.name, (...args) => event.execute(...args));
      }
    }

    const commandFiles = fs
      .readdirSync(`./src/commands/`)
      .filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(`./commands/${file}`);
      bot.commands.set(command.data.name, command);
    }

    const slashCommandFiles = fs
      .readdirSync(`./src/commands/slash_commands/`)
      .filter((file) => file.endsWith('.js'));
    for (const file of slashCommandFiles) {
      const command = require(`./commands/slash_commands/${file}`);
      bot.commands.set(command.data.name, command);
    }

    await bot.db.init();
    bot.login(process.env.TOKEN);
  }
}

module.exports = Bot;
