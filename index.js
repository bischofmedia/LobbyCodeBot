import { Client, GatewayIntentBits } from "discord.js";
import axios from "axios";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log("Bot ist online");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.name !== "lobby-codes") return;

  const payload = {
    host: message.author.username,
    discordId: message.author.id,
    message: message.content
  };

  try {
    await axios.post(process.env.MAKE_WEBHOOK_URL, payload);
    console.log("Gesendet:", payload);
  } catch (err) {
    console.error("Fehler:", err.message);
  }
});

client.login(process.env.DISCORD_TOKEN);
