import { Client, GatewayIntentBits } from "discord.js";
import axios from "axios";
import http from "http"; // Erforderlich für Render

// --- RENDER PORT BINDING ---
// Dieser Teil sagt Render: "Ich bin wach!" und verhindert den Timeout.
const port = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write("Lobby-Bot is active");
  res.end();
}).listen(port, () => {
  console.log(`Web-Server aktiv auf Port ${port}`);
});
// ----------------------------

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
  
  // Wichtig: toLowerCase(), falls Discord den Namen groß schreibt
  if (message.channel.name.toLowerCase() !== "lobby-codes") return;

  const text = message.content.trim();

  // REGEX: genau 6 Zeichen, nur Buchstaben/Zahlen
  const codeRegex = /^[A-Za-z0-9]{6}$/;

  if (!codeRegex.test(text)) {
    // Optional: Logge das nur für dich zur Diagnose
    return;
  }

  const payload = {
    host: message.member ? message.member.displayName : message.author.username,
    code: text,
    discordId: message.author.id
  };

  try {
    await axios.post(process.env.MAKE_WEBHOOK_URL, payload);
    console.log("Gültiger Code gesendet:", payload);
  } catch (err) {
    console.error("Webhook-Fehler:", err.message);
  }
});

client.login(process.env.DISCORD_TOKEN);