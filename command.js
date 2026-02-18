import axios from "axios";
import NodeCache from "node-cache";
import { settings, bannedUsers } from "./settings.js";

const messageStore = new Map();
const aiCooldown = new NodeCache({ stdTTL: 5 });

const debug = (...args) => {
  if (settings.debug) {
    console.log("🐞 DEBUG:", ...args);
  }
};

async function aiReply(text, sender, isGroup, mentioned) {
  if (!text || !settings.toggles.aichat) return null;
  if (isGroup && !mentioned) return null;

  if (aiCooldown.has(sender)) {
    return "⏳ Slow down… I'm still thinking.";
  }

  aiCooldown.set(sender, true);

  try {
    const res = await axios.get(
      `https://api.popcat.xyz/chatbot?msg=${encodeURIComponent(text)}&owner=${settings.botname}`
    );
    return res.data?.response || "🤖 I have no words.";
  } catch {
    return "🤖 My brain is loading… try again later.";
  }
}

function getIncomingText(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    ""
  );
}

export async function handleCommand(ctx) {
  const { sock, msg, from, sender, isGroup, command, args } = ctx;
  const owner = settings.ownerNumber[0];
  const text = getIncomingText(msg).trim();
  const mentioned = !!msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(
    sock.user.id
  );

  debug("CMD:", command, args, "FROM:", sender);

  if (settings.toggles.autotyping) {
    await sock.sendPresenceUpdate("composing", from).catch(() => {});
    setTimeout(() => sock.sendPresenceUpdate("paused", from).catch(() => {}), 1200);
  }

  if (bannedUsers.includes(sender)) {
    return sock.sendMessage(from, { text: "🚫 You are banned from using this bot" });
  }

  // Auto AI for non-command text
  if (!command && text) {
    const reply = await aiReply(text, sender, isGroup, mentioned);
    if (reply) return sock.sendMessage(from, { text: reply }, { quoted: msg });
  }

  if (command === "test") {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const memory = process.memoryUsage().heapUsed / 1024 / 1024;

    return sock.sendMessage(from, {
      text: `✅ SYSTEM TEST\n⚡ Response: 0 ms\n⏳ Uptime: ${hours}h ${minutes}m ${seconds}s\n🧠 RAM Usage: ${memory.toFixed(2)} MB\n💻 Platform: ${process.platform}\n🟢 Node: ${process.version}`,
    });
  }

  if (command === "ping") {
    const start = performance.now();
    const pingMsg = await sock.sendMessage(from, { text: "🏓 Checking speed..." });
    const speed = (performance.now() - start).toFixed(2);

    return sock.sendMessage(
      from,
      {
        text: `🏓 PONG\n⚡ Speed: ${speed} ms\n⏳ Uptime: ${Math.floor(process.uptime())}s`,
      },
      { quoted: pingMsg }
    );
  }

  if (command === "menu") {
    return sock.sendMessage(from, {
      text: `🌟 ${settings.botname}\n\nCommands:\n!menu !ping !test !sticker\n!anime !character !randomanime\n!topanime !animenews !waifu !neko\n!antilink !anticall !autoreact !welcome !antidel !aichat !autotyping`,
    });
  }

  if (command === "sticker" || command === "s") {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const image = quoted?.imageMessage || msg.message?.imageMessage;

    if (!image) {
      return sock.sendMessage(from, { text: "❌ Reply to an image" });
    }

    const buffer = await sock.downloadMediaMessage(quoted ? { message: quoted } : msg);
    return sock.sendMessage(from, { sticker: buffer });
  }

  // Anime commands
  if (["anime", "character", "randomanime", "topanime", "animenews", "waifu", "neko"].includes(command)) {
    try {
      if (command === "anime") {
        const query = args.join(" ");
        if (!query) return sock.sendMessage(from, { text: "Usage: !anime naruto" });
        const { data } = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`);
        const anime = data.data?.[0];
        if (!anime) return sock.sendMessage(from, { text: "Anime not found!" });
        return sock.sendMessage(from, {
          image: { url: anime.images.jpg.image_url },
          caption: `🌸 ${anime.title}\nEpisodes: ${anime.episodes || "Unknown"}\nScore: ${anime.score}`,
        });
      }

      if (command === "character") {
        const query = args.join(" ");
        if (!query) return sock.sendMessage(from, { text: "Usage: !character luffy" });
        const { data } = await axios.get(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=1`);
        const char = data.data?.[0];
        if (!char) return sock.sendMessage(from, { text: "Character not found!" });
        return sock.sendMessage(from, {
          image: { url: char.images.jpg.image_url },
          caption: `🧑 ${char.name}`,
        });
      }

      if (command === "randomanime") {
        const { data } = await axios.get("https://api.jikan.moe/v4/random/anime");
        const anime = data.data;
        return sock.sendMessage(from, {
          image: { url: anime.images.jpg.image_url },
          caption: `🎲 ${anime.title}\nScore: ${anime.score}`,
        });
      }

      if (command === "topanime" || command === "animenews") {
        const limit = command === "topanime" ? 5 : 3;
        const { data } = await axios.get(`https://api.jikan.moe/v4/top/anime?limit=${limit}`);
        const list = data.data.map((a, i) => `${i + 1}. ${a.title} (${a.score ?? "N/A"})`).join("\n");
        return sock.sendMessage(from, { text: `🏆 TOP ANIME\n${list}` });
      }

      if (command === "waifu" || command === "neko") {
        const { data } = await axios.get(`https://api.waifu.pics/sfw/${command}`);
        return sock.sendMessage(from, {
          image: { url: data.url },
          caption: command === "waifu" ? "💖 Random Waifu" : "🐱 Neko!",
        });
      }
    } catch (err) {
      console.error("Anime service error:", err.message);
      return sock.sendMessage(from, { text: "❌ Anime service error. Try again later." });
    }
  }

  // Toggle commands (owner-only)
  if (Object.prototype.hasOwnProperty.call(settings.toggles, command)) {
    if (sender !== owner) return sock.sendMessage(from, { text: "❌ Owner only" });
    const newValue = !settings.toggles[command];
    settings.saveToggle(command, newValue);
    return sock.sendMessage(from, { text: `✅ ${command} ${newValue ? "ON 🟢" : "OFF 🔴"}` });
  }

  if (!isGroup && sender === owner && ["hi", "hello", "hey", "status", "bot"].includes(text.toLowerCase())) {
    return sock.sendMessage(from, {
      text: `👑 OWNER PANEL\n🤖 Bot: ${settings.botname}\n🧠 Node: ${process.version}\n💻 Platform: ${process.platform}`,
    });
  }
}

export function storeMessage(msg) {
  if (!msg?.key?.id) return;
  messageStore.set(msg.key.id, msg);
  setTimeout(() => messageStore.delete(msg.key.id), 10 * 60 * 1000);
}

export async function restoreDeleted(sock, update) {
  if (!settings.toggles.antidel) return;

  const old = messageStore.get(update.key.id);
  if (!old) return;

  const from = update.key.remoteJid;
  const text =
    old.message?.conversation ||
    old.message?.extendedTextMessage?.text;

  if (text) {
    await sock.sendMessage(from, {
      text: `🗑️ *Deleted message restored:*\n\n${text}`,
    });
  }
}

export async function groupUpdate(sock, update) {
  if (!settings.toggles.welcome) return;

  const meta = await sock.groupMetadata(update.id);

  for (const user of update.participants) {
    if (update.action === "add") {
      await sock.sendMessage(update.id, {
        text: `🎉 Welcome @${user.split("@")[0]}!\n📍 Group: ${meta.subject}`,
        mentions: [user],
      });
    }

    if (update.action === "remove") {
      await sock.sendMessage(update.id, {
        text: `👋 Goodbye @${user.split("@")[0]}`,
        mentions: [user],
      });
    }
  }
}
