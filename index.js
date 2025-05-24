// existing code remains unchanged above...

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
        { name: "`+infrole @role`", value: "(soon) View role info." },
        { name: "`+listerole`", value: "(soon) List all server roles." },
        { name: "`+createrole name #hex true false`", value: "(soon) Create a custom role." },
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
        { name: "`+anc #channel Your message`", value: "Make an announcement. Example: `+anc #news Hello there!`" }
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
