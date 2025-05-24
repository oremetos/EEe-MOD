const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

const prefix = '+';

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    message.channel.send('Pong!');
  }

  if (command === 'kick') {
    if (!message.member.permissions.has('KickMembers')) return message.reply("You don't have permission.");
    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention someone to kick.");
    try {
      await member.kick();
      message.channel.send(`${member.user.tag} was kicked.`);
    } catch (error) {
      message.channel.send('Failed to kick the user.');
    }
  }

  if (command === 'ban') {
    if (!message.member.permissions.has('BanMembers')) return message.reply("You don't have permission.");
    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention someone to ban.");
    try {
      await member.ban();
      message.channel.send(`${member.user.tag} was banned.`);
    } catch (error) {
      message.channel.send('Failed to ban the user.');
    }
  }
});

client.login(process.env.TOKEN);
