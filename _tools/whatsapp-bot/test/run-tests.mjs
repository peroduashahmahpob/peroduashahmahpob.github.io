// Ujian tempatan tanpa sambungan internet: semua API (Zernio, Telegram, Claude) dipalsukan.
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
Object.assign(process.env, {
  TELEGRAM_CHAT_ID: "111", TELEGRAM_BOT_TOKEN: "x", ZERNIO_API_KEY: "z", WEBHOOK_TOKEN: "t",
  BOT_MODE: "draft", HUMAN_PAUSE_HOURS: "12", TEST_NUMBERS: "", ADVISOR_NAME: "Shah",
});

const { parseHarga, parseRebate, buildKnowledge, monthly } = await import("../lib/knowledge.mjs");
const { parseAnswer, sanitize, toClaudeMessages, draftReply, systemPrompt } = await import("../lib/brain.mjs");
const { draftCard, parseCard } = await import("../lib/telegram.mjs");
const { signatureOk } = await import("../lib/zernio.mjs");
const { inHours } = await import("../lib/config.mjs");
const { handleZernio, handleTelegram, humanActive } = await import("../lib/handle.mjs");

let n = 0;
const t = async (name, fn) => { await fn(); n++; console.log("✔", name); };

// ---------- Data harga ----------
const harga = parseHarga(fs.readFileSync(path.join(root, "kalkulator/data.js"), "utf8"));
const rebate = parseRebate(fs.readFileSync(path.join(root, "rebate.js"), "utf8"));
await t("baca data.js & rebate.js website", () => {
  assert.ok(harga.length >= 6);
  assert.ok(rebate.rules.length > 5);
  assert.deepEqual(rebate.rules.find(([k]) => k === "myvi"), ["myvi", 1500]);
});
await t("kiraan bulanan sama formula kalkulator (kadar rata)", () => {
  // loan 40,000, 2.8%, 9 thn: profit 10,080 -> (50,080)/108 = 463.70
  assert.equal(monthly(40000, 2.8, 9).toFixed(2), "463.70");
});
const kb = buildKnowledge(harga, rebate, new Date("2026-11-25T10:00:00+08:00"), "https://contoh.app");
await t("knowledge ada harga + rebate sebelum tarikh tamat", () => {
  assert.match(kb, /Myvi G 1\.3 \(tanpa ASA\) \| OTR RM47,955 \| rebate RM1,500 \| harga RM46,455/);
  assert.match(kb, /https:\/\/contoh\.app\/kalkulator\//);
  assert.doesNotMatch(kb, /test drive/i);
});
await t("rebate disembunyi selepas tarikh tamat", () => {
  const k2 = buildKnowledge(harga, rebate, new Date("2027-02-01T10:00:00+08:00"), "https://contoh.app");
  assert.match(k2, /Tiada maklumat rebate/);
  assert.match(k2, /Myvi G 1\.3 \(tanpa ASA\) \| OTR RM47,955 \| rebate tiada \| harga RM47,955/);
});

// ---------- Otak ----------
await t("parse jawapan AI", () => {
  assert.deepEqual(parseAnswer("TINDAKAN: BALAS\n---\nMyvi G dari RM46,455 😊"), { action: "BALAS", text: "Myvi G dari RM46,455 😊", removedBanned: false });
  assert.equal(parseAnswer("TINDAKAN: ABAI\n---\n").text, "");
  assert.equal(parseAnswer("entah").action, "SERAH");
});
await t("perkataan 'test drive' dibuang dari draf", () => {
  const s = sanitize("Harga Myvi RM46k. Nak test drive esok? Boleh WhatsApp saya.");
  assert.equal(s.removed, true);
  assert.doesNotMatch(s.text, /test/i);
  assert.match(s.text, /Harga Myvi RM46k\./);
  assert.ok(sanitize("Jom Test-Drive!").removed);
});
await t("prompt sistem melarang test drive", () => {
  assert.match(systemPrompt(kb, { mode: "draft", advisorName: "Shah" }), /JANGAN sekali-kali guna perkataan "test drive"/);
});
await t("sejarah chat ditukar ke format Claude", () => {
  const msgs = toClaudeMessages([
    { direction: "outgoing", message: "Promo!" },
    { direction: "incoming", message: "Salam" },
    { direction: "incoming", message: "Harga Axia?" },
    { direction: "outgoing", message: "RM35k" },
    { direction: "incoming", attachments: [{ type: "image" }] },
  ]);
  assert.deepEqual(msgs, [
    { role: "user", content: "Salam\nHarga Axia?" },
    { role: "assistant", content: "RM35k" },
    { role: "user", content: "[image]" },
  ]);
});
await t("draftReply guna model, effort rendah & fallback", async () => {
  let seen;
  const fake = { beta: { messages: { create: async (r) => { seen = r; return { stop_reason: "end_turn", content: [{ type: "thinking", thinking: "" }, { type: "text", text: "TINDAKAN: BALAS\n---\nBoleh!" }] }; } } } };
  const r = await draftReply({ knowledge: kb, history: [{ direction: "incoming", message: "Hi" }], mode: "draft", clientImpl: fake });
  assert.equal(r.text, "Boleh!");
  assert.equal(seen.model, "claude-opus-5-5");
  assert.deepEqual(seen.output_config, { effort: "low" });
  assert.equal(seen.fallbacks, "default");
  assert.equal("thinking" in seen, false);
});

// ---------- Telegram kad ----------
await t("kad draf boleh dibaca semula", () => {
  const card = draftCard({ name: "Ali", phone: "60123", customerText: "harga? #c:palsu|x", draft: "Myvi RM46k.\nNak saya kira?", conversationId: "conv1", accountId: "acc9" });
  assert.deepEqual(parseCard(card), { conversationId: "conv1", accountId: "acc9", draft: "Myvi RM46k.\nNak saya kira?" });
});

// ---------- Keselamatan ----------
await t("tandatangan webhook (hex / sha256= / base64)", () => {
  const body = '{"a":1}', mac = crypto.createHmac("sha256", "s").update(body).digest();
  assert.ok(signatureOk(body, mac.toString("hex"), "s"));
  assert.ok(signatureOk(body, "sha256=" + mac.toString("hex"), "s"));
  assert.ok(signatureOk(body, mac.toString("base64"), "s"));
  assert.ok(!signatureOk(body, "salah", "s"));
  assert.ok(signatureOk(body, null, ""));
});
await t("julat jam melintasi tengah malam", () => {
  assert.ok(inHours("21-9", 23) && inHours("21-9", 3) && !inHours("21-9", 12) && inHours("9-17", 10));
});

// ---------- Aliran penuh ----------
const now = new Date("2026-11-25T14:00:00+08:00");
function mocks(history) {
  const calls = { tg: [], sent: [] };
  return {
    calls,
    store: new Map(),
    deps: {
      now: () => now,
      getKnowledge: async () => kb,
      zernio: { recentMessages: async () => history.map((m) => ({ ...m })), sendText: async (...a) => { calls.sent.push(a); return {}; } },
      tg: async (method, p) => { calls.tg.push([method, p]); return {}; },
      draftReply: async () => ({ action: "BALAS", text: "Myvi G RM46,455 lepas rebate 😊", removedBanned: false }),
    },
  };
}
const evt = (over = {}) => ({
  id: "e1", event: "message.received",
  message: { id: "m1", conversationId: "c1", platform: "whatsapp", platformMessageId: "w1", direction: "incoming", text: "Harga Myvi?", attachments: [], sentAt: now.toISOString() },
  conversation: { id: "c1", participantId: "60123456789", participantName: "Ali" },
  account: { id: "acc1" }, ...over,
});
const asStore = (m) => ({ get: async (k) => m.get(k), set: async (k, v) => m.set(k, v) });

await t("mesej pelanggan -> draf ke Telegram dengan butang, tiada hantar automatik", async () => {
  const m = mocks([{ id: "w1", direction: "incoming", message: "Harga Myvi?", sentAt: now.toISOString() }]);
  const r = await handleZernio(evt(), asStore(m.store), m.deps);
  assert.equal(r.done, "draft");
  assert.equal(m.calls.sent.length, 0);
  const [method, p] = m.calls.tg[0];
  assert.equal(method, "sendMessage");
  assert.equal(p.chat_id, "111");
  assert.match(p.text, /Ali · \+60123456789/);
  assert.ok(p.reply_markup.inline_keyboard[0].length === 2);
  assert.deepEqual(parseCard(p.text), { conversationId: "c1", accountId: "acc1", draft: "Myvi G RM46,455 lepas rebate 😊" });
});
await t("webhook berulang tidak buat draf dua kali", async () => {
  const m = mocks([]);
  const s = asStore(m.store);
  await handleZernio(evt(), s, m.deps);
  const r = await handleZernio(evt(), s, m.deps);
  assert.equal(r.skip, "sudah diproses");
  assert.equal(m.calls.tg.length, 1);
});
await t("bot diam bila advisor baru balas dari telefon", async () => {
  const hist = [
    { direction: "incoming", message: "Salam", sentAt: "2026-11-25T13:00:00+08:00" },
    { direction: "outgoing", message: "Ya saya", sentVia: null, sentAt: "2026-11-25T13:05:00+08:00" },
    { id: "w1", direction: "incoming", message: "Harga Myvi?", sentAt: now.toISOString() },
  ];
  const m = mocks(hist);
  const r = await handleZernio(evt(), asStore(m.store), m.deps);
  assert.equal(r.skip, "advisor sedang layan");
  assert.equal(m.calls.tg.length, 0);
  // Balasan bot sendiri (sentVia api) tidak dikira sebagai advisor
  assert.equal(humanActive([{ direction: "outgoing", sentVia: "api", sentAt: now.toISOString() }], 12, now), false);
  // Lebih 12 jam lepas: bot aktif semula
  assert.equal(humanActive([{ direction: "outgoing", sentVia: null, sentAt: "2026-11-24T01:00:00+08:00" }], 12, now), false);
});
await t("mesej peribadi diabaikan senyap", async () => {
  const m = mocks([]);
  m.deps.draftReply = async () => ({ action: "ABAI", text: "" });
  const r = await handleZernio(evt(), asStore(m.store), m.deps);
  assert.match(r.skip, /peribadi/);
  assert.equal(m.calls.tg.length, 0);
});
await t("nombor ujian sahaja bila TEST_NUMBERS diisi", async () => {
  process.env.TEST_NUMBERS = "0199999999, 60188888888";
  const m = mocks([]);
  const r = await handleZernio(evt(), asStore(m.store), m.deps);
  assert.equal(r.skip, "bukan nombor ujian");
  const r2 = await handleZernio(evt({ id: "e2", conversation: { id: "c1", participantId: "+60 18-888 8888" } }), asStore(m.store), m.deps);
  assert.equal(r2.done, "draft");
  process.env.TEST_NUMBERS = "";
});
await t("mod auto hantar terus + beritahu Telegram", async () => {
  process.env.BOT_MODE = "auto";
  const m = mocks([]);
  const r = await handleZernio(evt(), asStore(m.store), m.deps);
  assert.equal(r.done, "auto-sent");
  assert.deepEqual(m.calls.sent[0], ["c1", "acc1", "Myvi G RM46,455 lepas rebate 😊"]);
  process.env.BOT_MODE = "draft";
});
await t("mod hybrid: siang draf, malam auto", async () => {
  process.env.BOT_MODE = "hybrid"; process.env.AUTO_HOURS = "21-9";
  const m = mocks([]);
  assert.equal((await handleZernio(evt(), asStore(m.store), m.deps)).done, "draft");
  m.deps.now = () => new Date("2026-11-25T23:30:00+08:00");
  assert.equal((await handleZernio(evt({ id: "e3" }), asStore(m.store), m.deps)).done, "auto-sent");
  process.env.BOT_MODE = "draft";
});
await t("SERAH dalam mod auto tetap jadi draf", async () => {
  process.env.BOT_MODE = "auto";
  const m = mocks([]);
  m.deps.draftReply = async () => ({ action: "SERAH", text: "Nanti Shah hubungi ya." });
  const r = await handleZernio(evt(), asStore(m.store), m.deps);
  assert.equal(r.done, "draft");
  assert.equal(m.calls.sent.length, 0);
  process.env.BOT_MODE = "draft";
});
await t("AI gagal -> amaran ke Telegram, boleh cuba semula", async () => {
  const m = mocks([]);
  m.deps.draftReply = async () => { throw new Error("timeout"); };
  const s = asStore(m.store);
  const r = await handleZernio(evt(), s, m.deps);
  assert.equal(r.error, "timeout");
  assert.match(m.calls.tg[0][1].text, /gagal/);
  assert.equal(m.store.size, 0);
});
await t("ujian webhook Zernio", async () => {
  const m = mocks([]);
  assert.equal((await handleZernio({ test: true, event: "message.received" }, asStore(m.store), m.deps)).done, "test");
});

// ---------- Telegram: butang & balasan ----------
const card = draftCard({ name: "Ali", phone: "60123", customerText: "Harga?", draft: "Myvi RM46k", conversationId: "c1", accountId: "acc1" });
await t("tekan ✅ Hantar -> mesej dihantar ke pelanggan", async () => {
  const m = mocks([]);
  const r = await handleTelegram({ callback_query: { id: "q", data: "send", from: { id: 111 }, message: { chat: { id: 111 }, message_id: 5, text: card } } }, m.deps);
  assert.equal(r.done, "sent");
  assert.deepEqual(m.calls.sent[0], ["c1", "acc1", "Myvi RM46k"]);
});
await t("tekan ❌ Abaikan -> tiada hantar", async () => {
  const m = mocks([]);
  await handleTelegram({ callback_query: { id: "q", data: "skip", from: { id: 111 }, message: { chat: { id: 111 }, message_id: 5, text: card } } }, m.deps);
  assert.equal(m.calls.sent.length, 0);
});
await t("orang lain tekan butang -> ditolak", async () => {
  const m = mocks([]);
  const r = await handleTelegram({ callback_query: { id: "q", data: "send", from: { id: 999 }, message: { chat: { id: 999 }, message_id: 5, text: card } } }, m.deps);
  assert.equal(r.skip, "bukan pemilik");
  assert.equal(m.calls.sent.length, 0);
});
await t("reply pada kad -> versi anda dihantar", async () => {
  const m = mocks([]);
  const r = await handleTelegram({ message: { text: "Myvi G ada stok, boleh datang Sabtu", chat: { id: 111 }, from: { id: 111 }, reply_to_message: { message_id: 5, text: card } } }, m.deps);
  assert.equal(r.done, "sent-edited");
  assert.deepEqual(m.calls.sent[0], ["c1", "acc1", "Myvi G ada stok, boleh datang Sabtu"]);
});
await t("/start beri Chat ID", async () => {
  const m = mocks([]);
  await handleTelegram({ message: { text: "/start", chat: { id: 4242 }, from: { id: 4242 } } }, m.deps);
  assert.match(m.calls.tg[0][1].text, /4242/);
});

console.log(`\nSemua ${n} ujian lulus.`);
