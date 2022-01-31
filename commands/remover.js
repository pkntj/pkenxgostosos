const { MessageEmbed } = require("discord.js");
const { TrackUtils } = require("erela.js");

module.exports = {
  name: "remove",
  description: `Remover a música da queue`,
  usage: "[número]",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["rm"],

  /**
   *
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {import("discord.js").Message} message
   * @param {string[]} args
   * @param {*} param3
   */
  run: async (client, message, args, { GuildDB }) => {
    let player = await client.Manager.players.get(message.guild.id);
    const song = player.queue.slice(args[0] - 1, 1);
    if (!player)
      return client.sendTime(
        message.channel,
        "❌ | **Nada está tocando agora...**"
      );
    if (!message.member.voice.channel)
      return client.sendTime(
        message.channel,
        "❌ | **Você deve estar conectado ao canal de voz para usar esse comando!**"
      );
    if (
      message.guild.me.voice.channel &&
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    )
      return client.sendTime(
        message.channel,
        ":x: | **Você deve estar conectado ao canal de voz para usar esse comando!**"
      );

    if (!player.queue || !player.queue.length || player.queue.length === 0)
      return message.channel.send("Não há nada na fila para remover");
    let rm = new MessageEmbed()
      .setDescription(
        `✅ **|** Removida a track **\`${Number(args[0])}\`** da queue!`
      )
      .setColor("GREEN");
    if (isNaN(args[0]))
      rm.setDescription(
        `**Usage - **${client.botconfig.prefix}\`remove [track]\``
      );
    if (args[0] > player.queue.length)
      rm.setDescription(`The queue has only ${player.queue.length} Músicas!`);
    await message.channel.send(rm);
    player.queue.remove(Number(args[0]) - 1);
  },

  SlashCommand: {
    options: [
      {
        name: "track",
        value: "[track]",
        type: 4,
        required: true,
        description: "Remove a música da queue",
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
      let player = await client.Manager.get(interaction.guild_id);
      const guild = client.guilds.cache.get(interaction.guild_id);
      const member = guild.members.cache.get(interaction.member.user.id);
      const song = player.queue.slice(args[0] - 1, 1);
      if (!player)
        return client.sendTime(
          interaction,
          "❌ | **Nada está tocando agora...**"
        );
      if (!member.voice.channel)
        return client.sendTime(
          interaction,
          "❌ | **Você deve estar conectado ao canal para usar esse comando.**"
        );
      if (
        guild.me.voice.channel &&
        !guild.me.voice.channel.equals(member.voice.channel)
      )
        return client.sendTime(
          interaction,
          ":x: | **Você deve estar conectado ao canal para usar esse comando!**"
        );

      if (!player.queue || !player.queue.length || player.queue.length === 0)
        return client.sendTime("❌ | **Nada está tocando agora...**");
      let rm = new MessageEmbed()
        .setDescription(
          `✅ | **Remivda a track** \`${Number(args[0])}\` da queue!`
        )
        .setColor("GREEN");
      if (isNaN(args[0]))
        rm.setDescription(`**Use:** \`${GuildDB.prefix} para remover [track]\``);
      if (args[0] > player.queue.length)
        rm.setDescription(`A queue tem ${player.queue.length} músicas!`);
      await interaction.send(rm);
      player.queue.remove(Number(args[0]) - 1);
    },
  },
};
