const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, CommandInteraction } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('gives the current weather in Elaelin'),
    async execute(interaction, whale) {

        
        await interaction.reply({content: weather, ephemeral: true});
    }
};