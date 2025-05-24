// EEe MOD FULL INDEX with ALL features (ping, help, moderation, utility, roles, invites, poll, anc, etc.)

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

  if (command === 'ping') {
    return message.channel.send('Pong!');
  }

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

  if (command === 'moderation') {
    const embed = new EmbedBuilder()
      .setTitle("🛡️ Moderation Commands")
      .setColor(0xff9900)
      .addFields(
        { name: "`+kick @user`", value: "Kick someone out of your life. Example: `+kick @TomRiddle`" },
        { name: "`+ban @user`", value: "Permanent timeout. Example: `+ban @TomRiddle`" },
        { name: "`+warn @user [reason]`", value: "Give a slap on the wrist. Example: `+warn @TomRiddle being evil`" },
        { name: "`+mute @user 10m`", value: "Make someone shut up. Example: `+mute @TomRiddle 10m`" },
        { name: "`+clear 10` / `+msg 10`", value: "Delete messages. Example: `+msg 10`" },
        { name: "`+role @role @user`", value: "Give a shiny badge. Example: `+role @Slytherin @SeverusSnape`" },
        { name: "`+rem @role @user`", value: "Strip a badge. Example: `+rem @DeathEater @TomRiddle`" },
        { name: "`+nickname @user newname`", value: "Rename someone. Example: `+nickname @TomRiddle Voldy`" },
        { name: "`+slowmode 10s`", value: "Set channel slowmode. Example: `+slowmode 10s`" },
        { name: "`+user @user`", value: "View user info. Example: `+user @SeverusSnape`" },
        { name: "`+infrole @role`", value: "View role info." },
        { name: "`+listerole`", value: "List all server roles." },
        { name: "`+createrole name #hex true false`", value: "Create a custom role." },
        { name: "`+report @user reason`", value: "(planned) Report a user to mods." }
      )
      .setFooter({ text: "EEe MOD – Moderation Category" });

    message.channel.send({ embeds: [embed] });
  }

  if (command === 'utility') {
    const embed = new EmbedBuilder()
      .setTitle("🧩 Utility Commands")
      .setColor(0x00bfff)
      .addFields(
        { name: "`+poll \"Question\" \"Option 1\" \"Option 2\"`", value: "Start a poll. Example: `+poll \"Best house?\" \"Slytherin\" \"Gryffindor\"`" },
        { name: "`+anc #channel|<#channel>|channelID Your message`", value: "Send an announcement." }
      )
      .setFooter({ text: "EEe MOD – Utility Category" });

    message.channel.send({ embeds: [embed] });
  }

  if (command === 'fun') {
    const embed = new EmbedBuilder()
      .setTitle("🎉 Fun & Community Commands")
      .setColor(0xff66cc)
      .setDescription("Coming soon: Games, jokes, custom meme commands and more!")
      .setFooter({ text: "EEe MOD – Fun Category" });

    message.channel.send({ embeds: [embed] });
  }

  if (command === 'poll') {
    const [question, ...options] = args.join(' ').match(/\"(.*?)\"/g)?.map(s => s.replace(/\"/g, '')) || [];
    if (!question || options.length < 2) {
      return message.reply("Usage: `+poll \"Question\" \"Option 1\" \"Option 2\" [... up to 10]`");
    }

    const emojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
    const description = options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`📊 ${question}`)
      .setDescription(description)
      .setColor(0x00bfff)
      .setFooter({ text: `Poll by ${message.author.tag}` });

    const pollMessage = await message.channel.send({ embeds: [embed] });
    for (let i = 0; i < options.length; i++) {
      await pollMessage.react(emojis[i]);
    }
  }

  if (command === 'anc') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply("❌ You don't have permission to announce.");
    }

    const target = args.shift();
    const content = args.join(' ');
    let targetChannel = null;

    if (message.mentions.channels.size > 0) {
      targetChannel = message.mentions.channels.first();
    } else if (/^<#(\d+)>$/.test(target)) {
      const id = target.match(/^<#(\d+)>$/)[1];
      targetChannel = message.guild.channels.cache.get(id);
    } else if (/^(\d{17,20})$/.test(target)) {
      targetChannel = message.guild.channels.cache.get(target);
    }

    if (!targetChannel || !content) {
      return message.reply("Usage: `+anc #channel|channelID|<#channel> Your message here`");
    }

    targetChannel.send({ content: `📢 ${content}` });
    message.channel.send("✅ Announcement sent.");
  }

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
