const { MessageEmbed, Message } = require("discord.js");
const { TrackUtils } = require("erela.js");
const _ = require("lodash");
const prettyMilliseconds = require("pretty-ms");

module.exports = {
  name: "procurar",
  description: "Mostrando um resultado de músicas baseadas na consulta de pesquisa",
  usage: "[música]",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["se"],
  /**
   *
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {import("discord.js").Message} message
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
      message.guild.me.voice.channel &&
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    )
      return client.sendTime(
        message.channel,
        ":x: | **Você deve estar no mesmo canal de voz que eu para usar este comando!**"
      );

    let SearchString = args.join(" ");
    if (!SearchString)
      return client.sendTime(
        message.channel,
        `**Usando - **\`${GuildDB.prefix}pesquisar [query]\``
      );
    let CheckNode = client.Manager.nodes.get(client.botconfig.Lavalink.id);
    if (!CheckNode || !CheckNode.connected) {
      return client.sendTime(
        message.channel,
        "❌ | **Lavalink não conectado!**"
      );
    }
    const player = client.Manager.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: client.botconfig.ServerDeafen,
      volume: client.botconfig.DefaultVolume,
    });

    if (player.state != "CONECTADO") await player.connect();

    let Searched = await player.search(SearchString, message.author);
    if (Searched.loadType == "Sem_resultados")
      return client.sendTime(
        message.channel,
        "Sem resultados para " + SearchString
      );
    else {
      Searched.tracks = Searched.tracks.map((s, i) => {
        s.index = i;
        return s;
      });
      let songs = _.chunk(Searched.tracks, 10);
      let Pages = songs.map((songz) => {
        let MappedSongs = songz.map(
          (s) =>
            `\`${s.index + 1}.\` [${s.title}](${
              s.uri
            }) \nDuração: \`${prettyMilliseconds(s.duration, {
              colonNotation: true,
            })}\``
        );

        let em = new MessageEmbed()
          .setAuthor(
            "Mostrando resultados para " + SearchString,
            client.botconfig.IconURL
          )
          .setColor(client.botconfig.EmbedColor)
          .setDescription(MappedSongs.join("\n\n"));
        return em;
      });

      if (!Pages.length || Pages.length === 1)
        return message.channel.send(Pages[0]);
      else client.Pagination(message, Pages);

      let w = (a) => new Promise((r) => setInterval(r, a));
      await w(500); //waits 500ms cuz needed to wait for the above song search embed to send ._.
      let msg = await message.channel.send(
        "**Digite o número da música que você quer tocar! Expira em '30 segundos'.**"
      );

      let er = false;
      let SongID = await message.channel
        .awaitMessages((msg) => message.author.id === msg.author.id, {
          max: 1,
          errors: ["time"],
          time: 30000,
        })
        .catch(() => {
          er = true;
          msg.edit(
            "**Demorou muito para responder. Execute o comando novamente se você quiser tocar algo!**"
          );
        });
      if (er) return;
      /**@type {Message} */
      let SongIDmsg = SongID.first();

      if (!parseInt(SongIDmsg.content))
        return client.sendTime(
          message.channel,
          "Por favor, envie a ID correta da música"
        );
      let Song = Searched.tracks[parseInt(SongIDmsg.content) - 1];
      if (!Song)
        return client.sendTime(
          message.channel,
          "Sem música encontrada para essa ID"
        );
      player.queue.add(Song);
      if (!player.playing && !player.paused && !player.queue.size)
        player.play();
      let SongAddedEmbed = new MessageEmbed();
      SongAddedEmbed.setAuthor(`Adicionado ao queue`, client.botconfig.IconURL);
      SongAddedEmbed.setThumbnail(Song.displayThumbnail());
      SongAddedEmbed.setColor(client.botconfig.EmbedColor);
      SongAddedEmbed.setDescription(`[${Song.title}](${Song.uri})`);
      SongAddedEmbed.addField("Autor", `${Song.author}`, true);
      SongAddedEmbed.addField(
        "Duração:",
        `\`${prettyMilliseconds(player.queue.current.duration, {
          colonNotation: true,
        })}\``,
        true
      );
      if (player.queue.totalSize > 1)
        SongAddedEmbed.addField(
          "Posição na queue",
          `${player.queue.size - 0}`,
          true
        );
      message.channel.send(SongAddedEmbed);
    }
  },

  SlashCommand: {
    options: [
      {
        name: "Música",
        value: "Música",
        type: 3,
        required: true,
        description: "Envie o nome correto ou o link da música para pesquisar",
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
          "❌ | **Você deve estar conectado ao canal de voz para usar esse comando.**"
        );
      if (
        guild.me.voice.channel &&
        !guild.me.voice.channel.equals(member.voice.channel)
      )
        return client.sendTime(
          interaction,
          ":x: | **Você deve estar conectado ao canal de voz para usar esse comando!**"
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
        volume: client.botconfig.DefaultVolume,
      });
      if (player.state != "CONECTADO") await player.connect();
      let search = interaction.data.options[0].value;
      let res;

      if (search.match(client.Lavasfy.spotifyPattern)) {
        await client.Lavasfy.requestToken();
        let node = client.Lavasfy.nodes.get(client.botconfig.Lavalink.id);
        let Searched = await node.load(search);

        switch (Searched.loadType) {
          case "FALHA_NO_CARREGAMENTO":
            if (!player.queue.current) player.destroy();
            return client.sendError(
              interaction,
              `:x: | **Ocorreu um erro ao pesquisar**`
            );

          case "SEM_RESULTADOS":
            if (!player.queue.current) player.destroy();
            return client.sendTime(
              interaction,
              ":x: | **Sem resultados encontrados**"
            );
          case "TRACK_CARREGADA":
            player.queue.add(TrackUtils.build(Searched.tracks[0], member.user));
            if (!player.playing && !player.paused && !player.queue.length)
              player.play();
            return client.sendTime(
              interaction,
              `**Adicionado ao queue:** \`[${Searched.tracks[0].info.title}](${Searched.tracks[0].info.uri}}\`.`
            );

          case "PLAYLIST_CARREGADA":
            let songs = [];
            for (let i = 0; i < Searched.tracks.length; i++)
              songs.push(TrackUtils.build(Searched.tracks[i], member.user));
            player.queue.add(songs);

            if (
              !player.playing &&
              !player.paused &&
              player.queue.totalSize === Searched.tracks.length
            )
              player.play();
            return client.sendTime(
              interaction,
              `**Playlist adicionada ao queue**: \n**${Searched.playlist.name}** \nEnqueued: **${Searched.playlistInfo.length} músicas**`
            );
        }
      } else {
        try {
          res = await player.search(search, member.user);
          if (res.loadType === "FALHA_NO_CARREGAMENTO") {
            if (!player.queue.current) player.destroy();
            throw new Error(res.exception.message);
          }
        } catch (err) {
          return client.sendTime(
            interaction,
            `:x: | **Ocorreu um erro durante a pesquisa:** ${err.message}`
          );
        }
        switch (res.loadType) {
          case "SEM_RESULTADOS":
            if (!player.queue.current) player.destroy();
            return client.sendTime(
              interaction,
              ":x: | **Sem resultados encontrados**"
            );
          case "TRACK_CARREGADA":
            player.queue.add(res.tracks[0]);
            if (!player.playing && !player.paused && !player.queue.length)
              player.play();
            return client.sendTime(
              interaction,
              `**Adicionado ao queue:** \`[${res.tracks[0].title}](${res.tracks[0].uri})\`.`
            );
          case "PLAYLIST_CARREGADA":
            player.queue.add(res.tracks);

            if (
              !player.playing &&
              !player.paused &&
              player.queue.size === res.tracks.length
            )
              player.play();
            return client.sendTime(
              interaction,
              `**Playlist adicionada ao queue**: \n**${res.playlist.name}** \nEnqueued: **${res.playlistInfo.length} músicas**`
            );
          case "PROCURANDO_RESULTADO":
            let max = 10,
              collected,
              filter = (m) =>
                m.author.id === interaction.member.user.id &&
                /^(\d+|end)$/i.test(m.content);
            if (res.tracks.length < max) max = res.tracks.length;

            const results = res.tracks
              .slice(0, max)
              .map(
                (track, index) =>
                  `\`${++index}\` - [${track.title}](${
                    track.uri
                  }) \n\t\`${prettyMilliseconds(track.duration, {
                    colonNotation: true,
                  })}\`\n`
              )
              .join("\n");

            const resultss = new MessageEmbed()
              .setDescription(
                `${results}\n\n\t**Insira o número da música para tocar!**\n`
              )
              .setColor(client.botconfig.EmbedColor)
              .setAuthor(
                `Procurando resultados para ${search}`,
                client.botconfig.IconURL
              );
            interaction.send(resultss);
            try {
              collected = await awaitchannel.awaitMessages(filter, {
                max: 1,
                time: 30e3,
                errors: ["tempo"],
              });
            } catch (e) {
              if (!player.queue.current) player.destroy();
              return awaitchannel.send(
                "❌ | **Você não forneceu uma seleção**"
              );
            }

            const first = collected.first().content;

            if (first.toLowerCase() === "cancelar") {
              if (!player.queue.current) player.destroy();
              return awaitchannel.send("Cancelando pesquisa.");
            }

            const index = Number(first) - 1;
            if (index < 0 || index > max - 1)
              return awaitchannel.send(
                `O número que você forneceu foi maior ou menor que o total da pesquisa. Use - \`(1-${max})\``
              );
            const track = res.tracks[index];
            player.queue.add(track);

            if (!player.playing && !player.paused && !player.queue.length) {
              player.play();
            } else {
              let SongAddedEmbed = new MessageEmbed();
              SongAddedEmbed.setAuthor(
                `Adicionado ao queue`,
                client.botconfig.IconURL
              );
              SongAddedEmbed.setThumbnail(track.displayThumbnail());
              SongAddedEmbed.setColor(client.botconfig.EmbedColor);
              SongAddedEmbed.setDescription(`[${track.title}](${track.uri})`);
              SongAddedEmbed.addField("Autor", track.author, true);
              SongAddedEmbed.addField(
                "Duração",
                `\`${prettyMilliseconds(track.duration, {
                  colonNotation: true,
                })}\``,
                true
              );
              if (player.queue.totalSize > 1)
                SongAddedEmbed.addField(
                  "Posição em queue",
                  `${player.queue.size - 0}`,
                  true
                );
              awaitchannel.send(SongAddedEmbed);
            }
        }
      }
    },
  },
};
