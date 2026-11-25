// Netlify Function: Telegram hantar tekanan butang "Hantar/Abaikan" dan balasan anda ke sini.
import { cfg } from "../lib/config.mjs";
import { tg } from "../lib/telegram.mjs";
import { handleTelegram } from "../lib/handle.mjs";

export default async (req) => {
  if (req.method !== "POST") return new Response("ok", { status: 200 });
  if (!cfg.telegramSecret() || req.headers.get("x-telegram-bot-api-secret-token") !== cfg.telegramSecret()) {
    return new Response("forbidden", { status: 403 });
  }
  const update = await req.json().catch(() => ({}));
  try {
    const r = await handleTelegram(update);
    console.log(JSON.stringify({ update_id: update.update_id, ...r, text: undefined }));
  } catch (e) {
    console.error("handleTelegram gagal:", e);
    const why = String(e.message || e);
    const hint = /131047|24.?hour|window/i.test(why)
      ? "Lebih 24 jam sejak mesej terakhir pelanggan, WhatsApp tak benarkan balasan bebas. Balas dari app WhatsApp Business bila pelanggan mesej semula."
      : why.slice(0, 300);
    const chat = update.callback_query?.message?.chat?.id || update.message?.chat?.id;
    if (update.callback_query) await tg("answerCallbackQuery", { callback_query_id: update.callback_query.id, text: "Gagal hantar ❗" }).catch(() => {});
    if (chat) await tg("sendMessage", { chat_id: chat, text: `❗ Gagal hantar ke WhatsApp.\n${hint}` }).catch(() => {});
  }
  return new Response("ok", { status: 200 }); // sentiasa 200 supaya Telegram tak ulang
};

export const config = { path: "/api/tg-webhook" };
