const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Collection } = require('discord.js');
const ms = require('ms');
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
const warns = new Collection();
const logChannelId = '855032731209564160';

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (!cooldowns.has(command)) cooldowns.set(command, new Collection());
  const now = Date.now();
  const timestamps = cooldowns.get(command);
  const cooldownAmount = 5000;
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
      return message.reply(`⏳ Wait ${timeLeft}s before using \`${prefix}${command}\` again.`);
    }
  }
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  const sendLog = async (title, description, color = 0xff6600) => {
    const logChannel = await message.guild.channels.fetch(logChannelId).catch(() => null);
    if (!logChannel) return;
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setTimestamp()
      .setFooter({ text: `EEe MOD • ${message.guild.name}` });
    logChannel.send({ embeds: [embed] }).catch(err => {
      console.error('Failed to send log:', err.message);
    });
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
      await sendLog("🦵 Member Kicked", `${member.user.tag} was kicked by ${message.author.tag}`);
    } catch {
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
      await sendLog("⛔ Member Banned", `${member.user.tag} was banned by ${message.author.tag}`);
    } catch {
      message.channel.send('❌ Failed to ban the user.');
    }
  }

  if (command === 'warn') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return message.reply("❌ No permission.");
    const member = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || "No reason provided";
    if (!member) return message.reply("Mention a user to warn: `+warn @user reason`");

    const currentWarns = warns.get(member.id) || 0;
    warns.set(member.id, currentWarns + 1);

    try {
      await member.send(`⚠️ You were warned in **${message.guild.name}** for: ${reason}`);
    } catch {}
    message.channel.send(`✅ ${member.user.tag} has been warned.`);
    await sendLog("⚠️ Member Warned", `${member.user.tag} was warned by ${message.author.tag}\nReason: ${reason}\nTotal Warns: ${warns.get(member.id)}`);
  }

  if (command === 'mute') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) return message.reply("❌ No permission.");
    const member = message.mentions.members.first();
    const duration = args[1];
    if (!member || !duration) return message.reply("Usage: `+mute @user 10m`");

    const mutedRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === "muted");
    if (!mutedRole) return message.reply("❗ No role named `Muted` found.");

    await member.roles.add(mutedRole).catch(() => {
      return message.reply("❌ Failed to assign the muted role.");
    });

    message.channel.send(`🔇 ${member.user.tag} muted for ${duration}`);
    await sendLog("🔇 Member Muted", `${member.user.tag} was muted by ${message.author.tag} for **${duration}**`);

    setTimeout(async () => {
      if (member.roles.cache.has(mutedRole.id)) {
        await member.roles.remove(mutedRole).catch(() => {});
        await sendLog("🔊 Member Unmuted", `${member.user.tag} was automatically unmuted after ${duration}`);
      }
    }, ms(duration));
  }

  if (command === 'clear' || command === 'msg') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return message.reply("❌ No permission.");
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) return message.reply("Enter a number between 1 and 100.");

    try {
      await message.channel.bulkDelete(amount, true);
      message.channel.send(`🧹 Deleted ${amount} messages.`).then(m => setTimeout(() => m.delete(), 3000));
      await sendLog("🧹 Messages Cleared", `${amount} messages deleted by ${message.author.tag} in ${message.channel}`);
    } catch {
      message.reply("❌ Could not delete messages.");
    }
  }

  if (command === 'role') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return message.reply("You don't have permission to manage roles.");
    const role = message.mentions.roles.first();
    const member = message.mentions.members.first();
    if (!role || !member) return message.reply("Usage: `+role @role @user`");

    try {
      await member.roles.add(role);
      message.channel.send(`✅ Added role ${role.name} to ${member.user.tag}`);
      await sendLog("🔧 Role Added", `${message.author.tag} added role ${role.name} to ${member.user.tag}`);
    } catch {
      message.channel.send("❌ Failed to add role.");
    }
  }

  if (command === 'rem') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return message.reply("You don't have permission to manage roles.");
    const role = message.mentions.roles.first();
    const member = message.mentions.members.first();
    if (!role || !member) return message.reply("Usage: `+rem @role @user`");

    try {
      await member.roles.remove(role);
      message.channel.send(`✅ Removed role ${role.name} from ${member.user.tag}`);
      await sendLog("🧹 Role Removed", `${message.author.tag} removed role ${role.name} from ${member.user.tag}`);
    } catch {
      message.channel.send("❌ Failed to remove role.");
    }
  }
});
client.login(process.env.TOKEN);

// --- Express server for Render keep-alive ---
const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.send('EEe MOD is running!');
});
app.listen(3000, () => {
  console.log('Fake web server running on port 3000');
});
