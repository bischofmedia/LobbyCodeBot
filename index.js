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
  // Check 1: Überhaupt eine Nachricht?
  console.log(`Bot sieht Nachricht von ${message.author.username} in Kanal: ${message.channel.name}`);

  if (message.author.bot) return;

  // Check 2: Kanal-Filter (Groß-/Kleinschreibung beachten!)
  if (message.channel.name.toLowerCase() !== "lobby-codes") {
    console.log(`Ignoriere Nachricht, da Kanal "${message.channel.name}" nicht "lobby-codes" ist.`);
    return;
  }

  const payload = {
    host: message.author.username,
    discordId: message.author.id,
    message: message.content
  };

  try {
    await axios.post(process.env.MAKE_WEBHOOK_URL, payload);
    console.log("Erfolgreich an Make gesendet:", payload);
  } catch (err) {
    console.error("Fehler beim Senden an Make:", err.response?.data || err.message);
  }
});

client.login(process.env.DISCORD_TOKEN);