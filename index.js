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
  };  if (command === 'nickname') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
      return message.reply("❌ You don't have permission to change nicknames.");
    }
    const member = message.mentions.members.first();
    const newName = args.slice(1).join(" ");
    if (!member || !newName) {
      return message.reply("Usage: `+nickname @user NewNickname`");
    }

    try {
      await member.setNickname(newName);
      message.channel.send(`✏️ Renamed ${member.user.tag} to **${newName}**`);
      await sendLog("✏️ Nickname Changed", `${member.user.tag} was renamed to **${newName}** by ${message.author.tag}`);
    } catch {
      message.reply("❌ Failed to change nickname.");
    }
  }

  if (command === 'user') {
    const member = message.mentions.members.first() || message.member;
    const roles = member.roles.cache
      .filter(role => role.id !== message.guild.id)
      .map(role => role.name)
      .join(', ') || 'None';

    const embed = new EmbedBuilder()
      .setTitle(`👤 User Info: ${member.user.tag}`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: "Joined Server", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`, inline: true },
        { name: "Account Created", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:D>`, inline: true },
        { name: "Roles", value: roles }
      )
      .setColor(0x00bfff)
      .setFooter({ text: `ID: ${member.id}` });

    message.channel.send({ embeds: [embed] });
  }

  if (command === 'help') {
    const embed = new EmbedBuilder()
      .setTitle("🧠 EEe MOD Command List")
      .setColor(0xff9900)
      .setDescription("Here are the available commands with examples — powered by satire & sarcasm.")
      .addFields(
        { name: "`+ping`", value: "Test if the bot's still breathing. Replies with `Pong!`" },
        { name: "`+kick @user`", value: "Kick someone out of your life. Example: `+kick @TomRiddle`" },
        { name: "`+ban @user`", value: "Permanent timeout. Example: `+ban @TomRiddle`" },
        { name: "`+warn @user [reason]`", value: "Give a slap on the wrist. Example: `+warn @TomRiddle being evil`" },
        { name: "`+mute @user 10m`", value: "Make someone shut up. Example: `+mute @TomRiddle 10m`" },
        { name: "`+clear 10` or `+msg 10`", value: "Delete messages. Example: `+msg 10`" },
        { name: "`+role @role @user`", value: "Give a shiny badge. Example: `+role @Slytherin @SeverusSnape`" },
        { name: "`+rem @role @user`", value: "Strip a badge. Example: `+rem @DeathEater @TomRiddle`" },
        { name: "`+nickname @user NewName`", value: "Rename someone. Example: `+nickname @TomRiddle Voldy`" },
        { name: "`+user @user`", value: "Show user info. Example: `+user @SeverusSnape`" }
      )
      .setFooter({ text: "More features are being summoned..." });

    message.channel.send({ embeds: [embed] });
  }
