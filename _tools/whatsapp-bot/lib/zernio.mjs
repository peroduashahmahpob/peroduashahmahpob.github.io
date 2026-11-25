// Panggilan ke Zernio API (https://zernio.com/api), ikut SDK rasmi @zernio/node.
import crypto from "node:crypto";
import { cfg } from "./config.mjs";

const BASE = "https://zernio.com/api";

async function call(path, { method = "GET", body, fetchImpl = fetch } = {}) {
  const res = await fetchImpl(BASE + path, {
    method,
    headers: { Authorization: `Bearer ${cfg.zernioKey()}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Zernio ${method} ${path} -> HTTP ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

// Mesej terkini dalam perbualan, susunan lama -> baru.
export async function recentMessages(conversationId, { limit = 20, fetchImpl } = {}) {
  const q = new URLSearchParams({ limit: String(limit), sortOrder: "desc" });
  const r = await call(`/v1/inbox/conversations/${encodeURIComponent(conversationId)}/messages?${q}`, { fetchImpl });
  return (r.messages || []).slice().reverse();
}

export async function sendText(conversationId, accountId, message, { fetchImpl } = {}) {
  return call(`/v1/inbox/conversations/${encodeURIComponent(conversationId)}/messages`, {
    method: "POST", body: { accountId, message }, fetchImpl,
  });
}

// Format tandatangan tidak didokumenkan dengan jelas; terima hex, "sha256=hex" atau base64 HMAC-SHA256 badan mentah.
export function signatureOk(rawBody, header, secret) {
  if (!secret) return true;
  if (!header) return false;
  const mac = crypto.createHmac("sha256", secret).update(rawBody).digest();
  const given = header.trim().replace(/^sha256=/i, "");
  for (const cand of [mac.toString("hex"), mac.toString("base64")]) {
    const a = Buffer.from(cand), b = Buffer.from(given);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
  }
  return false;
}
