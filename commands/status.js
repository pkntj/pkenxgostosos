const { MessageEmbed } = require("discord.js");
require("moment-duration-format");
const cpuStat = require("cpu-stat");
const moment = require("moment");

module.exports = {
  name: "status",
  description: "obter informações do bot",
  usage: "",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["about", "ping", "info"],
  /**
   *
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {import("discord.js").Message} message
   * @param {string[]} args
   * @param {*} param3
   */
  run: async (client, message) => {
    const { version } = require("discord.js");
    cpuStat.usagePercent(async function (err, percent, seconds) {
      if (err) {
        return console.log(err);
      }
      const duration = moment
        .duration(message.client.uptime)
        .format(" D[d], H[h], m[m]");

      const embed = new MessageEmbed();
      embed.setColor(client.botconfig.EmbedColor);
      embed.setTitle(`Stats from \`${client.user.username}\``);
      embed.addFields(
        {
          name: ":ping_pong: Ping",
          value: `┕\`${Math.round(client.ws.ping)}ms\``,
          inline: true,
        },
        {
          name: ":clock1: Tempo de atividade",
          value: `┕\`${duration}\``,
          inline: true,
        },
        {
          name: ":file_cabinet: Memória",
          value: `┕\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
            2
          )}mb\``,
          inline: true,
        }
      );

      embed.addFields(
        {
          name: ":homes: Servidores",
          value: `┕\`${client.guilds.cache.size}\``,
          inline: true,
        },
        {
          name: ":busts_in_silhouette: Users",
          value: `┕\`${client.users.cache.size}\``,
          inline: true,
        },
        {
          name: ":control_knobs: Latência da API",
          value: `┕\`${message.client.ws.ping}ms\``,
          inline: true,
        }
      );
      embed.addFields(
        {
          name: ":robot: Versão",
          value: `┕\`v${require("../package.json").version}\``,
          inline: true,
        },
        {
          name: ":blue_book: Discord.js",
          value: `┕\`v${version}\``,
          inline: true,
        },
        {
          name: ":green_book: Node",
          value: `┕\`${process.version}\``,
          inline: true,
        }
      );

      return message.channel.send(embed);
    });
  },
  SlashCommand: {
    /**
     *
     * @param {import("../structures/DiscordMusicBot")} client
     * @param {import("discord.js").Message} message
     * @param {string[]} args
     * @param {*} param3
     */
    run: async (client, interaction) => {
      const { version } = require("discord.js");
      cpuStat.usagePercent(async function (err, percent, seconds) {
        if (err) {
          return console.log(err);
        }
        const duration = moment
          .duration(client.uptime)
          .format(" D[d], H[h], m[m]");

        const embed = new MessageEmbed();
        embed.setColor(client.botconfig.EmbedColor);
        embed.setTitle(`Stats from \`${client.user.username}\``);
        embed.addFields(
          {
            name: ":ping_pong: ping",
            value: `┕\`${Math.round(client.ws.ping)}ms\``,
            inline: true,
          },
          {
            name: ":clock1: Tempo de atividade",
            value: `┕\`${duration}\``,
            inline: true,
          },
          {
            name: ":file_cabinet: Memória",
            value: `┕\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
              2
            )}mb\``,
            inline: true,
          }
        );

        embed.addFields(
          {
            name: ":homes: Servidores",
            value: `┕\`${client.guilds.cache.size}\``,
            inline: true,
          },
          {
            name: ":busts_in_silhouette: Usuários",
            value: `┕\`${client.users.cache.size}\``,
            inline: true,
          },
          {
            name: ":control_knobs: Latência da API",
            value: `┕\`${client.ws.ping}ms\``,
            inline: true,
          }
        );
        embed.addFields(
          {
            name: ":robot: Versão",
            value: `┕\`v${require("../package.json").version}\``,
            inline: true,
          },
          {
            name: ":blue_book: discord.js",
            value: `┕\`v${version}\``,
            inline: true,
          },
          {
            name: ":green_book: Node",
            value: `┕\`${process.version}\``,
            inline: true,
          }
        );

        return interaction.send(embed);
      });
    },
  },
};
