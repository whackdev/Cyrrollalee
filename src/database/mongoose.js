const mongoose = require('mongoose');
const { NPC, Logger } = require('./schema');
const { updateOne, update } = require('./schema/Npc');

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
// Fetch a specific guild `NPC`.
module.exports.fetchNPC = async function (id, guildID) {
  return await NPC.findOne({ guildID: guildID, id: id });
};

// Save a guild `NPC`
module.exports.addNPC = async function (
  id,
  homeChannel,
  avatarURL,
  username,
  guildID
) {
  const newNPC =
    (await NPC.findOne({ id: id })) ??
    new NPC({
      id: id,
      guildID: guildID,
      homeChannel: homeChannel,
      avatarURL: avatarURL,
      username: username,
    });

  return await newNPC.save().catch((err) => {
    throw new Error('Unable to save NPC to databse. \nError:', err);
  });
};

module.exports.deleteNPC = async function (id) {
  return await NPC.findOneAndDelete({ id: id }).catch((err) => {
    throw new Error('Unable to delete NPC from databse. \nError:', err);
  });
};

module.exports.updateNPC = async function (id, key, value) {
  const keyLookup = { npc_homeChannel: "homeChannel", npc_avatarURL: "avatarURL", npc_username: "username" }
  const query = { id: id };
  let update = {};
  update[keyLookup[key]] = value;
  update['lastUpdated'] = Date.now();

  return await NPC.findOneAndUpdate(query, update).catch((err) => {
    throw new Error('Unable to update NPC in databse. \nError:', err);
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
