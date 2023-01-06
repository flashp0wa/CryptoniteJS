const fs = require('node:fs');
const path = require('node:path');
const {Client, Events, Collection, GatewayIntentBits} = require('discord.js');
const {DiscordApiLog} = require('../Toolkit/DiscordLogger');

let client;

async function loadDiscordApi() {
  return new Promise((resolve) => {
  // Create a new client instance
    client = new Client({intents: [GatewayIntentBits.Guilds]});
    client.commands = new Collection();

    const commandsPath = path.join(__dirname, 'Commands');
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
      } else {
        DiscordApiLog.log({
          level: 'error',
          message: `The command at ${filePath} is missing a required "data" or "execute" property.`,
          senderFunction: 'loadDiscordApi',
          file: 'DiscordBot.js',
        });
      }
    }
    // When the client is ready, run this code (only once)
    // We use 'c' for the event parameter to keep it separate from the already defined 'client'
    client.once(Events.ClientReady, (c) => {
      resolve(
          DiscordApiLog.log({
            level: 'info',
            message: `Discord bot online as ${c.user.tag}`,
            senderFunction: 'loadDiscordApi',
            file: 'DiscordBot.js',
          }),
      );
    });

    client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        DiscordApiLog.log({
          level: 'error',
          message: `No command matching ${interaction.commandName} was found.`,
          senderFunction: 'loadDiscordApi',
          file: 'DiscordBot.js',
        });
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        DiscordApiLog.log({
          level: 'error',
          message: `An error occured executing the command. ${error}`,
          senderFunction: 'loadDiscordApi',
          file: 'DiscordBot.js',
        });
        await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
      }
    });

    // Log in to Discord with your client's token
    client.login(process.env.DSCRD_BOTTOKEN);
  });
}

async function getServerChannel(id) {
  if (!client) await loadDiscordApi();
  return client.channels.cache.get(id);
}

module.exports = {
  loadDiscordApi,
  getServerChannel,
};
