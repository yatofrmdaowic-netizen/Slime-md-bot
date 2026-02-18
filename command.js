//====================================================
// Limplimp WhatsApp Bot - command.js (FULL UPDATED)
//====================================================
import fs from "fs";
import axios from "axios";
import { settings, bannedUsers } from "./settings.js";

// ================= STORES =================
const messageStore = new Map();

// ================= DEBUG =================
const debug = (...args) => {
  if (settings.debug) {
    console.log("🐞 DEBUG:", ...args);
  }
};

// ================= AI REPLY PRO =================
import NodeCache from "node-cache";
const aiCooldown = new NodeCache({ stdTTL: 5 }); // 5 sec cooldown per user

async function aiReply(text, sender, isGroup, mentioned) {
  try {

    // 🔒 Toggle Check
    if (!settings.toggles.aichat) return null;

    // 👥 Group Mode → Only reply if mentioned
    if (isGroup && !mentioned) return null;

    // ⏳ Cooldown
    if (aiCooldown.has(sender)) {
      return "⏳ Slow down… I'm still thinking.";
    }
    aiCooldown.set(sender, true);

    const res = await axios.get(
      `https://api.popcat.xyz/chatbot?msg=${encodeURIComponent(text)}&owner=${settings.botname}`
    );

    return res.data.response || "🤖 I have no words.";
  } catch (err) {
    return "🤖 My brain is loading… try again later.";
  }
}
// ================= AUTO AI CHAT =================
if (!text.startsWith("!") && !isGroup || msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(sock.user.id)) {

  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(sock.user.id);

  const reply = await aiReply(text, sender, isGroup, mentioned);

  if (reply) {
    return sock.sendMessage(from, { text: reply }, { quoted: msg });
  }
}

// ================= COMMAND HANDLER =================
export async function handleCommand(ctx) {
  const { sock, msg, from, sender, isGroup, command, args } = ctx;
  const owner = settings.ownerNumber[0];

  debug("CMD:", command, args, "FROM:", sender);

  // ================= AUTO TYPING =================
  if (settings.toggles.autotyping) {
    try {
      await sock.sendPresenceUpdate("composing", from);
      setTimeout(() => sock.sendPresenceUpdate("paused", from), 1200);
    } catch {}
  }

  // ================= BAN CHECK =================
  if (bannedUsers.includes(sender)) {
    return sock.sendMessage(from, {
      text: "🚫 You are banned from using this bot",
    });
  }

  // ================= TEST PRO =================
if (command === "test") {

  const start = Date.now();

  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  const memory = process.memoryUsage().heapUsed / 1024 / 1024;

  const activeToggles = Object.entries(settings.toggles)
    .filter(([_, v]) => v)
    .map(([k]) => `🟢 ${k}`)
    .join("\n") || "None";

  const speed = Date.now() - start;

  return sock.sendMessage(from, {
    text:
`╔═══〔 ✅ SYSTEM TEST 〕═══╗
⚡ Response: ${speed} ms
⏳ Uptime: ${hours}h ${minutes}m ${seconds}s
🧠 RAM Usage: ${memory.toFixed(2)} MB
💻 Platform: ${process.platform}
🟢 Node: ${process.version}

⚙ Active Toggles:
${activeToggles}

✅ Bot is running perfectly!
╚═══════════════════════╝`
  });
}

// ================= OWNER AUTO PANEL =================
if (!isGroup && sender === owner) {

  const ownerGreetings = ["hi", "hello", "hey", "status", "bot"];

  if (ownerGreetings.includes(text.toLowerCase())) {

    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    const enabledToggles = Object.entries(settings.toggles)
      .filter(([_, v]) => v)
      .map(([k]) => `🟢 ${k}`)
      .join("\n") || "No active toggles";

    return sock.sendMessage(from, {
      text:
`╔═══〔 👑 OWNER PANEL 〕═══╗
🤖 Bot: ${settings.botname}
⏳ Uptime: ${hours}h ${minutes}m
🧠 Node: ${process.version}
💻 Platform: ${process.platform}

⚙ Active Features:
${enabledToggles}

✅ Bot is running perfectly.
╚═══════════════════════╝`
    });
  }
}

  // ================= PING PRO =================
if (command === "ping") {

  const start = performance.now();

  const msg = await sock.sendMessage(from, { text: "🏓 Checking speed..." });

  const end = performance.now();
  const speed = (end - start).toFixed(2);

  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  const used = process.memoryUsage();
  const ram = (used.heapUsed / 1024 / 1024).toFixed(2);

  return sock.sendMessage(from, {
    text:
`╔═══〔 🏓 PONG 〕═══╗
⚡ Speed: ${speed} ms
⏳ Uptime: ${hours}h ${minutes}m ${seconds}s
🧠 RAM Usage: ${ram} MB
💻 Platform: ${process.platform}
🟢 Node: ${process.version}
╚═══════════════════╝`,
    quoted: msg
  });
}

// ================= ULTRA MENU v3 =================
if (command === "menu") {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  return sock.sendMessage(from, {
    text:
`╔══════════════════════╗
   🌟 ${settings.botname.toUpperCase()}
╚══════════════════════╝
👑 Owner: ${settings.ownername}
⏳ Uptime: ${hours}h ${minutes}m ${seconds}s
🖥 Platform: ${process.platform}
🟢 Node: ${process.version}
━━━━━━━━━━━━━━━━━━━━

📥 *DOWNLOAD MENU*
━━━━━━━━━━━━━━━━━━━━
!ytmp3   !ytmp4
!ttdl    !igdl
!fbdl    !pindl
!play

━━━━━━━━━━━━━━━━━━━━
👥 *GROUP MANAGEMENT*
━━━━━━━━━━━━━━━━━━━━
!add        !remove
!promote    !demote
!open       !close
!mute       !unmute
!tagall     !listmember
!listadmin  !groupinfo
!revoke

━━━━━━━━━━━━━━━━━━━━
🔍 *STALK MENU*
━━━━━━━━━━━━━━━━━━━━
!igstalk
!githubstalk
!youtubestalk

━━━━━━━━━━━━━━━━━━━━
⚙ *TOOLS MENU*
━━━━━━━━━━━━━━━━━━━━
!sticker   !calc
!translate !ipinfo
!qr        !encode
!decode    !shorturl
!weather   !dns
!currency  !password
!tempmail  !ss

━━━━━━━━━━━━━━━━━━━━
🌸 *ANIME MENU*
━━━━━━━━━━━━━━━━━━━━
!anime
!character
!randomanime
!animequote
!manga
!topanime
!animenews
!waifu
!neko

━━━━━━━━━━━━━━━━━━━━
🤖 *AI SYSTEM*
━━━━━━━━━━━━━━━━━━━━
• Auto AI Chat
• Mention in group to reply

━━━━━━━━━━━━━━━━━━━━
👑 *OWNER CONTROLS*
━━━━━━━━━━━━━━━━━━━━
!antilink
!anticall
!autoreact
!welcome
!antidel
!aichat
!autotyping

━━━━━━━━━━━━━━━━━━━━
🛡 *SECURITY*
━━━━━━━━━━━━━━━━━━━━
• Anti Delete
• Ban System
• Cooldown Protection

━━━━━━━━━━━━━━━━━━━━
✨ Type a command to use feature
`
  });
}

// ================= ADVANCED BUTTON MENU =================
if (command === "buttonmenu") {
  return sock.sendMessage(from, {
    text: `╔═══〔 ${settings.botname} CONTROL PANEL 〕═══╗
Select a category below 👇`,
    footer: "Advanced Bot System",
    buttons: [
      { buttonId: "!downloadmenu", buttonText: { displayText: "📥 Download Menu" }, type: 1 },
      { buttonId: "!groupmenu", buttonText: { displayText: "👥 Group Tools" }, type: 1 },
      { buttonId: "!toolsmenu", buttonText: { displayText: "⚙ Advanced Tools" }, type: 1 },
      { buttonId: "!stalkmenu", buttonText: { displayText: "🔍 Stalk Menu" }, type: 1 },
      { buttonId: "!ownermenu", buttonText: { displayText: "👑 Owner Panel" }, type: 1 }
    ],
    headerType: 1,
  });
}
if (command === "downloadmenu") {
  return sock.sendMessage(from, {
    text:
`📥 *DOWNLOAD COMMANDS*
━━━━━━━━━━━━━━
!ytmp3
!ytmp4
!ttdl
!igdl
!fbdl
!pindl`,
  });
}
if (command === "groupmenu") {
  return sock.sendMessage(from, {
    text:
`👥 *GROUP MANAGEMENT*
━━━━━━━━━━━━━━
!add
!remove
!promote
!demote
!open
!close
!mute
!unmute
!tagall
!listmember
!listadmin
!groupinfo
!revoke`,
  });
}
if (command === "toolsmenu") {
  return sock.sendMessage(from, {
    text:
`⚙ *ADVANCED TOOLS*
━━━━━━━━━━━━━━
!calc
!translate
!ipinfo
!qr
!encode
!decode
!weather
!password
!shorturl
!ss
!tempmail
!dns
!currency`,
  });
}
if (command === "stalkmenu") {
  return sock.sendMessage(from, {
    text:
`🔍 *STALK FEATURES*
━━━━━━━━━━━━━━
!igstalk
!githubstalk
!youtubestalk`,
  });
}
if (command === "ownermenu") {
  return sock.sendMessage(from, {
    text:
`👑 *OWNER TOGGLES*
━━━━━━━━━━━━━━
!antilink
!anticall
!autoreact
!welcome
!antidel
!aichat
!autotyping`,
  });
}

     // =====================================================
  // 👥 ADVANCED GROUP MANAGEMENT 
  // =====================================================

  if (isGroup) {

    const meta = await sock.groupMetadata(from);
    const admins = meta.participants
      .filter(p => p.admin)
      .map(p => p.id);

    const isAdmin = admins.includes(sender);
    const botData = meta.participants.find(p => p.id === sock.user.id);
    const isBotAdmin = botData?.admin;

    // ===== ADMIN CHECK HELPER =====
    const adminOnly = async () => {
      if (!isAdmin)
        return sock.sendMessage(from, { text: "❌ Admin only" });
      if (!isBotAdmin)
        return sock.sendMessage(from, { text: "❌ Bot must be admin" });
      return true;
    };

    // ===== ADD =====
    if (command === "add") {
      if (!(await adminOnly())) return;
      const number = args[0]?.replace(/\D/g, "");
      if (!number)
        return sock.sendMessage(from, { text: "Usage: !add 91xxxxxxxxxx" });

      await sock.groupParticipantsUpdate(
        from,
        [`${number}@s.whatsapp.net`],
        "add"
      );

      return sock.sendMessage(from, { text: "✅ Member added" });
    }

    // ===== REMOVE =====
    if (command === "remove") {
      if (!(await adminOnly())) return;

      const target =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

      if (!target)
        return sock.sendMessage(from, { text: "Tag member to remove" });

      await sock.groupParticipantsUpdate(from, [target], "remove");

      return sock.sendMessage(from, { text: "❌ Member removed" });
    }

    // ===== PROMOTE =====
    if (command === "promote") {
      if (!(await adminOnly())) return;

      const target =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

      if (!target)
        return sock.sendMessage(from, { text: "Tag member to promote" });

      await sock.groupParticipantsUpdate(from, [target], "promote");

      return sock.sendMessage(from, { text: "👑 Promoted to admin" });
    }

    // ===== DEMOTE =====
    if (command === "demote") {
      if (!(await adminOnly())) return;

      const target =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

      if (!target)
        return sock.sendMessage(from, { text: "Tag admin to demote" });

      await sock.groupParticipantsUpdate(from, [target], "demote");

      return sock.sendMessage(from, { text: "⬇️ Admin demoted" });
    }

    // ===== OPEN =====
    if (command === "open") {
      if (!isAdmin)
        return sock.sendMessage(from, { text: "❌ Admin only" });

      await sock.groupSettingUpdate(from, "not_announcement");
      return sock.sendMessage(from, { text: "🔓 Group opened" });
    }

    // ===== CLOSE =====
    if (command === "close") {
      if (!isAdmin)
        return sock.sendMessage(from, { text: "❌ Admin only" });

      await sock.groupSettingUpdate(from, "announcement");
      return sock.sendMessage(from, { text: "🔒 Group closed" });
    }

    // ===== MUTE (Timed Support) =====
    if (command === "mute") {
      if (!(await adminOnly())) return;

      const minutes = parseInt(args[0]);

      await sock.groupSettingUpdate(from, "announcement");

      if (!minutes) {
        return sock.sendMessage(from, {
          text: "🔇 Group muted permanently",
        });
      }

      sock.sendMessage(from, {
        text: `🔇 Group muted for ${minutes} minute(s)`,
      });

      setTimeout(async () => {
        await sock.groupSettingUpdate(from, "not_announcement");
        await sock.sendMessage(from, {
          text: "🔊 Group automatically unmuted",
        });
      }, minutes * 60 * 1000);
    }

    // ===== UNMUTE =====
    if (command === "unmute") {
      if (!(await adminOnly())) return;

      await sock.groupSettingUpdate(from, "not_announcement");
      return sock.sendMessage(from, { text: "🔊 Group unmuted" });
    }

    // ===== TAG ALL =====
    if (command === "tagall") {
      return sock.sendMessage(from, {
        text: "👥 Tagging everyone...",
        mentions: meta.participants.map(p => p.id),
      });
    }

    // ===== LIST MEMBERS =====
    if (command === "listmember") {
      const list = meta.participants
        .map(p => `• ${p.id.split("@")[0]}`)
        .join("\n");

      return sock.sendMessage(from, {
        text: `👥 Members:\n\n${list}`,
      });
    }

    // ===== LIST ADMINS =====
    if (command === "listadmin") {
      const list = meta.participants
        .filter(p => p.admin)
        .map(p => `👑 ${p.id.split("@")[0]}`)
        .join("\n");

      return sock.sendMessage(from, {
        text: `👑 Admins:\n\n${list}`,
      });
    }

    // ===== GROUP INFO =====
    if (command === "groupinfo") {
      return sock.sendMessage(from, {
        text:
`📌 Group Info

📛 Name: ${meta.subject}
👥 Members: ${meta.participants.length}
👑 Admins: ${admins.length}
🆔 ID: ${meta.id}`,
      });
    }

    // ===== REVOKE INVITE =====
    if (command === "revoke") {
      if (!(await adminOnly())) return;

      await sock.groupRevokeInvite(from);

      return sock.sendMessage(from, {
        text: "🔄 Group invite link revoked",
      });
    }
  }

  // ================= STICKER =================
  if (command === "sticker" || command === "s") {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const image = quoted?.imageMessage || msg.message?.imageMessage;
    if (!image) {
      return sock.sendMessage(from, { text: "❌ Reply to an image" });
    }
    const buffer = await sock.downloadMediaMessage(
      quoted ? { message: quoted } : msg
    );
    return sock.sendMessage(from, { sticker: buffer });
  }
// ================= ULTRA DOWNLOAD SYSTEM =================
try {

  // ========= YTMP3 =========
  if (command === "ytmp3") {
    if (!args[0]) return sock.sendMessage(from, { text: "❌ Provide YouTube URL." });
    if (!ytdl.validateURL(args[0])) return sock.sendMessage(from, { text: "❌ Invalid YouTube URL." });

    await sock.sendMessage(from, { text: "⏳ Downloading audio..." });

    const info = await ytdl.getInfo(args[0]);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");
    const filePath = path.join(__dirname, `${Date.now()}.mp3`);

    ffmpeg(ytdl(args[0], { quality: "highestaudio" }))
      .setFfmpegPath(ffmpegPath)
      .audioBitrate(128)
      .save(filePath)
      .on("end", async () => {
        await sock.sendMessage(from, {
          audio: fs.readFileSync(filePath),
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`
        });
        fs.unlinkSync(filePath);
      })
      .on("error", async () => {
        sock.sendMessage(from, { text: "❌ Audio conversion failed." });
      });

    return;
  }

  // ========= YTMP4 =========
  if (command === "ytmp4") {
    if (!args[0]) return sock.sendMessage(from, { text: "❌ Provide YouTube URL." });
    if (!ytdl.validateURL(args[0])) return sock.sendMessage(from, { text: "❌ Invalid YouTube URL." });

    await sock.sendMessage(from, { text: "⏳ Downloading video..." });

    const stream = ytdl(args[0], {
      quality: "highest",
      filter: "audioandvideo"
    });

    return sock.sendMessage(from, {
      video: stream,
      mimetype: "video/mp4",
      fileName: "video.mp4"
    });
  }

  // ========= PLAY (Search + Auto MP3) =========
  if (command === "play") {
    if (!args.length) {
      return sock.sendMessage(from, { text: "❌ Enter song name.\nExample: !play faded alan walker" });
    }

    await sock.sendMessage(from, { text: "🔎 Searching song..." });

    const query = encodeURIComponent(args.join(" "));
    const searchApi = `https://yt-api-limp.vercel.app/search?q=${query}`;

    const res = await fetch(searchApi);
    const data = await res.json();

    if (!data.result || !data.result.length) {
      return sock.sendMessage(from, { text: "❌ Song not found." });
    }

    const video = data.result[0];
    const downloadUrl = `https://yt-api-limp.vercel.app/mp3?url=${video.url}`;

    await sock.sendMessage(from, {
      image: { url: video.thumbnail },
      caption:
`🎵 *Now Playing*
━━━━━━━━━━━━━━
📌 ${video.title}
⏱ ${video.timestamp}
👁 ${video.views}

⬇ Downloading audio...`
    });

    return sock.sendMessage(from, {
      audio: { url: downloadUrl },
      mimetype: "audio/mpeg"
    });
  }

  // ========= SOCIAL DOWNLOADERS =========
  if (["ttdl", "igdl", "fbdl", "pindl"].includes(command)) {

    if (!args[0]) {
      return sock.sendMessage(from, { text: "❌ Please provide a valid URL." });
    }

    await sock.sendMessage(from, { text: "⏳ Processing download..." });

    // TikTok No Watermark
    if (command === "ttdl") {
      const api = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(args[0])}`;
      const res = await fetch(api);
      const data = await res.json();
      const video = data.video?.noWatermark || data.video;

      if (!video) return sock.sendMessage(from, { text: "❌ Video not found." });

      return sock.sendMessage(from, {
        video: { url: video },
        mimetype: "video/mp4",
        caption: "🎵 TikTok Download (No Watermark)"
      });
    }

    // Instagram Carousel
    if (command === "igdl") {
      const api = `https://api.vreden.my.id/api/igdl?url=${encodeURIComponent(args[0])}`;
      const res = await fetch(api);
      const data = await res.json();
      const mediaList = data.result || [];

      if (!mediaList.length) {
        return sock.sendMessage(from, { text: "❌ No media found." });
      }

      for (let media of mediaList) {
        if (media.type === "video") {
          await sock.sendMessage(from, {
            video: { url: media.url },
            mimetype: "video/mp4"
          });
        } else {
          await sock.sendMessage(from, {
            image: { url: media.url }
          });
        }
      }
      return;
    }

    // Facebook
    if (command === "fbdl") {
      const api = `https://api.vreden.my.id/api/fbdl?url=${encodeURIComponent(args[0])}`;
      const res = await fetch(api);
      const data = await res.json();
      const video = data.result?.url;

      if (!video) return sock.sendMessage(from, { text: "❌ Video not found." });

      return sock.sendMessage(from, {
        video: { url: video },
        mimetype: "video/mp4",
        caption: "📘 Facebook Download"
      });
    }

    // Pinterest HD
    if (command === "pindl") {
      const api = `https://api.vreden.my.id/api/pinterestdl?url=${encodeURIComponent(args[0])}`;
      const res = await fetch(api);
      const data = await res.json();
      const image = data.result?.url;

      if (!image) return sock.sendMessage(from, { text: "❌ Image not found." });

      return sock.sendMessage(from, {
        image: { url: image },
        caption: "📌 Pinterest HD Image"
      });
    }
  }

} catch (err) {
  console.log("DOWNLOAD ERROR:", err);
  sock.sendMessage(from, { text: "❌ Download failed. Try again later." });
}

    // ===== YT MP3 =====
    if (command === "ytmp3") {
      return sock.sendMessage(from, {
        audio: { url: media },
        mimetype: "audio/mpeg",
        fileName: "audio.mp3",
      });
    }

    // ===== OTHER VIDEO DOWNLOADS =====
    return sock.sendMessage(from, {
      video: { url: media },
      caption: `✅ Downloaded via ${settings.botname}`,
    });
  }
} catch (err) {
  console.log("Download Error:", err.message);
  return sock.sendMessage(from, {
    text: "❌ Download failed or API error",
  });
}

  // =====================================================
  // 🔥 ADVANCED TOOLS SYSTEM v2
  // =====================================================

  // ===== SAFE CALCULATOR =====
  if (command === "calc") {
    if (!args.length)
      return sock.sendMessage(from, { text: "Usage: !calc 5*10" });

    try {
      const expression = args.join(" ").replace(/[^0-9+\-*/().]/g, "");
      const result = Function(`"use strict";return (${expression})`)();
      return sock.sendMessage(from, { text: `🧮 Result: ${result}` });
    } catch {
      return sock.sendMessage(from, { text: "❌ Invalid math expression" });
    }
  }

  // ===== TRANSLATE =====
  if (command === "translate") {
    if (args.length < 2)
      return sock.sendMessage(from, { text: "Usage: !translate en Hello" });

    const lang = args[0];
    const text = args.slice(1).join(" ");

    try {
      const r = await axios.get(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${lang}`
      );

      return sock.sendMessage(from, {
        text: `🌐 Translation (${lang})\n\n${r.data.responseData.translatedText}`,
      });
    } catch {
      return sock.sendMessage(from, { text: "❌ Translation failed" });
    }
  }

  // ===== IP INFO =====
  if (command === "ipinfo") {
    if (!args[0])
      return sock.sendMessage(from, { text: "Usage: !ipinfo 8.8.8.8" });

    try {
      const r = await axios.get(`http://ip-api.com/json/${args[0]}`);

      return sock.sendMessage(from, {
        text:
`📍 IP Info

🌐 IP: ${r.data.query}
🏳 Country: ${r.data.country}
🏙 City: ${r.data.city}
🛰 ISP: ${r.data.isp}
🕒 Timezone: ${r.data.timezone}`,
      });
    } catch {
      return sock.sendMessage(from, { text: "❌ Failed to fetch IP info" });
    }
  }

  // ===== QR GENERATOR =====
  if (command === "qr") {
    if (!args.length)
      return sock.sendMessage(from, { text: "Usage: !qr text" });

    const qrURL =
      `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(args.join(" "))}`;

    return sock.sendMessage(from, {
      image: { url: qrURL },
      caption: "📷 QR Code Generated",
    });
  }

  // ===== ENCODE =====
  if (command === "encode") {
    if (!args.length)
      return sock.sendMessage(from, { text: "Usage: !encode text" });

    const encoded = Buffer.from(args.join(" ")).toString("base64");
    return sock.sendMessage(from, { text: `🔐 Encoded:\n\n${encoded}` });
  }

  // ===== DECODE =====
  if (command === "decode") {
    if (!args.length)
      return sock.sendMessage(from, { text: "Usage: !decode base64" });

    try {
      const decoded = Buffer.from(args.join(" "), "base64").toString("utf8");
      return sock.sendMessage(from, { text: `🔓 Decoded:\n\n${decoded}` });
    } catch {
      return sock.sendMessage(from, { text: "❌ Invalid Base64 string" });
    }
  }

  // ===== SYSTEM INFO =====
  if (command === "system") {
    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    return sock.sendMessage(from, {
      text:
`📊 System Info

🤖 Bot: ${settings.botname}
🖥 Platform: ${process.platform}
📦 Node: ${process.version}
⏳ Uptime: ${Math.floor(process.uptime()/60)} mins
💾 RAM Used: ${ram} MB`,
    });
  }

  // ===== WEATHER =====
  if (command === "weather") {
    if (!args.length)
      return sock.sendMessage(from, { text: "Usage: !weather city" });

    try {
      const apiKey = "YOUR_OPENWEATHER_API_KEY";
      const city = args.join(" ");

      const r = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
      );

      return sock.sendMessage(from, {
        text:
`🌤 Weather

📍 ${r.data.name}
🌡 Temp: ${r.data.main.temp}°C
💧 Humidity: ${r.data.main.humidity}%
🌬 Wind: ${r.data.wind.speed} m/s
☁ ${r.data.weather[0].description}`,
      });
    } catch {
      return sock.sendMessage(from, { text: "❌ City not found" });
    }
  }

  // ===== PASSWORD GENERATOR =====
  if (command === "password") {
    let length = parseInt(args[0]) || 12;
    if (length < 4) length = 4;
    if (length > 50) length = 50;

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

    let pass = "";
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return sock.sendMessage(from, {
      text: `🔐 Password (${length} chars):\n\n${pass}`,
    });
  }

  // ===== SHORT URL =====
  if (command === "shorturl") {
    if (!args[0])
      return sock.sendMessage(from, {
        text: "Usage: !shorturl https://example.com",
      });

    try {
      const r = await axios.get(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(args[0])}`
      );

      return sock.sendMessage(from, {
        text: `🔗 Short URL:\n\n${r.data}`,
      });
    } catch {
      return sock.sendMessage(from, { text: "❌ Failed to shorten URL" });
    }
  }

  // ===== WEBSITE SCREENSHOT =====
  if (command === "ss" || command === "screenshot") {
    if (!args[0])
      return sock.sendMessage(from, {
        text: "Usage: !ss example.com",
      });

    const website = args[0].startsWith("http")
      ? args[0]
      : "https://" + args[0];

    const screenshot =
      `https://image.thum.io/get/width/1200/crop/800/noanimate/${website}`;

    return sock.sendMessage(from, {
      image: { url: screenshot },
      caption: `🖥 Website Screenshot\n\n${website}`,
    });
  }

  // ===== TEMP MAIL =====
  if (command === "tempmail") {
    try {
      const r = await axios.get(
        "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1"
      );

      return sock.sendMessage(from, {
        text:
`📧 Temporary Email

✉️ ${r.data[0]}

⚠️ Inbox expires automatically`,
      });
    } catch {
      return sock.sendMessage(from, { text: "❌ Temp mail failed" });
    }
  }

  // ===== DNS LOOKUP =====
  if (command === "dns") {
    if (!args[0])
      return sock.sendMessage(from, { text: "Usage: !dns example.com" });

    try {
      const r = await axios.get(
        `https://dns.google/resolve?name=${args[0]}`
      );

      if (!r.data.Answer)
        return sock.sendMessage(from, { text: "❌ No DNS records found" });

      const records = r.data.Answer
        .map(a => `Type ${a.type} → ${a.data}`)
        .join("\n");

      return sock.sendMessage(from, {
        text: `🌐 DNS Lookup\n\n${records}`,
      });
    } catch {
      return sock.sendMessage(from, { text: "❌ DNS lookup failed" });
    }
  }

  // ===== CURRENCY CONVERTER =====
  if (command === "currency") {
    if (args.length < 3)
      return sock.sendMessage(from, {
        text: "Usage: !currency USD EUR 100",
      });

    const fromCur = args[0].toUpperCase();
    const toCur = args[1].toUpperCase();
    const amount = parseFloat(args[2]);

    if (isNaN(amount))
      return sock.sendMessage(from, { text: "❌ Invalid amount" });

    try {
      const r = await axios.get(
        `https://api.exchangerate.host/convert?from=${fromCur}&to=${toCur}&amount=${amount}`
      );

      return sock.sendMessage(from, {
        text: `💱 ${amount} ${fromCur} = ${r.data.result.toFixed(2)} ${toCur}`,
      });
    } catch {
      return sock.sendMessage(from, { text: "❌ Conversion failed" });
    }
  }

  // ================= EDUCATION SYSTEM =================
if (
  [
    "define",
    "wiki",
    "math",
    "convert",
    "element",
    "grammar",
    "country",
    "date",
    "quiz",
    "notes"
  ].includes(command)
) {
  try {

    // ================= DICTIONARY =================
    if (command === "define") {
      const word = args[0];
      if (!word)
        return sock.sendMessage(from, { text: "Usage: !define word" });

      const { data } = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );

      const meaning =
        data[0]?.meanings[0]?.definitions[0]?.definition ||
        "No definition found.";

      return sock.sendMessage(from, {
        text: `📖 Definition of ${word}\n\n${meaning}`
      });
    }

    // ================= WIKIPEDIA =================
    if (command === "wiki") {
      const query = args.join(" ");
      if (!query)
        return sock.sendMessage(from, { text: "Usage: !wiki topic" });

      const { data } = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
      );

      return sock.sendMessage(from, {
        text: `🌍 ${data.title}\n\n${data.extract || "No summary found."}`
      });
    }

    // ================= SAFE MATH (NO EVAL) =================
    if (command === "math") {
      const expression = args.join("");
      if (!expression)
        return sock.sendMessage(from, { text: "Usage: !math 5*10" });

      const { data } = await axios.get(
        `https://api.mathjs.org/v4/?expr=${encodeURIComponent(expression)}`
      );

      return sock.sendMessage(from, {
        text: `➗ Result:\n${expression} = ${data}`
      });
    }

    // ================= UNIT CONVERTER =================
    if (command === "convert") {
      const input = args.join(" ");
      if (!input)
        return sock.sendMessage(from, { text: "Usage: !convert 10 km to m" });

      const { data } = await axios.get(
        `https://api.mathjs.org/v4/?expr=${encodeURIComponent(input)}`
      );

      return sock.sendMessage(from, {
        text: `🧮 Conversion Result:\n${input} = ${data}`
      });
    }

    // ================= PERIODIC TABLE =================
    if (command === "element") {
      const name = args[0];
      if (!name)
        return sock.sendMessage(from, { text: "Usage: !element oxygen" });

      const { data } = await axios.get(
        `https://neelpatel05.pythonanywhere.com/element/atomicname?atomicname=${name}`
      );

      if (!data.name)
        return sock.sendMessage(from, { text: "Element not found." });

      return sock.sendMessage(from, {
        text:
`🧪 ${data.name}
Symbol: ${data.symbol}
Atomic Number: ${data.atomicNumber}
Atomic Mass: ${data.atomicMass}
Group: ${data.groupBlock}`
      });
    }

    // ================= GRAMMAR CHECK =================
    if (command === "grammar") {
      const text = args.join(" ");
      if (!text)
        return sock.sendMessage(from, { text: "Usage: !grammar sentence" });

      const { data } = await axios.post(
        "https://api.languagetool.org/v2/check",
        new URLSearchParams({
          text: text,
          language: "en-US"
        })
      );

      if (!data.matches.length)
        return sock.sendMessage(from, {
          text: "✅ No grammar mistakes found!"
        });

      const mistakes = data.matches
        .slice(0, 5)
        .map(m => `• ${m.message}`)
        .join("\n");

      return sock.sendMessage(from, {
        text: `📝 Grammar Suggestions:\n${mistakes}`
      });
    }

    // ================= COUNTRY INFO =================
    if (command === "country") {
      const name = args.join(" ");
      if (!name)
        return sock.sendMessage(from, { text: "Usage: !country japan" });

      const { data } = await axios.get(
        `https://restcountries.com/v3.1/name/${name}`
      );

      const c = data[0];

      return sock.sendMessage(from, {
        text:
`🌐 ${c.name.common}
Capital: ${c.capital?.[0]}
Region: ${c.region}
Population: ${c.population}
Currency: ${Object.values(c.currencies || {})[0]?.name}`
      });
    }

    // ================= DATE & TIME =================
    if (command === "date") {
      const now = new Date();
      return sock.sendMessage(from, {
        text: `📅 ${now.toDateString()}\n⏰ ${now.toLocaleTimeString()}`
      });
    }

    // ================= QUIZ =================
    if (command === "quiz") {
      const { data } = await axios.get(
        "https://opentdb.com/api.php?amount=1&type=multiple"
      );

      const q = data.results[0];

      const options = [
        ...q.incorrect_answers,
        q.correct_answer
      ].sort(() => Math.random() - 0.5);

      return sock.sendMessage(from, {
        text:
`🎓 Quiz Question:
${q.question}

Options:
${options.map((o,i)=>`${i+1}. ${o}`).join("\n")}`
      });
    }

    // ================= NOTES (WIKI SUMMARY) =================
    if (command === "notes") {
      const topic = args.join(" ");
      if (!topic)
        return sock.sendMessage(from, { text: "Usage: !notes topic" });

      const { data } = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
      );

      return sock.sendMessage(from, {
        text: `📝 Notes on ${topic}\n\n${data.extract || "No information found."}`
      });
    }

  } catch (err) {
    console.error("Education Error:", err.response?.data || err.message);
    return sock.sendMessage(from, {
      text: "❌ Education API error. Try again later."
    });
  }
}

 // ================= NEWS SYSTEM =================
if (
  ["news", "headlines", "searchnews", "category", "crypto", "weathernews"]
    .includes(command)
) {
  try {

    // ================= TOP HEADLINES =================
    if (command === "news" || command === "headlines") {
      const { data } = await axios.get(
        "https://api.spaceflightnewsapi.net/v4/articles/?limit=5"
      );

      const articles = data.results
        .map(
          (a, i) =>
            `${i + 1}. ${a.title}\n📅 ${a.published_at.split("T")[0]}\n🔗 ${a.url}`
        )
        .join("\n━━━━━━━━━━━━━━\n");

      return sock.sendMessage(from, {
        text: `📰 LATEST NEWS\n━━━━━━━━━━━━━━\n${articles}`
      });
    }

    // ================= SEARCH NEWS =================
    if (command === "searchnews") {
      const query = args.join(" ");
      if (!query)
        return sock.sendMessage(from, { text: "Usage: !searchnews keyword" });

      const { data } = await axios.get(
        `https://api.spaceflightnewsapi.net/v4/articles/?search=${encodeURIComponent(query)}`
      );

      if (!data.results.length)
        return sock.sendMessage(from, { text: "No news found." });

      const articles = data.results.slice(0, 5).map(
        (a, i) =>
          `${i + 1}. ${a.title}\n🔗 ${a.url}`
      ).join("\n━━━━━━━━━━━━━━\n");

      return sock.sendMessage(from, {
        text: `🔎 SEARCH RESULTS\n━━━━━━━━━━━━━━\n${articles}`
      });
    }

    // ================= CATEGORY NEWS =================
    if (command === "category") {
      const category = args[0] || "technology";

      const { data } = await axios.get(
        `https://inshorts.deta.dev/news?category=${category}`
      );

      if (!data.data.length)
        return sock.sendMessage(from, { text: "Invalid category." });

      const news = data.data.slice(0, 5).map(
        (n, i) =>
          `${i + 1}. ${n.title}\n📝 ${n.content}\n🔗 ${n.readMoreUrl || "N/A"}`
      ).join("\n━━━━━━━━━━━━━━\n");

      return sock.sendMessage(from, {
        text: `🏷️ ${category.toUpperCase()} NEWS\n━━━━━━━━━━━━━━\n${news}`
      });
    }

    // ================= CRYPTO NEWS =================
    if (command === "crypto") {
      const { data } = await axios.get(
        "https://api.coingecko.com/api/v3/search/trending"
      );

      const coins = data.coins.slice(0, 5).map(
        (c, i) =>
          `${i + 1}. ${c.item.name} (${c.item.symbol})`
      ).join("\n");

      return sock.sendMessage(from, {
        text: `💹 TRENDING CRYPTO\n━━━━━━━━━━━━━━\n${coins}`
      });
    }

    // ================= WEATHER NEWS =================
    if (command === "weathernews") {
      const city = args.join(" ");
      if (!city)
        return sock.sendMessage(from, { text: "Usage: !weathernews london" });

      const { data } = await axios.get(
        `https://wttr.in/${encodeURIComponent(city)}?format=3`
      );

      return sock.sendMessage(from, {
        text: `🌦️ Weather Update:\n${data}`
      });
    }

  } catch (err) {
    console.error("News Error:", err.message);
    return sock.sendMessage(from, {
      text: "❌ News service error. Try again later."
    });
  }
}

// ================= SEARCH SYSTEM =================
if (
  ["google", "image", "lyrics", "github", "npm", "apk", "wiki2"]
    .includes(command)
) {
  try {

    // ================= GOOGLE SEARCH =================
    if (command === "google") {
      const query = args.join(" ");
      if (!query)
        return sock.sendMessage(from, { text: "Usage: !google keyword" });

      const { data } = await axios.get(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`
      );

      return sock.sendMessage(from, {
        text:
`🔎 GOOGLE SEARCH RESULT

📌 ${data.Heading || query}
📝 ${data.Abstract || "No description found."}
🔗 ${data.AbstractURL || "No link available."}`
      });
    }

    // ================= IMAGE SEARCH =================
    if (command === "image") {
      const query = args.join(" ");
      if (!query)
        return sock.sendMessage(from, { text: "Usage: !image cat" });

      const { data } = await axios.get(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=YOUR_UNSPLASH_KEY`
      );

      return sock.sendMessage(from, {
        image: { url: data.urls.regular },
        caption: `🖼 Image result for: ${query}`
      });
    }

    // ================= LYRICS SEARCH =================
    if (command === "lyrics") {
      const query = args.join(" ");
      if (!query)
        return sock.sendMessage(from, { text: "Usage: !lyrics song name" });

      const { data } = await axios.get(
        `https://api.lyrics.ovh/v1/${query}`
      );

      return sock.sendMessage(from, {
        text: `🎵 Lyrics:\n\n${data.lyrics || "Lyrics not found."}`
      });
    }

    // ================= GITHUB USER SEARCH =================
    if (command === "github") {
      const username = args[0];
      if (!username)
        return sock.sendMessage(from, { text: "Usage: !github username" });

      const { data } = await axios.get(
        `https://api.github.com/users/${username}`
      );

      return sock.sendMessage(from, {
        text:
`🐙 GitHub User

👤 ${data.login}
📦 Public Repos: ${data.public_repos}
👥 Followers: ${data.followers}
🔗 ${data.html_url}`
      });
    }

    // ================= NPM SEARCH =================
    if (command === "npm") {
      const pkg = args[0];
      if (!pkg)
        return sock.sendMessage(from, { text: "Usage: !npm package" });

      const { data } = await axios.get(
        `https://registry.npmjs.org/${pkg}`
      );

      return sock.sendMessage(from, {
        text:
`📦 NPM Package

📌 ${data.name}
📝 ${data.description}
🔢 Latest: ${data["dist-tags"].latest}
🔗 https://www.npmjs.com/package/${data.name}`
      });
    }

    // ================= APK SEARCH =================
    if (command === "apk") {
      const query = args.join(" ");
      if (!query)
        return sock.sendMessage(from, { text: "Usage: !apk whatsapp" });

      return sock.sendMessage(from, {
        text:
`📱 APK Search Result

You can download "${query}" from:
🔗 https://apkpure.com/search?q=${encodeURIComponent(query)}`
      });
    }

    // ================= QUICK WIKI SEARCH =================
    if (command === "wiki2") {
      const query = args.join(" ");
      if (!query)
        return sock.sendMessage(from, { text: "Usage: !wiki2 topic" });

      const { data } = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
      );

      return sock.sendMessage(from, {
        text:
`📚 ${data.title}

${data.extract}

🔗 ${data.content_urls.desktop.page}`
      });
    }

  } catch (err) {
    console.error("Search Error:", err.message);
    return sock.sendMessage(from, {
      text: "❌ Search service error. Try again later."
    });
  }
}

// ================= STALKERS PRO MAX =================
try {

  // ===== INSTAGRAM STALK =====
  if (command === "igstalk") {
    if (!args[0])
      return sock.sendMessage(from, { text: "Usage: !igstalk username" });

    const { data } = await axios.get(
      `https://api.popcat.xyz/instagram?user=${args[0]}`,
      { timeout: 10000 }
    );

    if (!data || !data.username)
      return sock.sendMessage(from, { text: "❌ User not found" });

    return sock.sendMessage(from, {
      image: { url: data.profile_pic },
      caption:
`📸 *Instagram Stalker*

👤 Username: ${data.username}
📝 Bio: ${data.bio || "No bio"}
👥 Followers: ${data.followers}
👣 Following: ${data.following}
📸 Posts: ${data.posts}
🔒 Private: ${data.private ? "Yes" : "No"}`
    });
  }

  // ===== GITHUB STALK =====
  if (command === "githubstalk") {
    if (!args[0])
      return sock.sendMessage(from, { text: "Usage: !githubstalk username" });

    const { data } = await axios.get(
      `https://api.github.com/users/${args[0]}`,
      { timeout: 10000 }
    );

    return sock.sendMessage(from, {
      image: { url: data.avatar_url },
      caption:
`🐙 *GitHub Stalker*

👤 Username: ${data.login}
📝 Bio: ${data.bio || "No bio"}
📦 Public Repos: ${data.public_repos}
👥 Followers: ${data.followers}
👣 Following: ${data.following}
📍 Location: ${data.location || "Unknown"}
🔗 Profile: ${data.html_url}`
    });
  }

  // ===== YOUTUBE STALK =====
  if (command === "youtubestalk") {
    if (!args.length)
      return sock.sendMessage(from, { text: "Usage: !youtubestalk channel name" });

    const query = args.join(" ");

    const { data } = await axios.get(
      `https://api.popcat.xyz/youtube?channel=${encodeURIComponent(query)}`,
      { timeout: 10000 }
    );

    if (!data || !data.name)
      return sock.sendMessage(from, { text: "❌ Channel not found" });

    return sock.sendMessage(from, {
      image: { url: data.thumbnail },
      caption:
`📺 *YouTube Stalker*

📛 Name: ${data.name}
👥 Subscribers: ${data.subscribers}
🎥 Videos: ${data.videos}
📅 Created: ${data.created}
🔗 Channel: ${data.url}`
    });
  }

} catch (err) {
  console.log("Stalker Error:", err.message);
  return sock.sendMessage(from, {
    text: "❌ Failed to fetch data. API error or user not found."
  });
}

  // ================= OWNER / TOGGLES =================
  if (settings.toggles.hasOwnProperty(command)) {
    if (sender !== owner) {
      return sock.sendMessage(from, { text: "❌ Owner only" });
    }
    const newValue = !settings.toggles[command];
    settings.saveToggle(command, newValue);
    return sock.sendMessage(from, {
      text: `✅ ${command} ${newValue ? "ON 🟢" : "OFF 🔴"}`,
    });
  }

  // ================= AI AUTO‑REPLY =================
  if (settings.toggles.ai && !command) {
    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text;
    if (text) {
      const reply = await aiReply(text);
      return sock.sendMessage(from, { text: reply });
    }
  }
}

 // ================= ANIME SEARCH =================
const axios = require("axios");
     if (command === "anime") {
      const query = args.join(" ");
      if (!query)
        return sock.sendMessage(from, { text: "Usage: !anime naruto" });

      const { data } = await axios.get(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`
      );

      const anime = data.data[0];
      if (!anime)
        return sock.sendMessage(from, { text: "Anime not found!" });

      return sock.sendMessage(from, {
        image: { url: anime.images.jpg.image_url },
        caption:
`🌸 ${anime.title}
━━━━━━━━━━━━━━
Episodes: ${anime.episodes || "Unknown"}
Status: ${anime.status}
Score: ${anime.score}
Rating: ${anime.rating}

📖 ${anime.synopsis?.slice(0, 300) || "No synopsis"}...`
      });
    }

    // ================= CHARACTER =================
    if (command === "character") {
      const query = args.join(" ");
      if (!query)
        return sock.sendMessage(from, { text: "Usage: !character luffy" });

      const { data } = await axios.get(
        `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=1`
      );

      const char = data.data[0];
      if (!char)
        return sock.sendMessage(from, { text: "Character not found!" });

      return sock.sendMessage(from, {
        image: { url: char.images.jpg.image_url },
        caption:
`🧑 ${char.name}
━━━━━━━━━━━━━━
${char.about?.slice(0, 400) || "No description"}...`
      });
    }

    // ================= RANDOM ANIME =================
    if (command === "randomanime") {
      const { data } = await axios.get(
        `https://api.jikan.moe/v4/random/anime`
      );

      const anime = data.data;

      return sock.sendMessage(from, {
        image: { url: anime.images.jpg.image_url },
        caption:
`🎲 ${anime.title}
Score: ${anime.score}
Episodes: ${anime.episodes}

${anime.synopsis?.slice(0, 300) || "No synopsis"}...`
      });
    }

    // ================= ANIME QUOTE =================
    if (command === "animequote") {
      const { data } = await axios.get(
        "https://animechan.xyz/api/random"
      );

      return sock.sendMessage(from, {
        text:
`💬 "${data.quote}"
— ${data.character}
(${data.anime})`
      });
    }

    // ================= WAIFU =================
    if (command === "waifu") {
      const { data } = await axios.get(
        "https://api.waifu.pics/sfw/waifu"
      );

      return sock.sendMessage(from, {
        image: { url: data.url },
        caption: "💖 Random Waifu"
      });
    }

    // ================= NEKO =================
    if (command === "neko") {
      const { data } = await axios.get(
        "https://api.waifu.pics/sfw/neko"
      );

      return sock.sendMessage(from, {
        image: { url: data.url },
        caption: "🐱 Neko!"
      });
    }

    // ================= MANGA =================
    if (command === "manga") {
      const query = args.join(" ");
      if (!query)
        return sock.sendMessage(from, { text: "Usage: !manga berserk" });

      const { data } = await axios.get(
        `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=1`
      );

      const manga = data.data[0];
      if (!manga)
        return sock.sendMessage(from, { text: "Manga not found!" });

      return sock.sendMessage(from, {
        image: { url: manga.images.jpg.image_url },
        caption:
`📚 ${manga.title}
Volumes: ${manga.volumes || "Unknown"}
Score: ${manga.score}

${manga.synopsis?.slice(0, 300) || "No synopsis"}...`
      });
    }

    // ================= TOP ANIME =================
    if (command === "topanime") {
      const { data } = await axios.get(
        `https://api.jikan.moe/v4/top/anime?limit=5`
      );

      const list = data.data
        .map((a, i) => `${i + 1}. ${a.title} (${a.score})`)
        .join("\n");

      return sock.sendMessage(from, {
        text: `🏆 TOP ANIME\n━━━━━━━━━━━━━━\n${list}`
      });
    }

    // ================= ANIME NEWS =================
    if (command === "animenews") {
      const { data } = await axios.get(
        `https://api.jikan.moe/v4/top/anime?limit=3`
      );

      const news = data.data
        .map(a => `• ${a.title}`)
        .join("\n");

      return sock.sendMessage(from, {
        text: `📰 Trending Anime:\n${news}`
      });
    }

  } catch (err) {
    console.error(err);
    return sock.sendMessage(from, {
      text: "❌ Anime service error. Try again later."
    });
  }
}

    // ================= ANIME SEARCH =================
     if (command === "anime") {
      const query = args.join(" ");
      if (!query)
        return sock.sendMessage(from, { text: "Usage: !anime naruto" });

      const { data } = await axios.get(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`
      );

      const anime = data.data[0];
      if (!anime)
        return sock.sendMessage(from, { text: "Anime not found!" });

      return sock.sendMessage(from, {
        image: { url: anime.images.jpg.image_url },
        caption:
`🌸 ${anime.title}
━━━━━━━━━━━━━━
Episodes: ${anime.episodes || "Unknown"}
Status: ${anime.status}
Score: ${anime.score}
Rating: ${anime.rating}

📖 ${anime.synopsis?.slice(0, 300) || "No synopsis"}...`
      });
    }

    // ================= CHARACTER =================
    if (command === "character") {
      const query = args.join(" ");
      if (!query)
        return sock.sendMessage(from, { text: "Usage: !character luffy" });

      const { data } = await axios.get(
        `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=1`
      );

      const char = data.data[0];
      if (!char)
        return sock.sendMessage(from, { text: "Character not found!" });

      return sock.sendMessage(from, {
        image: { url: char.images.jpg.image_url },
        caption:
`🧑 ${char.name}
━━━━━━━━━━━━━━
${char.about?.slice(0, 400) || "No description"}...`
      });
    }

    // ================= RANDOM ANIME =================
    if (command === "randomanime") {
      const { data } = await axios.get(
        `https://api.jikan.moe/v4/random/anime`
      );

      const anime = data.data;

      return sock.sendMessage(from, {
        image: { url: anime.images.jpg.image_url },
        caption:
`🎲 ${anime.title}
Score: ${anime.score}
Episodes: ${anime.episodes}

${anime.synopsis?.slice(0, 300) || "No synopsis"}...`
      });
    }

    // ================= ANIME QUOTE =================
    if (command === "animequote") {
      const { data } = await axios.get(
        "https://animechan.xyz/api/random"
      );

      return sock.sendMessage(from, {
        text:
`💬 "${data.quote}"
— ${data.character}
(${data.anime})`
      });
    }

    // ================= WAIFU =================
    if (command === "waifu") {
      const { data } = await axios.get(
        "https://api.waifu.pics/sfw/waifu"
      );

      return sock.sendMessage(from, {
        image: { url: data.url },
        caption: "💖 Random Waifu"
      });
    }

    // ================= NEKO =================
    if (command === "neko") {
      const { data } = await axios.get(
        "https://api.waifu.pics/sfw/neko"
      );

      return sock.sendMessage(from, {
        image: { url: data.url },
        caption: "🐱 Neko!"
      });
    }

    // ================= MANGA =================
    if (command === "manga") {
      const query = args.join(" ");
      if (!query)
        return sock.sendMessage(from, { text: "Usage: !manga berserk" });

      const { data } = await axios.get(
        `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=1`
      );

      const manga = data.data[0];
      if (!manga)
        return sock.sendMessage(from, { text: "Manga not found!" });

      return sock.sendMessage(from, {
        image: { url: manga.images.jpg.image_url },
        caption:
`📚 ${manga.title}
Volumes: ${manga.volumes || "Unknown"}
Score: ${manga.score}

${manga.synopsis?.slice(0, 300) || "No synopsis"}...`
      });
    }

    // ================= TOP ANIME =================
    if (command === "topanime") {
      const { data } = await axios.get(
        `https://api.jikan.moe/v4/top/anime?limit=5`
      );

      const list = data.data
        .map((a, i) => `${i + 1}. ${a.title} (${a.score})`)
        .join("\n");

      return sock.sendMessage(from, {
        text: `🏆 TOP ANIME\n━━━━━━━━━━━━━━\n${list}`
      });
    }

    // ================= ANIME NEWS =================
    if (command === "animenews") {
      const { data } = await axios.get(
        `https://api.jikan.moe/v4/top/anime?limit=3`
      );

      const news = data.data
        .map(a => `• ${a.title}`)
        .join("\n");

      return sock.sendMessage(from, {
        text: `📰 Trending Anime:\n${news}`
      });
    }

  } catch (err) {
    console.error(err);
    return sock.sendMessage(from, {
      text: "❌ Anime service error. Try again later."
    });
  }
}

// ================= SPORTS SYSTEM (FREE APIs) =================
if (
  [
    "livescore",
    "nbascore",
    "cricket",
    "tennis",
    "table",
    "player",
    "team",
    "sportsfact"
  ].includes(command)
) {
  try {

    // ================= FOOTBALL LIVE =================
    if (command === "livescore") {
      const { data } = await axios.get(
        "https://www.scorebat.com/video-api/v3/"
      );

      if (!data.response.length)
        return sock.sendMessage(from, { text: "⚽ No live matches right now." });

      const matches = data.response.slice(0, 5).map((m, i) =>
        `${i + 1}. ${m.title}\n🏆 ${m.competition}\n🔗 ${m.matchviewUrl}`
      ).join("\n━━━━━━━━━━━━━━\n");

      return sock.sendMessage(from, {
        text: `⚽ LIVE FOOTBALL\n━━━━━━━━━━━━━━\n${matches}`
      });
    }

    // ================= NBA LIVE =================
    if (command === "nbascore") {
      const { data } = await axios.get(
        "https://www.balldontlie.io/api/v1/games?per_page=5"
      );

      const games = data.data.map(g =>
        `🏀 ${g.home_team.full_name} ${g.home_team_score}
🆚
${g.visitor_team.full_name} ${g.visitor_team_score}`
      ).join("\n━━━━━━━━━━━━━━\n");

      return sock.sendMessage(from, {
        text: `🏀 NBA SCORES\n━━━━━━━━━━━━━━\n${games}`
      });
    }

    // ================= CRICKET =================
    if (command === "cricket") {
      const { data } = await axios.get(
        "https://api.cricapi.com/v1/currentMatches?apikey=YOUR_FREE_KEY&offset=0"
      );

      if (!data.data)
        return sock.sendMessage(from, { text: "🏏 No cricket data available." });

      const matches = data.data.slice(0, 5).map(m =>
        `🏏 ${m.name}\nStatus: ${m.status}`
      ).join("\n━━━━━━━━━━━━━━\n");

      return sock.sendMessage(from, {
        text: `🏏 LIVE CRICKET\n━━━━━━━━━━━━━━\n${matches}`
      });
    }

    // ================= TENNIS =================
    if (command === "tennis") {
      return sock.sendMessage(from, {
        text: "🎾 Free tennis API is limited.\nYou can integrate api-tennis or sportdataapi."
      });
    }

    // ================= LEAGUE TABLE (OpenFootball) =================
    if (command === "table") {
      const { data } = await axios.get(
        "https://raw.githubusercontent.com/openfootball/football.json/master/2023-24/en.1.json"
      );

      const teams = data.teams.slice(0, 10).map((t, i) =>
        `${i + 1}. ${t.name}`
      ).join("\n");

      return sock.sendMessage(from, {
        text: `🏆 SAMPLE LEAGUE TEAMS\n━━━━━━━━━━━━━━\n${teams}`
      });
    }

    // ================= PLAYER SEARCH (NBA Example) =================
    if (command === "player") {
      const name = args.join(" ");
      if (!name)
        return sock.sendMessage(from, { text: "Usage: !player jordan" });

      const { data } = await axios.get(
        `https://www.balldontlie.io/api/v1/players?search=${encodeURIComponent(name)}`
      );

      if (!data.data.length)
        return sock.sendMessage(from, { text: "Player not found." });

      const p = data.data[0];

      return sock.sendMessage(from, {
        text:
`👤 Player Info
Name: ${p.first_name} ${p.last_name}
Position: ${p.position}
Team: ${p.team.full_name}`
      });
    }

    // ================= TEAM SEARCH (NBA) =================
    if (command === "team") {
      const name = args.join(" ");
      if (!name)
        return sock.sendMessage(from, { text: "Usage: !team lakers" });

      const { data } = await axios.get(
        `https://www.balldontlie.io/api/v1/teams`
      );

      const team = data.data.find(t =>
        t.full_name.toLowerCase().includes(name.toLowerCase())
      );

      if (!team)
        return sock.sendMessage(from, { text: "Team not found." });

      return sock.sendMessage(from, {
        text:
`🏀 Team Info
Name: ${team.full_name}
City: ${team.city}
Conference: ${team.conference}
Division: ${team.division}`
      });
    }

    // ================= SPORTS FACT =================
    if (command === "sportsfact") {
      const facts = [
        "The FIFA World Cup is the most watched sporting event.",
        "Basketball was invented in 1891.",
        "Cricket is the second most popular sport globally.",
        "The Olympics began in ancient Greece.",
        "The fastest red card in football was after 2 seconds."
      ];
      const random = facts[Math.floor(Math.random() * facts.length)];
      return sock.sendMessage(from, {
        text: `🏅 Sports Fact:\n${random}`
      });
    }

  } catch (err) {
    console.error("Sports Error:", err.message);
    return sock.sendMessage(from, {
      text: "❌ Sports service error. Try again later."
    });
  }
}

// ================= LOGO FEATURES =================
if (
  ["logo", "neonlogo", "firelogo", "metalliclogo", "graffitilogo", "3dlogo"].includes(command)
) {
  const text = args.join(" ");
  if (!text) {
    return sock.sendMessage(from, {
      text: `Usage:
!logo YourText
!neonlogo YourText
!firelogo YourText
!metalliclogo YourText
!graffitilogo YourText
!3dlogo YourText`
    });
  }

  try {
    // Style mapping
    const styles = {
      logo: "glow",
      neonlogo: "neon",
      firelogo: "fire",
      metalliclogo: "metallic",
      graffitilogo: "graffiti",
      "3dlogo": "3d"
    };

    const style = styles[command] || "glow";

    // Example API (replace with your own if needed)
    const imageUrl = `https://api.popcat.xyz/textpro?text=${encodeURIComponent(text)}&style=${style}`;

    await sock.sendMessage(from, {
      image: { url: imageUrl },
      caption: `🎨 *${style.toUpperCase()} LOGO*\n\n📝 Text: ${text}`
    });

  } catch (error) {
    console.error("Logo Error:", error);
    return sock.sendMessage(from, {
      text: "❌ Failed to generate logo. Try again later."
    });
  }
}

// ================= FUN FEATURES =================

// Utility
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ================= TRUTH =================
if (command === "truth") {
  const truths = [
    "What is your biggest goal in life?",
    "What is something people don't know about you?",
    "What motivates you the most?",
    "What is your dream destination?",
    "What habit do you want to improve?"
  ];
  return sock.sendMessage(from, {
    text: `🧐 *Truth Question*\n\n${random(truths)}`
  });
}

// ================= DARE =================
if (command === "dare") {
  const dares = [
    "Send a funny selfie 🤳",
    "Send a voice note singing 10 seconds 🎤",
    "Tag someone and say something nice ❤️",
    "Post your favorite emoji 10 times 😂",
    "Change your bio for 10 minutes"
  ];
  return sock.sendMessage(from, {
    text: `🔥 *Dare Challenge*\n\n${random(dares)}`
  });
}

// ================= JOKE =================
if (command === "joke") {
  const jokes = [
    "Why don’t skeletons fight? They don’t have the guts.",
    "Parallel lines have so much in common… it’s a shame they’ll never meet.",
    "Why was the math book sad? Too many problems.",
    "I told my computer I needed a break, now it won’t stop sending KitKats."
  ];
  return sock.sendMessage(from, {
    text: `😂 *Joke*\n\n${random(jokes)}`
  });
}

// ================= COMPLIMENT =================
if (command === "compliment") {
  const compliments = [
    "You're doing better than you think.",
    "You have strong main character energy.",
    "You inspire people around you.",
    "You're built for success.",
    "You make things better just by being there."
  ];
  return sock.sendMessage(from, {
    text: `✨ *Compliment*\n\n${random(compliments)}`
  });
}

// ================= SHIP =================
if (command === "ship") {
  if (!isGroup) {
    return sock.sendMessage(from, { text: "❌ Use this in a group!" });
  }

  if (!groupMetadata?.participants || groupMetadata.participants.length < 2) {
    return sock.sendMessage(from, { text: "Not enough members to ship!" });
  }

  const members = groupMetadata.participants.map(p => p.id);

  let user1 = random(members);
  let user2;

  do {
    user2 = random(members);
  } while (user1 === user2);

  const percent = Math.floor(Math.random() * 101);

  return sock.sendMessage(from, {
    text:
`💘 *Love Match*
@${user1.split("@")[0]} ❤️ @${user2.split("@")[0]}
Compatibility: ${percent}%`,
    mentions: [user1, user2]
  });
}

// ================= RATE =================
if (command === "rate") {
  const text = args.join(" ");
  if (!text) {
    return sock.sendMessage(from, { text: "Usage: !rate something" });
  }

  const score = Math.floor(Math.random() * 101);

  return sock.sendMessage(from, {
    text: `📊 I rate "${text}" ${score}/100`
  });
}

// ================= FLIP TEXT =================
if (command === "fliptext") {
  const text = args.join(" ");
  if (!text) {
    return sock.sendMessage(from, { text: "Usage: !fliptext hello" });
  }

  const flipped = text.split("").reverse().join("");

  return sock.sendMessage(from, { text: flipped });
}

// ================= RANDOM FACT =================
if (command === "fact") {
  const facts = [
    "Octopuses have three hearts.",
    "Honey never spoils.",
    "Sharks existed before trees.",
    "Bananas are berries, but strawberries aren't."
  ];

  return sock.sendMessage(from, {
    text: `📚 *Did You Know?*\n\n${random(facts)}`
  });
}

// ================= PICKUP LINE =================
if (command === "pickup") {
  const lines = [
    "Are you WiFi? Because I'm feeling the connection.",
    "Do you believe in love at first sight?",
    "Are you made of copper and tellurium? Because you're Cu-Te.",
    "Do you have a map? I keep getting lost in your eyes."
  ];

  return sock.sendMessage(from, {
    text: `💘 ${random(lines)}`
  });
}
}

// ================= ECONOMY SYSTEM =================
if (
  [
    "balance",
    "daily",
    "work",
    "deposit",
    "withdraw",
    "gamble",
    "pay",
    "shop",
    "buy",
    "inventory",
    "leaderboard"
  ].includes(command)
) {
  try {

    const dbPath = "./database/economy.json";
    const db = JSON.parse(fs.readFileSync(dbPath));
    const user = sender;

    if (!db[user]) {
      db[user] = {
        wallet: 500,
        bank: 0,
        inventory: []
      };
    }

    // ================= SAVE FUNCTION =================
    const saveDB = () =>
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    // ================= BALANCE =================
    if (command === "balance") {
      return sock.sendMessage(from, {
        text:
`💰 ECONOMY BALANCE

Wallet: ${db[user].wallet}
Bank: ${db[user].bank}`
      });
    }

    // ================= DAILY REWARD =================
    if (command === "daily") {
      const reward = Math.floor(Math.random() * 500) + 200;
      db[user].wallet += reward;
      saveDB();

      return sock.sendMessage(from, {
        text: `🎁 You received ${reward} coins!`
      });
    }

    // ================= WORK =================
    if (command === "work") {
      const earnings = Math.floor(Math.random() * 300) + 100;
      db[user].wallet += earnings;
      saveDB();

      return sock.sendMessage(from, {
        text: `💼 You worked and earned ${earnings} coins!`
      });
    }

    // ================= DEPOSIT =================
    if (command === "deposit") {
      const amount = parseInt(args[0]);
      if (!amount || amount > db[user].wallet)
        return sock.sendMessage(from, { text: "Invalid amount." });

      db[user].wallet -= amount;
      db[user].bank += amount;
      saveDB();

      return sock.sendMessage(from, {
        text: `🏦 Deposited ${amount} coins.`
      });
    }

    // ================= WITHDRAW =================
    if (command === "withdraw") {
      const amount = parseInt(args[0]);
      if (!amount || amount > db[user].bank)
        return sock.sendMessage(from, { text: "Invalid amount." });

      db[user].bank -= amount;
      db[user].wallet += amount;
      saveDB();

      return sock.sendMessage(from, {
        text: `💸 Withdrew ${amount} coins.`
      });
    }

    // ================= GAMBLE =================
    if (command === "gamble") {
      const bet = parseInt(args[0]);
      if (!bet || bet > db[user].wallet)
        return sock.sendMessage(from, { text: "Invalid bet amount." });

      const win = Math.random() < 0.5;

      if (win) {
        db[user].wallet += bet;
        saveDB();
        return sock.sendMessage(from, {
          text: `🎉 You won ${bet} coins!`
        });
      } else {
        db[user].wallet -= bet;
        saveDB();
        return sock.sendMessage(from, {
          text: `💀 You lost ${bet} coins.`
        });
      }
    }

    // ================= PAY =================
    if (command === "pay") {
      const target = args[0];
      const amount = parseInt(args[1]);

      if (!target || !amount || amount > db[user].wallet)
        return sock.sendMessage(from, {
          text: "Usage: !pay number amount"
        });

      if (!db[target]) {
        db[target] = { wallet: 0, bank: 0, inventory: [] };
      }

      db[user].wallet -= amount;
      db[target].wallet += amount;
      saveDB();

      return sock.sendMessage(from, {
        text: `💸 Sent ${amount} coins to ${target}`
      });
    }

    // ================= SHOP =================
    const shopItems = {
      sword: 500,
      shield: 400,
      potion: 200
    };

    if (command === "shop") {
      let list = "🛒 SHOP ITEMS\n\n";
      for (let item in shopItems) {
        list += `${item} - ${shopItems[item]} coins\n`;
      }

      return sock.sendMessage(from, { text: list });
    }

    if (command === "buy") {
      const item = args[0];
      if (!shopItems[item])
        return sock.sendMessage(from, { text: "Item not found." });

      if (db[user].wallet < shopItems[item])
        return sock.sendMessage(from, { text: "Not enough coins." });

      db[user].wallet -= shopItems[item];
      db[user].inventory.push(item);
      saveDB();

      return sock.sendMessage(from, {
        text: `🛍 You bought ${item}!`
      });
    }

    // ================= INVENTORY =================
    if (command === "inventory") {
      return sock.sendMessage(from, {
        text:
`🎒 INVENTORY

${db[user].inventory.length
  ? db[user].inventory.join(", ")
  : "Empty"}`
      });
    }

    // ================= LEADERBOARD =================
    if (command === "leaderboard") {
      const sorted = Object.entries(db)
        .sort((a, b) =>
          (b[1].wallet + b[1].bank) -
          (a[1].wallet + a[1].bank)
        )
        .slice(0, 5);

      let board = "🏆 LEADERBOARD\n\n";

      sorted.forEach((u, i) => {
        board += `${i + 1}. ${u[0]} - ${
          u[1].wallet + u[1].bank
        } coins\n`;
      });

      return sock.sendMessage(from, { text: board });
    }

  } catch (err) {
    console.log("Economy Error:", err.message);
    return sock.sendMessage(from, {
      text: "❌ Economy system error."
    });
  }
}

// ================= ANTI‑DELETE =================
export function storeMessage(msg) {
  if (msg?.key?.id) {
    messageStore.set(msg.key.id, msg);
    setTimeout(() => messageStore.delete(msg.key.id), 10 * 60 * 1000);
  }
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

// ================= WELCOME / GOODBYE =================
export async function groupUpdate(sock, update) {
  if (!settings.toggles.welcome) return;

  const meta = await sock.groupMetadata(update.id);
  for (const user of update.participants) {
    if (update.action === "add") {
      await sock.sendMessage(update.id, {
        text:
`🎉 Welcome @${user.split("@")[0]}!
📍 Group: ${meta.subject}`,
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
