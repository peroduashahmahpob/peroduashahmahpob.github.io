// Netlify Function: buka sekali di browser untuk sambungkan Telegram dan semak tetapan.
// URL: https://<laman-anda>/api/bot-setup?token=<WEBHOOK_TOKEN>
import { cfg, effectiveMode } from "../lib/config.mjs";
import { tg } from "../lib/telegram.mjs";
import { getKnowledge } from "../lib/knowledge.mjs";

export default async (req) => {
  const url = new URL(req.url);
  if (!cfg.webhookToken() || url.searchParams.get("token") !== cfg.webhookToken()) return new Response("forbidden", { status: 403 });

  const lines = [];
  const check = (ok, label) => lines.push(`${ok ? "✅" : "❌"} ${label}`);
  check(!!cfg.zernioKey(), "ZERNIO_API_KEY");
  check(!!process.env.ANTHROPIC_API_KEY, "ANTHROPIC_API_KEY");
  check(!!cfg.telegramToken(), "TELEGRAM_BOT_TOKEN");
  check(!!cfg.telegramSecret(), "TELEGRAM_SECRET");
  check(!!cfg.telegramChatId(), "TELEGRAM_CHAT_ID (taip /start kepada bot Telegram anda untuk dapatkan)");
  lines.push(`ℹ️ Mod: ${cfg.mode()} (sekarang: ${effectiveMode()}) · Model: ${cfg.model()} · Nombor ujian: ${cfg.testNumbers().join(", ") || "tiada (semua pelanggan)"}`);

  if (cfg.telegramToken() && cfg.telegramSecret()) {
    try {
      await tg("setWebhook", { url: `${url.origin}/api/tg-webhook`, secret_token: cfg.telegramSecret(), allowed_updates: ["message", "callback_query"] });
      check(true, "Telegram disambungkan ke bot");
    } catch (e) { check(false, `Telegram: ${e.message}`); }
  }
  try { const k = await getKnowledge(); check(true, `Data harga dibaca (${k.split("\n").filter((l) => l.startsWith("- ")).length} varian)`); }
  catch (e) { check(false, `Data harga: ${e.message}`); }
  lines.push("", `URL webhook untuk Zernio: ${url.origin}/api/wa-webhook?token=${cfg.webhookToken()}`);
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};

export const config = { path: "/api/bot-setup" };
