// Telegram Bot API: tempat anda terima draf dan tekan "Hantar".
import { cfg } from "./config.mjs";

export async function tg(method, payload, { fetchImpl = fetch } = {}) {
  const res = await fetchImpl(`https://api.telegram.org/bot${cfg.telegramToken()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await res.json().catch(() => ({}));
  if (!j.ok) throw new Error(`Telegram ${method} gagal: ${JSON.stringify(j).slice(0, 300)}`);
  return j.result;
}

// Tag tersembunyi di hujung mesej Telegram supaya butang tahu perbualan mana.
export const TAG_RE = /#c:([^\s|]+)\|([^\s]+)\s*$/;
export const DRAFT_HEAD = "✍️ Draf:";

export function draftCard({ name, phone, customerText, draft, note, conversationId, accountId }) {
  const who = [name, phone ? `+${phone}` : ""].filter(Boolean).join(" · ") || "Pelanggan";
  return [
    `💬 ${who}`,
    `Pelanggan: ${customerText}`,
    note ? `\n⚠️ ${note}` : "",
    "",
    DRAFT_HEAD,
    draft,
    "",
    `#c:${conversationId}|${accountId}`,
  ].filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n");
}

// Ambil semula teks draf dan id dari kad Telegram.
export function parseCard(text = "") {
  const tag = TAG_RE.exec(text);
  if (!tag) return null;
  const start = text.indexOf(DRAFT_HEAD);
  const draft = start >= 0 ? text.slice(start + DRAFT_HEAD.length, tag.index).trim() : "";
  return { conversationId: tag[1], accountId: tag[2], draft };
}

export const draftButtons = {
  inline_keyboard: [[{ text: "✅ Hantar", callback_data: "send" }, { text: "❌ Abaikan", callback_data: "skip" }]],
};
