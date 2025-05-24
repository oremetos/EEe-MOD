const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Collection } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const prefix = '+';
const cooldowns = new Collection();

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Cooldown (5s default per command per user)
  if (!cooldowns.has(command)) cooldowns.set(command, new Collection());
  const now = Date.now();
  const timestamps = cooldowns.get(command);
  const cooldownAmount = 5000;
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
      return message.reply(`⏳ Please wait ${timeLeft}s before using \`${prefix}${command}\` again.`);
    }
  }
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  // Helper: find log channel
  const logChannel = message.guild.channels.cache.find(c =>
    c.name === 'mod-logs' && c.type === 0
  );

  const sendLog = (title, description, color = 0xff6600) => {
    if (!logChannel) return;
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setTimestamp()
      .setFooter({ text: `EEe MOD • ${message.guild.name}` });
    logChannel.send({ embeds: [embed] });
  };

  if (command === 'ping') {
    message.channel.send('Pong!');
  }

  if (command === 'kick') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply("❌ You don't have permission to kick members.");
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply("❗ Mention someone to kick: `+kick @user`");

    if (!member.kickable) return message.reply("❌ I can't kick this user. Check my role position and permissions.");

    try {
      await member.kick();
      message.channel.send(`✅ ${member.user.tag} was kicked.`);
      sendLog("🦵 Member Kicked", `${member.user.tag} was kicked by ${message.author.tag}`);
    } catch (error) {
      message.channel.send('❌ Failed to kick the user.');
    }
  }

  if (command === 'ban') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply("❌ You don't have permission to ban members.");
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply("❗ Mention someone to ban: `+ban @user`");

    if (!member.bannable) return message.reply("❌ I can't ban this user. Check my role position and permissions.");

    try {
      await member.ban();
      message.channel.send(`✅ ${member.user.tag} was banned.`);
      sendLog("⛔ Member Banned", `${member.user.tag} was banned by ${message.author.tag}`);
    } catch (error) {
      message.channel.send('❌ Failed to ban the user.');
    }
  }

  if (command === 'role') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return message.reply("You don't have permission to manage roles.");
    const role = message.mentions.roles.first();
    const member = message.mentions.members.first();
    if (!role || !member) return message.reply("Please mention a role and a user: `+role @role @user`");

    try {
      await member.roles.add(role);
      message.channel.send(`✅ Added role ${role.name} to ${member.user.tag}`);
      sendLog("🔧 Role Added", `${message.author.tag} added role ${role.name} to ${member.user.tag}`);
    } catch {
      message.channel.send("❌ Failed to add role. Check my permissions and role hierarchy.");
    }
  }

  if (command === 'rem') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return message.reply("You don't have permission to manage roles.");
    const role = message.mentions.roles.first();
    const member = message.mentions.members.first();
    if (!role || !member) return message.reply("Please mention a role and a user: `+rem @role @user`");

    try {
      await member.roles.remove(role);
      message.channel.send(`✅ Removed role ${role.name} from ${member.user.tag}`);
      sendLog("🧹 Role Removed", `${message.author.tag} removed role ${role.name} from ${member.user.tag}`);
    } catch {
      message.channel.send("❌ Failed to remove role. Check my permissions and role hierarchy.");
    }
  }
});

client.login(process.env.TOKEN);

// --- Keep-alive server for Render ---
const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.send('EEe MOD is running!');
});
app.listen(3000, () => {
  console.log('Fake web server running on port 3000');
});
