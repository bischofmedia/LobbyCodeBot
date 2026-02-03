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
  console.log(`Eingeloggt als ${client.user.tag}! Ich warte auf Nachrichten...`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.name !== "lobby-codes") return;

  const text = message.content.trim();

  // REGEX: genau 6 Zeichen, nur Buchstaben/Zahlen
  const codeRegex = /^[A-Za-z0-9]{6}$/;

  if (!codeRegex.test(text)) {
    console.log("Kein gültiger Code:", text);
    return;
  }

  const payload = {
    host: message.author.username,
    code: text
  };

  try {
    await axios.post(process.env.MAKE_WEBHOOK_URL, payload);
    console.log("Gültiger Code gesendet:", payload);
  } catch (err) {
    console.error("Webhook-Fehler:", err.message);
  }
});

client.login(process.env.DISCORD_TOKEN);