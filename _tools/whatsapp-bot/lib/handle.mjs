// Logik utama (diasingkan dari Netlify supaya boleh diuji).
import { cfg, effectiveMode } from "./config.mjs";
import { getKnowledge } from "./knowledge.mjs";
import { draftReply } from "./brain.mjs";
import * as zernio from "./zernio.mjs";
import { tg, draftCard, draftButtons, parseCard } from "./telegram.mjs";

const defaults = { zernio, tg, getKnowledge, draftReply, now: () => new Date() };

const msgTime = (m) => Date.parse(m.sentAt || m.createdAt || "") || 0;

// Adakah advisor sendiri (app telefon / inbox Zernio) baru balas perbualan ini?
export function humanActive(history, pauseHours, now = new Date()) {
  const lastOut = [...history].reverse().find((m) => m.direction === "outgoing");
  if (!lastOut || lastOut.sentVia === "api") return false;
  return now.getTime() - msgTime(lastOut) < pauseHours * 3600_000;
}

async function notify(d, text, extra = {}) {
  if (!cfg.telegramChatId()) return;
  try { await d.tg("sendMessage", { chat_id: cfg.telegramChatId(), text, ...extra }); } catch (e) { console.error(e); }
}

// Dipanggil untuk setiap webhook Zernio. Pulangkan ringkasan (untuk log & ujian).
export async function handleZernio(payload, store, deps = {}) {
  const d = { ...defaults, ...deps };
  if (payload?.test) { await notify(d, "✅ Ujian webhook Zernio diterima. Sambungan OK."); return { done: "test" }; }
  if (payload?.event !== "message.received") return { skip: "bukan mesej masuk" };
  const msg = payload.message || {}, conv = payload.conversation || {}, acc = payload.account || {};
  if (msg.platform !== "whatsapp" || msg.direction !== "incoming") return { skip: "bukan WhatsApp masuk" };
  if (msg.metadata?.standby) return { skip: "perbualan dikawal app lain" };

  const phone = String(conv.participantId || "").replace(/\D/g, "");
  const allow = cfg.testNumbers();
  if (allow.length && !allow.includes(phone)) return { skip: "bukan nombor ujian" };

  const key = `evt-${payload.id || msg.id}`;
  if (await store.get(key)) return { skip: "sudah diproses" };

  const history = await d.zernio.recentMessages(msg.conversationId || conv.id);
  // Pastikan mesej terbaru ada dalam sejarah (kadang-kadang webhook sampai dulu).
  if (!history.some((m) => m.id === msg.platformMessageId || m.message === msg.text && m.direction === "incoming" && msgTime(m) >= msgTime(msg) - 1000)) {
    history.push({ direction: "incoming", message: msg.text, attachments: msg.attachments, sentAt: msg.sentAt });
  }
  if (humanActive(history, cfg.humanPauseHours(), d.now())) {
    await store.set(key, "human");
    return { skip: "advisor sedang layan" };
  }

  const mode = effectiveMode(d.now());
  const base = {
    name: conv.participantName, phone,
    customerText: msg.text || `[${(msg.attachments || []).map((a) => a.type).join(", ") || "lampiran"}]`,
    conversationId: msg.conversationId || conv.id, accountId: acc.id || acc.accountId,
  };

  let ans;
  try {
    ans = await d.draftReply({ knowledge: await d.getKnowledge(), history, mode });
  } catch (e) {
    console.error(e);
    await notify(d, `⚠️ Bot gagal sediakan jawapan untuk ${base.name || "pelanggan"} (+${phone}). Sila balas sendiri.\nPelanggan: ${base.customerText}`);
    return { error: String(e.message || e) };
  }
  await store.set(key, ans.action);
  if (ans.action === "ABAI") return { skip: "mesej peribadi/bukan urusan kereta" };

  const note = [
    ans.action === "SERAH" ? "Pelanggan perlukan anda (SERAH). Semak sebelum hantar." : "",
    ans.removedBanned ? "Ayat larangan dibuang dari draf." : "",
    ans.reason || "",
  ].filter(Boolean).join(" ");

  if (!ans.text) {
    await notify(d, `🙋 ${base.name || "Pelanggan"} (+${phone}) perlukan anda.\nPelanggan: ${base.customerText}${note ? `\n⚠️ ${note}` : ""}`);
    return { done: "notify-only" };
  }

  if (mode === "auto" && ans.action === "BALAS") {
    await d.zernio.sendText(base.conversationId, base.accountId, ans.text);
    await notify(d, `🤖 Auto-balas kepada ${base.name || "pelanggan"} (+${phone})\nPelanggan: ${base.customerText}\nBot: ${ans.text}`);
    return { done: "auto-sent", text: ans.text };
  }

  await notify(d, draftCard({ ...base, draft: ans.text, note }), { reply_markup: draftButtons });
  return { done: "draft", action: ans.action, text: ans.text };
}

// Dipanggil untuk setiap update Telegram (butang Hantar/Abaikan atau balasan anda).
export async function handleTelegram(update, deps = {}) {
  const d = { ...defaults, ...deps };
  const owner = cfg.telegramChatId();

  const cq = update.callback_query;
  if (cq) {
    if (String(cq.from?.id) !== owner) return { skip: "bukan pemilik" };
    const card = parseCard(cq.message?.text);
    const base = { chat_id: cq.message.chat.id, message_id: cq.message.message_id };
    if (!card) { await d.tg("answerCallbackQuery", { callback_query_id: cq.id, text: "Kad tidak sah" }); return { error: "kad" }; }
    if (cq.data === "send") {
      await d.zernio.sendText(card.conversationId, card.accountId, card.draft);
      await d.tg("answerCallbackQuery", { callback_query_id: cq.id, text: "Dihantar ✅" });
      await d.tg("editMessageText", { ...base, text: cq.message.text + "\n\n✅ DIHANTAR" });
      return { done: "sent", text: card.draft };
    }
    await d.tg("answerCallbackQuery", { callback_query_id: cq.id, text: "Diabaikan" });
    await d.tg("editMessageText", { ...base, text: cq.message.text + "\n\n❌ DIABAIKAN" });
    return { done: "skipped" };
  }

  const m = update.message;
  if (!m?.text) return { skip: "tiada teks" };
  if (m.text.trim().startsWith("/start")) {
    await d.tg("sendMessage", { chat_id: m.chat.id, text: `Chat ID anda: ${m.chat.id}\nMasukkan nombor ini sebagai TELEGRAM_CHAT_ID di Netlify.` });
    return { done: "start" };
  }
  if (String(m.from?.id) !== owner) return { skip: "bukan pemilik" };
  const card = parseCard(m.reply_to_message?.text);
  if (!card) {
    await d.tg("sendMessage", { chat_id: m.chat.id, text: "Untuk ubah draf: tekan lama pada kad draf → Reply → taip jawapan anda sendiri." });
    return { skip: "bukan balasan kepada kad" };
  }
  await d.zernio.sendText(card.conversationId, card.accountId, m.text.trim());
  await d.tg("editMessageText", { chat_id: m.chat.id, message_id: m.reply_to_message.message_id, text: m.reply_to_message.text + "\n\n✏️ DIHANTAR (versi anda)" });
  await d.tg("sendMessage", { chat_id: m.chat.id, text: "✅ Versi anda dihantar kepada pelanggan." });
  return { done: "sent-edited", text: m.text.trim() };
}
