//====================================================
// Limplimp WhatsApp Bot - settings.js (FIXED 2026)
//====================================================
import fs from "fs";
import path from "path";

const SETTINGS_FILE = path.resolve("./settings.json");
const BANNED_FILE = path.resolve("./banned.json");

const defaultSettings = {
  botname: "Neverbrok3agains Bot",
  ownername: "Neverbrok3agains",
  ownerNumber: ["916009516486@s.whatsapp.net"],
  location: "india",
  debug: false,
  toggles: {
    antilink: false,
    autotyping: false,
    anticall: false,
    antistatusdel: false,
    statussave: false,
    antidel: false,
    antiviewonce: false,
    autoreact: false
    aichat: false,

  }
};

// ================= SAFE JSON LOAD =================
function loadJSON(file, fallback) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
    return structuredClone(fallback);
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf-8"));

    // ✅ ARRAY SAFE (VERY IMPORTANT)
    if (Array.isArray(fallback)) {
      return Array.isArray(parsed) ? parsed : [];
    }

    // ✅ OBJECT SAFE (deep merge toggles)
    return {
      ...fallback,
      ...parsed,
      toggles: {
        ...fallback.toggles,
        ...(parsed.toggles || {})
      }
    };
  } catch (e) {
    console.error("❌ Failed to load", file, e);
    return structuredClone(fallback);
  }
}

// ================= EXPORTS =================
export const settings = loadJSON(SETTINGS_FILE, defaultSettings);
export const bannedUsers = loadJSON(BANNED_FILE, []);

// ================= SAVE TOGGLE =================
settings.saveToggle = function (key, value) {
  if (!this.toggles || !(key in this.toggles)) return;
  this.toggles[key] = value;

  fs.writeFileSync(
    SETTINGS_FILE,
    JSON.stringify(
      {
        ...this,
        saveToggle: undefined,
        saveBannedUsers: undefined
      },
      null,
      2
    )
  );
};

// ================= SAVE BANNED USERS =================
settings.saveBannedUsers = function (users) {
  if (!Array.isArray(users)) return;
  fs.writeFileSync(BANNED_FILE, JSON.stringify(users, null, 2));
};
