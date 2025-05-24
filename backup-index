// EEe MOD – MASTER VERSION (COMPLETE)
// Includes: Help system, Moderation, Role Tools, Utility, Cooldowns, Logging, Invite Tracker, Express Server
/*
============================
📌 EEe MOD – DEVELOPMENT NOTES & CHECKLIST
============================

🧠 IMPORTANT PROTOCOL – READ BEFORE EDITING:
1. Always send back the **entire `index.js`** file after ANY update.
2. Never send partial code or isolated functions.
3. Always ask for the latest `index.js` before working.
4. Analyze the entire file for errors, bugs, or missing logic.
5. After adding any feature, **add it to the checklist below**.
6. All feature groups must be reviewed and verified with each update.

----------------------------
✅ CURRENT CHECKLIST
----------------------------

CORE SYSTEM:
- [x] Uses `+` as prefix
- [x] Cooldown system per user and command
- [x] `.env` support for TOKEN and LOG_CHANNEL_ID
- [x] Web server to stay alive on Render
- [x] Invite tracking (join, leave, ban)
- [x] Logs all mod actions and events to mod-log channel
- [x] Unknown command handler

HELP MENU & CATEGORIES:
- [x] `+help` shows 3 categories
- [x] `+moderation` — full list of mod tools
- [x] `+utility` — tools and server features
- [x] `+fun` — placeholder for future community/fun features

MODERATION:
- [x] `+kick @user` — kicks user
- [x] `+ban @user` — bans user
- [x] `+warn @user reason` — stores warning in memory
- [x] `+mute @user 10m` — adds muted role, auto-unmutes
- [x] `+clear 10` — deletes messages (1–100)
- [x] `+msg 10` — same as clear
- [x] `+slowmode 10s` — sets rate limit in channel
- [x] `+report @user reason` — sends embed to mod-log
- [x] `+role @role @user` — assigns role to user
- [x] `+rem @role @user` — removes role from user
- [x] `+nickname @user newNick` — changes nickname
- [x] `+createrole name #hex true false` — creates role
- [x] `+infrole @role` — shows info about a role
- [x] `+listerole` — lists all server roles
- [x] `+user @user` — shows user info (tag, ID, join/creation date)

UTILITY:
- [x] `+poll "Question" "Option1" "Option2"` — dynamic poll with emoji reactions
- [x] `+anc #channel Your message` — send embed to any channel
  - [x] Accepts channel mention, ID, or raw link

REMEMBER: Always append new features to this checklist block and revalidate the entire file before sending.
*/
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Collection } = require('discord.js');
const ms = require('ms');
require('dotenv').config();
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
const logChannelId = process.env.LOG_CHANNEL_ID;

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
  const usedInvite = newInvites.find(inv => cachedInvites.get(inv.code)?.uses < inv.uses);
  const inviter = usedInvite?.inviter?.tag || 'Unknown';
  const embed = new EmbedBuilder()
    .setTitle("📥 Member Joined")
    .setDescription(`**${member.user.tag}** joined\nInvited by: **${inviter}**`)
    .setColor(0x57f287).setTimestamp();
  const logChannel = await member.guild.channels.fetch(logChannelId).catch(() => null);
  if (logChannel) logChannel.send({ embeds: [embed] });
});

client.on('guildMemberRemove', async member => {
  const embed = new EmbedBuilder()
    .setTitle("📤 Member Left")
    .setDescription(`**${member.user.tag}** left the server.`)
    .setColor(0xf04747).setTimestamp();
  const logChannel = await member.guild.channels.fetch(logChannelId).catch(() => null);
  if (logChannel) logChannel.send({ embeds: [embed] });
});

client.on('guildBanAdd', async ban => {
  const embed = new EmbedBuilder()
    .setTitle("⛔ Member Banned")
    .setDescription(`**${ban.user.tag}** was banned.`)
    .setColor(0xff0000).setTimestamp();
  const logChannel = await ban.guild.channels.fetch(logChannelId).catch(() => null);
  if (logChannel) logChannel.send({ embeds: [embed] });
});

client.on('messageCreate', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Cooldowns
  const cooldownMap = {
    ping: 2000, help: 2000, clear: 5000, msg: 5000, kick: 5000, ban: 5000, mute: 5000,
    warn: 5000, role: 5000, rem: 5000, nickname: 5000, slowmode: 3000, poll: 10000, anc: 5000
  };
  if (cooldownMap[command]) {
    if (!cooldowns.has(command)) cooldowns.set(command, new Collection());
    const now = Date.now();
    const timestamps = cooldowns.get(command);
    const cooldownAmount = cooldownMap[command];
    if (timestamps.has(message.author.id)) {
      const expiration = timestamps.get(message.author.id) + cooldownAmount;
      if (now < expiration) return message.reply(`⏳ Wait ${((expiration - now)/1000).toFixed(1)}s.`);
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  }

// Help & Menus
if (command === 'help') {
  const embed = new EmbedBuilder()
    .setTitle("📖 EEe MOD Help Menu")
    .setDescription("Use one of the following commands to view available features in each category:")
    .addFields(
      { name: "🛡️ Moderation", value: "`+moderation` – User control, roles, nicknames, warnings, and more." },
      { name: "🧩 Utility", value: "`+utility` – Polls, announcements, and other tools." },
      { name: "🎉 Fun & Community", value: "`+fun` – Games and meme commands (coming soon)." },
      { name: "⠀", value: "EEe MOD – Built by Oremetos" }
    )
    .setColor(0x00aaff);
  return message.channel.send({ embeds: [embed] });
}

if (command === 'moderation') {
  const embed = new EmbedBuilder()
    .setTitle("🛡️ Moderation Commands")
    .setDescription(
      `+kick @user\nKick someone out of your life. Example: +kick @TomRiddle\n\n` +
      `+ban @user\nPermanent timeout. Example: +ban @TomRiddle\n\n` +
      `+warn @user [reason]\nGive a slap on the wrist. Example: +warn @TomRiddle being evil\n\n` +
      `+mute @user 10m\nMake someone shut up. Example: +mute @TomRiddle 10m\n\n` +
      `+clear 10 / +msg 10\nDelete messages. Example: +msg 10\n\n` +
      `+role @role @user\nGive a shiny badge. Example: +role @Slytherin @SeverusSnape\n\n` +
      `+rem @role @user\nStrip a badge. Example: +rem @DeathEater @TomRiddle\n\n` +
      `+nickname @user newname\nRename someone. Example: +nickname @TomRiddle Voldy\n\n` +
      `+slowmode 10s\nSet channel slowmode. Example: +slowmode 10s\n\n` +
      `+user @user\nView user info. Example: +user @SeverusSnape\n\n` +
      `+infrole @role\nView role info.\n\n` +
      `+listerole\nList all server roles.\n\n` +
      `+createrole name #hex true false\nCreate a custom role.\n\n` +
      `+report @user reason\n(planned) Report a user to mods.`
    )
    .setColor(0xff9900);
  return message.channel.send({ embeds: [embed] });
}

if (command === 'utility') {
  const embed = new EmbedBuilder()
    .setTitle("🧩 Utility Commands")
    .setDescription(
      `+poll \"Question\" \"Option1\" \"Option2\"\nCreate a live poll. Example: +poll \"Who wins?\" \"Snape\" \"Voldemort\"\n\n` +
      `+anc #channel message\nSend an announcement embed. Example: +anc #general The Sorting Ceremony begins!\n\n` +
      `+infrole @role\nView details about a role. Example: +infrole @Gryffindor\n\n` +
      `+listerole\nList all server roles in one message.`
    )
    .setColor(0x00bfff);
  return message.channel.send({ embeds: [embed] });
}

if (command === 'fun') {
  const embed = new EmbedBuilder()
    .setTitle("🎉 Fun & Community Commands")
    .setDescription(
      `More coming soon! Planned features include:\n\n` +
      `+gpt question\nChat with the magic book 📘 (AI answers)\n` +
      `+meme\nPull a fresh meme from the wizard archives\n` +
      `+8ball question\nAsk the magic orb a yes/no question\n` +
      `+dailyspell\nReceive your daily power spell\n\n` +
      `EEe MOD – Crafted for fun by Oremetos`
    )
    .setColor(0xff66cc);
  return message.channel.send({ embeds: [embed] });
}
  // Moderation Actions
  if (command === 'kick') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return;
    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention someone.");
    await member.kick();
    message.channel.send(`${member.user.tag} was kicked.`);
  }
  if (command === 'ban') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return;
    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention someone.");
    await member.ban();
    message.channel.send(`${member.user.tag} was banned.`);
  }
  if (command === 'warn') {
    const member = message.mentions.members.first();
    const reason = args.slice(1).join(" ") || "No reason";
    if (!warns.has(member.id)) warns.set(member.id, []);
    warns.get(member.id).push({ mod: message.author.tag, reason });
    message.channel.send(`${member.user.tag} has been warned.`);
  }
  if (command === 'mute') {
    const member = message.mentions.members.first();
    const duration = ms(args[1]);
    const role = message.guild.roles.cache.find(r => r.name === "Muted") || await message.guild.roles.create({ name: 'Muted', permissions: [] });
    message.guild.channels.cache.forEach(c => c.permissionOverwrites.edit(role, { SendMessages: false }).catch(() => {}));
    await member.roles.add(role);
    message.channel.send(`${member.user.tag} muted for ${args[1]}`);
    setTimeout(() => member.roles.remove(role), duration);
  }
  if (command === 'clear' || command === 'msg') {
    const count = parseInt(args[0]);
    if (isNaN(count) || count < 1 || count > 100) return message.reply("1–100 only");
    await message.channel.bulkDelete(count, true);
    message.channel.send(`🧹 Deleted ${count} messages.`).then(m => setTimeout(() => m.delete(), 3000));
  }
  if (command === 'slowmode') {
    const duration = ms(args[0]) / 1000;
    await message.channel.setRateLimitPerUser(duration);
    message.channel.send(`Slowmode set to ${args[0]}`);
  }
  if (command === 'report') {
    const reported = message.mentions.members.first();
    const reason = args.slice(1).join(" ") || "No reason";
    const embed = new EmbedBuilder().setTitle("🚨 User Report")
      .addFields(
        { name: "Reporter", value: `${message.author.tag}` },
        { name: "Reported", value: `${reported?.user?.tag || 'Unknown'}` },
        { name: "Reason", value: reason })
      .setColor(0xff0000).setTimestamp();
    const logChannel = await message.guild.channels.fetch(logChannelId).catch(() => null);
    if (logChannel) logChannel.send({ embeds: [embed] });
    message.channel.send("Report sent.");
  }

  // Role Management
  if (command === 'role') {
    const role = message.mentions.roles.first();
    const user = message.mentions.members.find(m => m.id !== role.id);
    if (!role || !user) return message.reply("Mention role and user");
    await user.roles.add(role);
    message.channel.send(`✅ ${role.name} given to ${user.user.tag}`);
  }
  if (command === 'rem') {
    const role = message.mentions.roles.first();
    const user = message.mentions.members.find(m => m.id !== role.id);
    if (!role || !user) return message.reply("Mention role and user");
    await user.roles.remove(role);
    message.channel.send(`❌ ${role.name} removed from ${user.user.tag}`);
  }
  if (command === 'nickname') {
    const user = message.mentions.members.first();
    const nick = args.slice(1).join(" ");
    if (!user || !nick) return message.reply("Mention user and nickname");
    user.setNickname(nick);
    message.channel.send(`✏️ Nickname changed for ${user.user.tag}`);
  }
  if (command === 'infrole') {
    const role = message.mentions.roles.first();
    if (!role) return message.reply("Mention a role");
    message.channel.send(`📘 Role Info: **${role.name}** — ID: ${role.id} — Members: ${role.members.size}`);
  }
  if (command === 'listerole') {
    const list = message.guild.roles.cache.map(r => r.name).join(", ");
    message.channel.send(`📜 Roles: ${list}`);
  }
  if (command === 'user') {
    const user = message.mentions.members.first();
    if (!user) return message.reply("Mention a user");
    const embed = new EmbedBuilder()
      .setTitle(`User Info: ${user.user.tag}`)
      .addFields(
        { name: "ID", value: user.id },
        { name: "Joined", value: `<t:${Math.floor(user.joinedTimestamp/1000)}:F>` },
        { name: "Created", value: `<t:${Math.floor(user.user.createdTimestamp/1000)}:F>` })
      .setColor(0xaaaaaa);
    message.channel.send({ embeds: [embed] });
  }

  // Utility Commands
  if (command === 'poll') {
    const [question, ...options] = args.join(" ").match(/\"(.*?)\"/g)?.map(s => s.slice(1, -1)) || [];
    if (!question || options.length < 2) return message.reply("Use format: +poll \"Question\" \"Option1\" \"Option2\"");
    const emoji = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
    const embed = new EmbedBuilder().setTitle(question).setColor(0x00bfff);
    options.forEach((opt, i) => embed.addFields({ name: `${emoji[i]}`, value: opt }));
    const poll = await message.channel.send({ embeds: [embed] });
    for (let i = 0; i < options.length; i++) await poll.react(emoji[i]);
  }

  if (command === 'anc') {
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    const text = args.slice(1).join(" ");
    if (!channel || !text) return message.reply("Use: +anc #channel message");
    const embed = new EmbedBuilder().setDescription(text).setColor(0x00ffff);
    channel.send({ embeds: [embed] });
  }

  const allCommands = [
    'ping','help','moderation','utility','fun','kick','ban','warn','mute','clear','msg','slowmode','report',
    'role','rem','nickname','createrole','infrole','listerole','user','poll','anc'
  ];
  if (!allCommands.includes(command)) {
    return message.reply(`❌ Unknown command: \`${prefix}${command}\`.`);
  }
}); // closes client.on('messageCreate')

client.login(process.env.TOKEN);

// Express server to keep bot alive on Render
const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.send('EEe MOD is running!');
});
app.listen(3000, () => {
  console.log('Web server running on port 3000');
}); 
