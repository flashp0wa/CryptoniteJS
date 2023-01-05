const fs = require('node:fs');
const path = require('node:path');
const {Client, Events, Collection, GatewayIntentBits} = require('discord.js');
const {DiscordApiLog} = require('../Toolkit/DiscordLogger');

let client;


async function loadDiscordApi() {
  return new Promise((resolve, reject) => {
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
        DiscordApiLog.error(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
    // When the client is ready, run this code (only once)
    // We use 'c' for the event parameter to keep it separate from the already defined 'client'
    client.once(Events.ClientReady, (c) => {
      resolve(DiscordApiLog.info(`Discord bot online as ${c.user.tag}`));
    });

    client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        DiscordApiLog.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        DiscordApiLog.error(`An error occured executing the command. ${error}`);
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
