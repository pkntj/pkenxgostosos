const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "youtube",
  description: "Iniciando o YouTube",
  usage: "",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["yt"],
  /**
   *
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {require("discord.js").Message} message
   * @param {string[]} args
   * @param {*} param3
   */
  run: async (client, message, args, { GuildDB }) => {
    if (!message.member.voice.channel)
      return client.sendTime(
        message.channel,
        "❌ | **Você deve estar em um canal de voz para tocar algo!**"
      );
    if (
      !message.member.voice.channel
        .permissionsFor(message.guild.me)
        .has("CRIANDO_CONVITE_INSTANTANEO")
    )
      return client.sendTime(
        message.channel,
        "❌ | **Bot não tem permissão de criar convite**"
      );

    let Invite = await message.member.voice.channel.activityInvite(
      "880218394199220334"
    ); //Made using discordjs-activity package
    let embed = new MessageEmbed()
      .setAuthor(
        "YouTube Juntos",
        "https://cdn.discordapp.com/emojis/749289646097432667.png?v=1"
      )
      .setColor("#FF0000").setDescription(`
      Usando **YouTube Juntos** você pode assistir youtube com seus amigos em um canal de voz. Clique em *Junte o YouTube* para participar!

__**[Join YouTube Together](https://discord.com/invite/${Invite.code})**__

⚠ **Nota:** Isso só funciona no Desktop
`);
    message.channel.send(embed);
  },
  SlashCommand: {
    options: [],
    /**
     *
     * @param {import("../structures/DiscordMusicBot")} client
     * @param {import("discord.js").Message} message
     * @param {string[]} args
     * @param {*} param3
     */
    run: async (client, interaction, args, { GuildDB }) => {
      const guild = client.guilds.cache.get(interaction.guild_id);
      const member = guild.members.cache.get(interaction.member.user.id);

      if (!member.voice.channel)
        return client.sendTime(
          interaction,
          "❌ | Você deve estar em um canal de voz para usar este comando."
        );
      if (
        !member.voice.channel
          .permissionsFor(guild.me)
          .has("CRIANDO_CONVITE_INSTANTANEO")
      )
        return client.sendTime(
          interaction,
          "❌ | **Bot não tem permissão de criar convite**"
        );

      let Invite = await member.voice.channel.activityInvite(
        "755600276941176913"
      ); //Made using discordjs-activity package
      let embed = new MessageEmbed()
        .setAuthor(
          "YouTube Juntos",
          "https://cdn.discordapp.com/emojis/749289646097432667.png?v=1"
        )
        .setColor("#FF0000").setDescription(`
        Usando **YouTube Juntos** você pode assistir youtube com seus amigos em um canal de voz. Clique em *Junte o YouTube* para participar!

__**[Join YouTube Together](https://discord.com/invite/${Invite.code})**__

⚠ **Nota:** Isso só funciona no Desktop
`);
      interaction.send(embed.toJSON());
    },
  },
};
