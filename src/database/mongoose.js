const mongoose = require('mongoose');
const { Logger } = require('./schema');

// Connect to Database
module.exports.init = async function () {
  mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.log(`Unable to connect to MongoDB Database.\nError: ${err}`);
    });
};

//Create/find Log in Database
module.exports.createLog = async function (message, data) {
  let logDB = new Logger({
    commandName: data.cmd.data.name,
    author: {
      username: message.author.username,
      discriminator: message.author.discriminator,
      id: message.author.id,
    },
    guild: {
      name: message.guild ? message.guild.name : 'dm',
      id: message.guild ? message.guild.id : 'dm',
      channel: message.channel ? message.channel.id : 'unknown',
    },
    date: Date.now(),
  });
  await logDB.save().catch((err) => message.client.err(err));
  return;
};
