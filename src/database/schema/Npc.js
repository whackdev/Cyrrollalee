const { Schema, model } = require('mongoose');

module.exports = model(
  'npc',
  new Schema({
    id: { type: String, unique: true },
    guildID: { type: String, required: true },
    homeChannel: { type: String, required: true },
    avatarURL: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    registeredAt: { type: Number, default: Date.now() },
    lastUpdate: { type: Number, default: Date.now() },
  })
);
