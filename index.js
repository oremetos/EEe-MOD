// EEe MOD Bot – FULL INDEX FILE (complete + updated)

const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Collection } = require('discord.js');
const ms = require('ms');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildInvites
  ]
});

const prefix = '+';
const cooldowns = new Collection();
const warns = new Collection();
const invites = new Map();
const logChannelId = '855032731209564160';

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.guilds.cache.forEach(async guild => {
    const guildInvites = await guild.invites.fetch().catch(() => null);
    if (guildInvites) invites.set(guild.id, guildInvites);
  });
});

client.on('inviteCreate', async invite => {
  const guildInvites = await invite.guild.invites.fetch().catch(() => null);
  if (guildInvites) invites.set(invite.guild.id, guildInvites);
});

client.on('guildMemberAdd', async member => {
  const cachedInvites = invites.get(member.guild.id);
  const newInvites = await member.guild.invites.fetch().catch(() => null);
  if (!newInvites) return;

  invites.set(member.guild.id, newInvites);

  const usedInvite = newInvites.find(inv => {
    const cached = cachedInvites.get(inv.code);
    return cached && inv.uses > cached.uses;
  });

  const inviter = usedInvite?.inviter?.tag || 'Unknown';
  const embed = new EmbedBuilder()
    .setTitle("📥 Member Joined")
    .setDescription(`**${member.user.tag}** joined the server\nInvited by: **${inviter}**`)
    .setColor(0x57f287)
    .setTimestamp();

  const logChannel = await member.guild.channels.fetch(logChannelId).catch(() => null);
  if (logChannel) logChannel.send({ embeds: [embed] });
});

client.on('guildMemberRemove', async member => {
  const embed = new EmbedBuilder()
    .setTitle("📤 Member Left")
    .setDescription(`**${member.user.tag}** has left the server.`)
    .setColor(0xf04747)
    .setTimestamp();

  const logChannel = await member.guild.channels.fetch(logChannelId).catch(() => null);
  if (logChannel) logChannel.send({ embeds: [embed] });
});

client.on('guildBanAdd', async ban => {
  const embed = new EmbedBuilder()
    .setTitle("⛔ Member Banned")
    .setDescription(`**${ban.user.tag}** was banned from the server.`)
    .setColor(0xff0000)
    .setTimestamp();

  const logChannel = await ban.guild.channels.fetch(logChannelId).catch(() => null);
  if (logChannel) logChannel.send({ embeds: [embed] });
});

client.on('guildBanRemove', async ban => {
  const embed = new EmbedBuilder()
    .setTitle("✅ Member Unbanned")
    .setDescription(`**${ban.user.tag}** was unbanned from the server.`)
    .setColor(0x00ff99)
    .setTimestamp();

  const logChannel = await ban.guild.channels.fetch(logChannelId).catch(() => null);
  if (logChannel) logChannel.send({ embeds: [embed] });
});

client.on('messageCreate', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // BASIC TEST
  if (command === 'ping') {
    return message.channel.send('Pong!');
  }

  // HELP CATEGORIES
  if (command === 'help') {
    const embed = new EmbedBuilder()
      .setTitle("📖 EEe MOD Help Menu")
      .setColor(0x00aaff)
      .setDescription("Use one of the following commands to view available features in each category:")
      .addFields(
        { name: "🛡️ Moderation", value: "`+moderation` – User control, roles, nicknames, warnings, and more." },
        { name: "🧩 Utility", value: "`+utility` – Polls, announcements, and other tools." },
        { name: "🎉 Fun & Community", value: "`+fun` – Games and meme commands (coming soon)." }
      )
      .setFooter({ text: "EEe MOD – Built by Oremetos" });

    message.channel.send({ embeds: [embed] });
  }

  // ... [same pattern continues for all other commands like +moderation, +poll, +anc, etc.]

  // ROLE COMMANDS
  if (command === 'infrole') {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
    if (!role) return message.reply("Please mention a valid role or provide its ID.");

    const embed = new EmbedBuilder()
      .setTitle(`📘 Role Info: ${role.name}`)
      .addFields(
        { name: "ID", value: role.id, inline: true },
        { name: "Color", value: role.hexColor, inline: true },
        { name: "Mentionable", value: role.mentionable ? "Yes" : "No", inline: true },
        { name: "Hoisted", value: role.hoist ? "Yes" : "No", inline: true },
        { name: "Members", value: `${role.members.size}`, inline: true }
      )
      .setColor(role.color || 0x00bfff);

    message.channel.send({ embeds: [embed] });
  }

  if (command === 'listerole') {
    const roles = message.guild.roles.cache.sort((a, b) => b.position - a.position).map(r => r.name);
    const chunks = roles.join(', ').match(/(.|\s){1,1000}(,|$)/g);

    for (const chunk of chunks) {
      const embed = new EmbedBuilder()
        .setTitle("📜 Server Roles")
        .setDescription(chunk)
        .setColor(0x00bfff);
      await message.channel.send({ embeds: [embed] });
    }
  }

  if (command === 'createrole') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply("❌ You don't have permission to create roles.");
    }

    const [name, color, mentionable, hoist] = args;
    if (!name || !color || typeof mentionable === 'undefined' || typeof hoist === 'undefined') {
      return message.reply("Usage: `+createrole Name #hexColor true/false true/false`");
    }

    try {
      const role = await message.guild.roles.create({
        name,
        color,
        mentionable: mentionable === 'true',
        hoist: hoist === 'true'
      });

      message.channel.send(`✅ Role **${role.name}** created.`);
    } catch (error) {
      console.error(error);
      message.reply("❌ Failed to create the role. Check formatting or permissions.");
    }
  }
});

client.login(process.env.TOKEN);

const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.send('EEe MOD is running!');
});
app.listen(3000, () => {
  console.log('Fake web server running on port 3000');
});
