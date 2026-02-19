const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const chatStats = {};
const voiceJoin = {};
const voiceStats = {};

client.once("ready", () => {
  console.log(`Bot beží ako ${client.user.tag}`);
});

client.on("messageCreate", message => {
  if (message.author.bot) return;

  const id = message.author.id;
  chatStats[id] = (chatStats[id] || 0) + 1;

  if (message.content === "!top") {
    const topChat = Object.entries(chatStats)
      .sort((a,b) => b[1]-a[1])
      .slice(0,10);

    const topVoice = Object.entries(voiceStats)
      .sort((a,b) => b[1]-a[1])
      .slice(0,10);

    let text = "🏆 **TOP CHAT**\n";
    for (let [id, count] of topChat) {
      text += `<@${id}> – ${count} správ\n`;
    }

    text += "\n🎙️ **TOP VOICE**\n";
    for (let [id, time] of topVoice) {
      text += `<@${id}> – ${(time/60000).toFixed(1)} min\n`;
    }

    message.channel.send(text);
  }
});

client.on("voiceStateUpdate", (oldState, newState) => {
  const id = newState.id;

  if (!oldState.channel && newState.channel) {
    voiceJoin[id] = Date.now();
  }

  if (oldState.channel && !newState.channel) {
    const start = voiceJoin[id];
    if (!start) return;

    const diff = Date.now() - start;
    voiceStats[id] = (voiceStats[id] || 0) + diff;
    delete voiceJoin[id];
  }
});

client.login(process.env.TOKEN);
