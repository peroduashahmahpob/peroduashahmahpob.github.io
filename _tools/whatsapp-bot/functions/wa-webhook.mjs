// Netlify Function: Zernio hantar setiap mesej WhatsApp masuk ke sini.
// URL: https://<laman-anda>/api/wa-webhook?token=<WEBHOOK_TOKEN>
import { getStore } from "@netlify/blobs";
import { cfg } from "../lib/config.mjs";
import { signatureOk } from "../lib/zernio.mjs";
import { handleZernio } from "../lib/handle.mjs";

export default async (req) => {
  if (req.method !== "POST") return new Response("Bot WhatsApp aktif.", { status: 200 });
  const token = new URL(req.url).searchParams.get("token") || "";
  if (!cfg.webhookToken() || token !== cfg.webhookToken()) return new Response("forbidden", { status: 403 });

  const raw = await req.text();
  if (!signatureOk(raw, req.headers.get("x-zernio-signature"), cfg.zernioSecret())) {
    console.error("Tandatangan Zernio tidak sepadan");
    return new Response("bad signature", { status: 401 });
  }
  let payload;
  try { payload = JSON.parse(raw); } catch { return new Response("bad json", { status: 400 }); }

  try {
    let s; // dibuka hanya bila perlu
    const store = { get: (k) => (s ??= getStore("wa-bot")).get(k), set: (k, v) => (s ??= getStore("wa-bot")).set(k, v) };
    const r = await handleZernio(payload, store);
    console.log(JSON.stringify({ event: payload.event, id: payload.id, ...r, text: undefined }));
  } catch (e) {
    console.error("handleZernio gagal:", e);
    return new Response("error", { status: 500 }); // Zernio akan cuba semula
  }
  return new Response("ok", { status: 200 });
};

export const config = { path: "/api/wa-webhook" };
