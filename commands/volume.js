const { MessageEmbed } = require("discord.js");
const { TrackUtils } = require("erela.js");

module.exports = {
  name: "volume",
  description: "Verifique ou altere o volume atual",
  usage: "<volume>",
  permissions: {
    channel: ["VER_CANAL", "ENVIAR_MENSAGENS", "ANEXAR_LINKS"],
    member: [],
  },
  aliases : ["vol", "v"],
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
        "❌ | **Nada está tocando agora...**"
      );
    if (!args[0])
      return client.sendTime(
        message.channel,
        `🔉 | Volume atual \`${player.volume}\`.`
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
    if (!parseInt(args[0]))
      return client.sendTime(
        message.channel,
        `**Por favor, escolha um número entre** \`1 - 100\``
      );
    let vol = parseInt(args[0]);
    if (vol < 0 || vol > 200) {
      return client.sendTime(
        message.channel,
        "❌ | **Por favor, escolha um número entre `1-200`**"
      );
    } else {
      player.setVolume(vol);
      client.sendTime(
        message.channel,
        `🔉 | **Volume escolhido** \`${player.volume}\``
      );
    }
  },
  SlashCommand: {
    options: [
      {
        name: "quantidade",
        value: "quantidade",
        type: 4,
        required: false,
        description: "Digite um volume de 1-200. Padrão é 100.",
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
      const guild = client.guilds.cache.get(interaction.guild_id);
      const member = guild.members.cache.get(interaction.member.user.id);

      if (!member.voice.channel)
        return client.sendTime(
          interaction,
          "❌ | Você deve estar em um canal de voz para usar este comando."
        );
      if (
        guild.me.voice.channel &&
        !guild.me.voice.channel.equals(member.voice.channel)
      )
        return client.sendTime(
          interaction,
          ":x: | **Você deve estar no mesmo canal de voz que eu para usar este comando!**"
        );
      let player = await client.Manager.get(interaction.guild_id);
      if (!player)
        return client.sendTime(
          interaction,
          "❌ | **Nada está tocando agora...**"
        );
      if (!args[0].value)
        return client.sendTime(
          interaction,
          `🔉 | Volume atual \`${player.volume}\`.`
        );
      let vol = parseInt(args[0].value);
      if (!vol || vol < 1 || vol > 200)
        return client.sendTime(
          interaction,
          `**Por favor, escolha um número entre** \`1 - 200\``
        );
      player.setVolume(vol);
      client.sendTime(interaction, `🔉 | Volume definido para \`${player.volume}\``);
    },
  },
};
