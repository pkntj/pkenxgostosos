const { MessageEmbed } = require("discord.js");
const { TrackUtils, Player } = require("erela.js");

module.exports = {
  name: "spularpara",
  description: `Pular para a música escolhida na queue`,
  usage: "<number>",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["st", "pp"],
  /**
   *
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {import("discord.js").Message} message
   * @param {string[]} args
   * @param {*} param3
   */
  run: async (client, message, args, { GuildDB }) => {
    const player = client.Manager.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: client.botconfig.ServerDeafen,
    });

    if (!player)
      return client.sendTime(
        message.channel,
        "❌ | **Nada está tocando agora...**"
      );
    if (!message.member.voice.channel)
      return client.sendTime(
        message.channel,
        "❌ | **Você deve estar no mesmo canal de voz que eu para usar este comando!**"
      );
    if (
      message.guild.me.voice.channel &&
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    )
      return client.sendTime(
        message.channel,
        ":x: | **Você deve estar no mesmo canal de voz que eu para usar este comando!**"
      );

    try {
      if (!args[0])
        return client.sendTime(
          message.channel,
          `**Use**: \`${GuildDB.prefix}pular para [número]\``
        );
      //if the wished track is bigger then the Queue Size
      if (Number(args[0]) > player.queue.size)
        return client.sendTime(
          message.channel,
          `❌ | Essa música não está na fila! Por favor, tente de novo.!`
        );
      //remove all tracks to the jumped song
      player.queue.remove(0, Number(args[0]) - 1);
      //stop the player
      player.stop();
      //Send Success Message
      return client.sendTime(
        message.channel,
        `⏭ Pulado \`${Number(args[0] - 1)}\` músicas`
      );
    } catch (e) {
      console.log(String(e.stack).bgRed);
      client.sendError(message.channel, "Algo deu errado..");
    }
  },
  SlashCommand: {
    options: [
      {
        name: "posição",
        value: "[posição]",
        type: 4,
        required: true,
        description: "Pula para uma música específica na fila",
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
      const voiceChannel = member.voice.channel;
      let awaitchannel = client.channels.cache.get(interaction.channel_id); /// thanks Reyansh for this idea ;-;
      if (!member.voice.channel)
        return client.sendTime(
          interaction,
          "❌ | **Você deve estar em um canal de voz para usar este comando.**"
        );
      if (
        guild.me.voice.channel &&
        !guild.me.voice.channel.equals(member.voice.channel)
      )
        return client.sendTime(
          interaction,
          `:x: | **Você deve estar em um canal de voz para usar este comando!**`
        );
      let CheckNode = client.Manager.nodes.get(client.botconfig.Lavalink.id);
      if (!CheckNode || !CheckNode.connected) {
        return client.sendTime(
          interaction,
          "❌ | **Lavalink não conectado**"
        );
      }

      let player = client.Manager.create({
        guild: interaction.guild_id,
        voiceChannel: voiceChannel.id,
        textChannel: interaction.channel_id,
        selfDeafen: client.botconfig.ServerDeafen,
      });

      try {
        if (!interaction.data.options)
          return client.sendTime(
            interaction,
            `**Use**: \`${GuildDB.prefix}pularpara <número>\``
          );
        let skipTo = interaction.data.options[0].value;
        //if the wished track is bigger then the Queue Size
        if (
          skipTo !== null &&
          (isNaN(skipTo) || skipTo < 1 || skipTo > player.queue.length)
        )
          return client.sendTime(
            interaction,
            `❌ | Essa música não está na fila! Por favor, tente de novo.!`
          );

        player.stop(skipTo);
        //Send Success Message
        return client.sendTime(
          interaction,
          `⏭ Pulado \`${Number(skipTo)}\` música`
        );
      } catch (e) {
        console.log(String(e.stack).bgRed);
        client.sendError(interaction, "Algo deu errado.");
      }
    },
  },
};
