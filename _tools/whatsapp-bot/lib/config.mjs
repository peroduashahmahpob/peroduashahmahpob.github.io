// Semua tetapan datang dari Environment variables di Netlify (Site configuration > Environment variables).
const env = (k, d = "") => (process.env[k] ?? d).trim();

export const cfg = {
  // Rahsia & kunci (WAJIB)
  webhookToken: () => env("WEBHOOK_TOKEN"),            // rentetan rawak panjang, diletak dalam URL webhook (?token=...)
  zernioKey: () => env("ZERNIO_API_KEY"),
  zernioSecret: () => env("ZERNIO_WEBHOOK_SECRET"),    // pilihan: jika diisi, tandatangan X-Zernio-Signature disemak
  telegramToken: () => env("TELEGRAM_BOT_TOKEN"),
  telegramChatId: () => env("TELEGRAM_CHAT_ID"),        // chat id anda sendiri (bot beritahu bila anda taip /start)
  telegramSecret: () => env("TELEGRAM_SECRET"),         // rentetan rawak, Telegram hantar balik dalam header

  // Tingkah laku bot
  mode: () => env("BOT_MODE", "draft").toLowerCase(),   // draft | auto | hybrid
  autoHours: () => env("AUTO_HOURS", "21-9"),           // hybrid: auto-balas dalam julat jam ini (waktu Malaysia)
  humanPauseHours: () => Number(env("HUMAN_PAUSE_HOURS", "12")),
  model: () => env("BOT_MODEL", "claude-opus-5-5"),
  advisorName: () => env("ADVISOR_NAME", "Shah"),
  siteUrl: () => env("SITE_URL", "https://teamshahmahpob.netlify.app").replace(/\/+$/, ""),
  testNumbers: () => env("TEST_NUMBERS").split(/[,\s]+/).map((s) => s.replace(/\D/g, "")).filter(Boolean),
};

// Jam semasa di Malaysia (0-23)
export function myHour(now = new Date()) {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kuala_Lumpur", hour: "2-digit", hour12: false }).format(now)) % 24;
}

// "21-9" -> true jika jam dalam julat (boleh melintasi tengah malam)
export function inHours(range, hour) {
  const m = /^(\d{1,2})\s*-\s*(\d{1,2})$/.exec(range || "");
  if (!m) return false;
  const a = +m[1], b = +m[2];
  return a <= b ? hour >= a && hour < b : hour >= a || hour < b;
}

// Mod sebenar untuk mesej ini: "auto" atau "draft"
export function effectiveMode(now = new Date()) {
  const m = cfg.mode();
  if (m === "auto") return "auto";
  if (m === "hybrid") return inHours(cfg.autoHours(), myHour(now)) ? "auto" : "draft";
  return "draft";
}
