require("dotenv").config();

const http = require("http");
const { Client, GatewayIntentBits } = require("discord.js");
const Groq = require("groq-sdk");

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("DonAI bot is running!");
}).listen(PORT, () => {
  console.log(`Web server pornit pe portul ${PORT}`);
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("clientReady", () => {
  console.log(`Bot online: ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  console.log("Mesaj primit:", message.content);

  if (message.author.bot) return;
  if (!message.content.startsWith("!ai")) return;

  const intrebare = message.content.slice(3).trim();

  if (!intrebare) {
    return message.reply("Scrie o întrebare după !ai");
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "Răspunde doar în limba română. Fii clar, prietenos și util.",
        },
        {
          role: "user",
          content: intrebare,
        },
      ],
    });

    const raspuns = completion.choices[0].message.content;
    await message.reply(raspuns.substring(0, 1900));
  } catch (err) {
    console.error("EROARE GROQ:", err);
    await message.reply("Eroare la Groq. Verifică logurile din Render.");
  }
});

client.login(process.env.DISCORD_TOKEN);