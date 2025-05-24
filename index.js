const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
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

  if (command === 'role') {
    if (!message.member.permissions.has('ManageRoles')) return message.reply("You don't have permission to manage roles.");
    
    const role = message.mentions.roles.first();
    const member = message.mentions.members.first();
    
    if (!role || !member) return message.reply("Please mention a role and a user: `+role @role @user`");

    try {
      await member.roles.add(role);
      message.channel.send(`✅ Added role ${role.name} to ${member.user.tag}`);
    } catch (err) {
      message.channel.send("❌ Failed to add role. Check my permissions and role hierarchy.");
    }
  }

  if (command === 'rem') {
    if (!message.member.permissions.has('ManageRoles')) return message.reply("You don't have permission to manage roles.");
    
    const role = message.mentions.roles.first();
    const member = message.mentions.members.first();
    
    if (!role || !member) return message.reply("Please mention a role and a user: `+rem @role @user`");

    try {
      await member.roles.remove(role);
      message.channel.send(`✅ Removed role ${role.name} from ${member.user.tag}`);
    } catch (err) {
      message.channel.send("❌ Failed to remove role. Check my permissions and role hierarchy.");
    }
  }
});

client.login(process.env.TOKEN);

// --- Fake Express server to keep Render service alive ---
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('EEe MOD is running!');
});

app.listen(3000, () => {
  console.log('Fake web server running on port 3000');
});
