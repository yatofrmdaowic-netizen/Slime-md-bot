import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from "@whiskeysockets/baileys"

import pino from "pino"
import chalk from "chalk"
import readline from "readline"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"

import ytdl from "@distube/ytdl-core"
import ffmpeg from "fluent-ffmpeg"
import ffmpegPath from "ffmpeg-static"
import fetch from "node-fetch"

import { handleCommand } from "./command.js"
import { settings } from "./settings.js"

ffmpeg.setFfmpegPath(ffmpegPath)

//================ CONFIG =================
const SESSION_FOLDER = "./sessions";
const STATUS_FOLDER = "./status";
if (!fs.existsSync(STATUS_FOLDER)) fs.mkdirSync(STATUS_FOLDER);

//================ TERMINAL INPUT =================
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = q => new Promise(res => rl.question(q, res));

//================ BUTTON MENU HELPER =================
function generateButtonMenu(sender) {
    const generalButtons = [
        { buttonId: "!ping", buttonText: { displayText: "🏓 Ping" }, type: 1 },
        { buttonId: "!tagall", buttonText: { displayText: "👥 Tag All" }, type: 1 },
        { buttonId: "!sticker", buttonText: { displayText: "🖼 Sticker" }, type: 1 },
        { buttonId: "!menu", buttonText: { displayText: "📜 Menu" }, type: 1 },
        { buttonId: "!creator", buttonText: { displayText: "👑 Owner" }, type: 1 }
    ];

    const toggleButtons = sender === settings.ownerNumber[0] ? Object.keys(settings.toggles).map(key => {
        const isOn = settings.toggles[key];
        return { buttonId: `!${key}`, buttonText: { displayText: `${isOn ? "🟢" : "🔴"} ${key}` }, type: 1 };
    }) : [];

    return [...generalButtons, ...toggleButtons];
}

//================ START BOT =================
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        auth: state,
        version,
        logger: pino({ level: "silent" }),
        browser: ["Windows","Chrome","120.0.0"],
        printQRInTerminal: false,
        msgRetryCounterCache: new NodeCache(),
        markOnlineOnConnect: true,
        keepAliveIntervalMs:15000,
        connectTimeoutMs:60000,
        syncFullHistory:false
    });

    sock.ev.on("creds.update", saveCreds);

    //================ PAIRING =================
    if (!sock.authState.creds.registered) {
        let phone = await question(chalk.yellow("\n📱 Enter WhatsApp number (no +, no spaces): "));
        phone = phone.replace(/\D/g,"");
        if(phone.length<10){console.log(chalk.red("❌ Invalid number"));process.exit(1);}
        console.log(chalk.cyan("🔐 Initializing secure pairing..."));
        await new Promise(r=>setTimeout(r,2000));
        try{
            const code = await sock.requestPairingCode(phone);
            console.log(chalk.bgGreen.black(" PAIRING CODE "),chalk.bold(code.match(/.{1,4}/g).join("-")));
        }catch(e){console.log(chalk.red("Pairing error:"),e.message);}
    }

    //================ CONNECTION UPDATE =================
    let shown=false;
    sock.ev.on("connection.update",({connection,lastDisconnect})=>{
        if(connection==="open"&&!shown){shown=true;console.log(chalk.green("✅ LINKED DEVICE CONNECTED"));rl.close();}
        if(connection==="connecting"){process.stdout.write(chalk.yellow("🔄 Connecting...\r"));}
        if(connection==="close"){
            if(lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut){
                console.log(chalk.red("❌ Connection closed, reconnecting..."));
                startBot();
            }else{console.log(chalk.red("❌ Device logged out. Delete session and pair again."));}
        }
    });

      // ================= CALL BLOCK PRO =================
sock.ev.on("call", async (calls) => {
  try {
    if (!settings.toggles.anticall) return;

    for (const call of calls) {
      if (call.status === "offer") {

        if (call.from === owner) return; // Ignore owner

        await sock.sendMessage(call.from, {
          text: "🚫 Calls are not allowed.\nYou have been blocked automatically."
        });

        await sock.updateBlockStatus(call.from, "block");
      }
    }
  } catch (err) {
    console.log("Call Block Error:", err.message);
  }
});


// ================= MESSAGE HANDLER PRO =================
sock.ev.on("messages.upsert", async ({ messages, type }) => {
  try {
    if (type !== "notify") return;

    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const sender = msg.key.participant || from;
    const mtype = getContentType(msg.message);
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    // ===== STORE MESSAGE (ANTI DELETE MEMORY) =====
    messageStore.set(msg.key.id, msg);
    if (messageStore.size > 500) {
      const firstKey = messageStore.keys().next().value;
      messageStore.delete(firstKey);
    }

    // ================= AUTO-REACT =================
    if (settings.toggles.autoreact) {
      const reacts = ["🔥", "❤️", "😂", "👍", "😎", "✨"];
      const emoji = reacts[Math.floor(Math.random() * reacts.length)];

      await sock.sendMessage(from, {
        react: { text: emoji, key: msg.key }
      });
    }

    // ================= ANTI-LINK PRO =================
    if (
      isGroup &&
      settings.toggles.antilink &&
      /https?:\/\//i.test(text)
    ) {
      const metadata = await sock.groupMetadata(from);
      const participant = metadata.participants.find(p => p.id === sender);
      const isAdmin = participant?.admin;

      if (!isAdmin && sender !== owner) {

        await sock.sendMessage(from, { delete: msg.key });

        linkCounter[sender] = (linkCounter[sender] || 0) + 1;

        await sock.sendMessage(from, {
          text: `⚠️ Link not allowed!\nStrike ${linkCounter[sender]}/3`
        });

        if (linkCounter[sender] >= 3) {
          await sock.groupParticipantsUpdate(from, [sender], "remove");
          linkCounter[sender] = 0;
        }
      }
    }

    // ================= ANTI-DELETE PRO =================
    if (settings.toggles.antidel && mtype === "protocolMessage") {
      const deletedKey = msg.message.protocolMessage?.key?.id;

      if (deletedKey && messageStore.has(deletedKey)) {
        const originalMsg = messageStore.get(deletedKey);

        await sock.sendMessage(from, {
          text: "🧠 *Anti-Delete Triggered!*\nRecovered message below:"
        });

        await sock.copyNForward(from, originalMsg);
      }
    }

    // ================= ANTI-VIEWONCE PRO =================
    if (
      settings.toggles.antiviewonce &&
      msg.message?.viewOnceMessageV2
    ) {
      const viewOnceMsg = msg.message.viewOnceMessageV2.message;
      await sock.sendMessage(from, viewOnceMsg);
    }

    // ================= STATUS SAVER =================
    if (
      settings.toggles.statussave &&
      from === "status@broadcast"
    ) {
      const file = await sock.downloadMediaMessage(msg);
      fs.writeFileSync(`./status/${Date.now()}.bin`, file);
    }

    // ================= BUTTON HANDLER =================
    if (msg.message?.buttonsResponseMessage) {
      const btnId =
        msg.message.buttonsResponseMessage.selectedButtonId;

      if (btnId.startsWith("!")) {
        const [cmd, ...args] =
          btnId.slice(1).split(/\s+/);

        return handleCommand({
          sock,
          msg,
          from,
          sender,
          isGroup,
          command: cmd.toLowerCase(),
          args
        });
      }
    }

    // ================= COMMAND HANDLER =================
    const prefix = "!";
    if (text.startsWith(prefix)) {
      const [cmd, ...args] =
        text.slice(prefix.length).trim().split(/\s+/);

      return handleCommand({
        sock,
        msg,
        from,
        sender,
        isGroup,
        command: cmd.toLowerCase(),
        args
      });
    }

  } catch (err) {
    console.log("Message Handler Error:", err.message);
  }
});
