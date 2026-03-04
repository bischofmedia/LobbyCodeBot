import { Client, GatewayIntentBits } from "discord.js";
import { google } from "googleapis";
import http from "http";

// --- RENDER PORT BINDING ---
const port = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write("Lobby-Bot is active");
  res.end();
}).listen(port, () => {
  console.log(`Web-Server aktiv auf Port ${port}`);
});
// ----------------------------

// --- GOOGLE SHEETS SETUP ---
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = 'LobbyCodes';

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY || './service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

async function findHostRow(hostName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:C`,
  });
  const rows = res.data.values || [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] && rows[i][0].toLowerCase() === hostName.toLowerCase()) {
      return i + 1; // 1-basierte Zeilennummer für die Sheets API
    }
  }
  return null;
}

async function upsertLobbyCode(host, code) {
  const rowNumber = await findHostRow(host);
  if (rowNumber) {
    // Host existiert → nur Code (Spalte C) updaten
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!C${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [[code]] },
    });
    console.log(`Code aktualisiert (Zeile ${rowNumber}): ${host} → ${code}`);
  } else {
    // Host existiert nicht → neue Zeile einfügen
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:C`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [[host, '', code]] },
    });
    console.log(`Neuer Eintrag: ${host} → ${code}`);
  }
}
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
  if (message.channel.name.toLowerCase() !== "lobby-codes") return;

  const text = message.content.trim();
  const codeRegex = /^[A-Za-z0-9]{6}$/;
  if (!codeRegex.test(text)) return;

  const host = message.member ? message.member.displayName : message.author.username;
  const code = text;

  try {
    await upsertLobbyCode(host, code);
  } catch (err) {
    console.error("Google Sheets Fehler:", err.message);
  }
});

client.login(process.env.DISCORD_TOKEN);
