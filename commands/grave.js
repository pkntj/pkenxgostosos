const { MessageEmbed } = require("discord.js");
const { TrackUtils } = require("erela.js");
const levels = {
  nenhum: 0.0,
  baixo: 0.1,
  médio: 0.3,
  alto: 0.5,
};
module.exports = {
  name: "grave",
  description: "Permite aumentar o efeito de áudio de aumento de graves",
  usage: "<nenhum|baixo|médio|alto>",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["bb", "bass"],
  /**
   *
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {import("discord.js").Message} message
   * @param {string[]} args
   * @param {*} param3
   */
  run: async (client, message, args, { GuildDB }) => {
    let player = await client.Manager.get(message.guild.id);
    if (!player)
      return client.sendTime(
        message.channel,
        "❌ | **Nada está tocando agora....**"
      );
    if (!message.member.voice.channel)
      return client.sendTime(
        message.channel,
        "❌ | **Você deve estar em um canal de voz para usar este comando!**"
      );
    if (
      message.guild.me.voice.channel &&
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    )
      return client.sendTime(
        message.channel,
        ":x: | **Você deve estar no mesmo canal de voz que eu para usar este comando!**"
      );

    if (!args[0])
      return client.sendTime(
        message.channel,
        "**Por favor, forneça um nível de grave. \nNíveis disponíveis:** `nenhum`, `baixo`, `médio`, `alto`"
      ); //if the user do not provide args [arguments]

    let level = "none";
    if (args.length && args[0].toLowerCase() in levels)
      level = args[0].toLowerCase();

    player.setEQ(
      ...new Array(3)
        .fill(null)
        .map((_, i) => ({ band: i, gain: levels[level] }))
    );

    return client.sendTime(
      message.channel,
      `✅ | **Nível grave definido para** \`${level}\``
    );
  },
  SlashCommand: {
    options: [
      {
        name: "Nível",
        description: "Por favor, forneça um nível de grave. \nNíveis disponíveis:** `nenhum`, `baixo`, `médio`, `alto`",
        value: "[nível]",
        type: 3,
        required: true,
      },
    ],
    /**
     *
     * @param {import("../structures/DiscordMusicBot")} client
     * @param {import("discord.js").Message} message
     * @param {string[]} args
     * @param {*} param3
     */

    run: async (client, interaction, args, { GuildDB }) => {
      const levels = {
        nenhum: 0.0,
        baixo: 0.1,
        médio: 0.3,
        alto: 0.5,
      };

      let player = await client.Manager.get(interaction.guild_id);
      const guild = client.guilds.cache.get(interaction.guild_id);
      const member = guild.members.cache.get(interaction.member.user.id);
      const voiceChannel = member.voice.channel;
      if (!player)
        return client.sendTime(
          interaction,
          "❌ | **Nada está tocando agora....**"
        );
      if (!member.voice.channel)
        return client.sendTime(
          interaction,
          "❌ | **Você deve estar no mesmo canal de voz que eu para usar este comando.**"
        );
      if (
        guild.me.voice.channel &&
        !guild.me.voice.channel.equals(voiceChannel)
      )
        return client.sendTime(
          interaction,
          ":x: | **Você deve estar no mesmo canal de voz que eu para usar este comando!**"
        );
      if (!args)
        return client.sendTime(
          interaction,
          "**Por favor, forneça um nível de grave. \nNíveis disponíveis:** `nenhum`, `baixo`, `médio`, `alto`"
        ); //if the user do not provide args [arguments]

      let level = "none";
      if (args.length && args[0].value in levels) level = args[0].value;

      player.setEQ(
        ...new Array(3)
          .fill(null)
          .map((_, i) => ({ band: i, gain: levels[level] }))
      );

      return client.sendTime(
        interaction,
        `✅ | **Defina o nível de grave para** \`${level}\``
      );
    },
  },
};
