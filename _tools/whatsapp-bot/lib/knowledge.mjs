// Ambil harga & rebate terus dari website (kalkulator/data.js + rebate.js),
// supaya bot sentiasa sama dengan website. Kiraan ikut kalkulator: kadar rata (flat rate).
import { cfg } from "./config.mjs";

let cache = { at: 0, text: "" };
const TTL_MS = 10 * 60 * 1000;

const rm = (n) => "RM" + Math.round(n).toLocaleString("en-MY");

export function parseHarga(src) {
  const i = src.indexOf("[");
  if (i < 0) throw new Error("data.js: tiada senarai harga");
  return JSON.parse(src.slice(i).trim().replace(/;\s*$/, ""));
}

// Baca rebate.js tanpa menjalankan kodnya: ambil peraturan ["nama", RM] dan tarikh tamat.
export function parseRebate(src) {
  const block = /rules\s*:\s*\[([\s\S]*?)\]\s*,?\s*\}/.exec(src);
  const rules = [];
  if (block) for (const m of block[1].matchAll(/\[\s*"([^"]+)"\s*,\s*(\d+)\s*\]/g)) rules.push([m[1].toLowerCase(), +m[2]]);
  const tamat = /tamat\s*:\s*"([^"]+)"/.exec(src)?.[1] || "";
  const bulan = /bulan\s*:\s*"([^"]+)"/.exec(src)?.[1] || "";
  return { rules, tamat, bulan };
}

export function monthly(loan, ratePct, years) {
  const profit = loan * ratePct / 100 * years;
  return (loan + profit) / (years * 12);
}

export function buildKnowledge(harga, rebate, now = new Date(), siteUrl = cfg.siteUrl()) {
  const end = Date.parse(rebate.tamat);
  const rebateOn = rebate.rules.length > 0 && Number.isFinite(end) && now.getTime() <= end;
  const rebateFor = (name) => {
    if (!rebateOn) return 0;
    const n = name.toLowerCase();
    return (rebate.rules.find(([k]) => n.includes(k)) || [, 0])[1];
  };
  const tamatTxt = rebateOn
    ? new Date(end).toLocaleDateString("ms-MY", { timeZone: "Asia/Kuala_Lumpur", day: "numeric", month: "long", year: "numeric" })
    : "";

  const lines = [];
  lines.push(rebateOn
    ? `Rebate semasa (${rebate.bulan}) sah sehingga ${tamatTxt}, sementara stok ada.`
    : "Tiada maklumat rebate yang sah sekarang. Jangan sebut sebarang rebate.");
  lines.push("Format: varian | OTR anggaran | rebate | harga lepas rebate | bulanan 9 tahun / 7 tahun untuk downpayment (DP) berbeza.");
  for (const m of harga) {
    lines.push("", `## ${m.model} (kadar bank anggaran ${m.rate}% setahun, rata) - ${siteUrl}/${m.id}/`);
    for (const v of m.variants) {
      const rb = rebateFor(v.name), price = v.otr - rb;
      const dps = [0, 3000, 5000, Math.round(price * 0.1 / 100) * 100].filter((x, i, a) => a.indexOf(x) === i && x < price);
      const parts = dps.map((dp) => `DP ${dp ? rm(dp) : "RM0 (full loan)"}: ${rm(monthly(price - dp, m.rate, 9))} / ${rm(monthly(price - dp, m.rate, 7))}`);
      lines.push(`- ${v.name} | OTR ${rm(v.otr)} | rebate ${rb ? rm(rb) : "tiada"} | harga ${rm(price)} | ${parts.join("; ")}`);
    }
  }
  lines.push("", `Kalkulator penuh (pelanggan boleh masukkan DP sendiri): ${siteUrl}/kalkulator/`);
  return lines.join("\n");
}

export async function getKnowledge({ fetchImpl = fetch, now = new Date() } = {}) {
  if (cache.text && Date.now() - cache.at < TTL_MS) return cache.text;
  const base = cfg.siteUrl();
  const [d, r] = await Promise.all([
    fetchImpl(`${base}/kalkulator/data.js`).then((x) => { if (!x.ok) throw new Error(`data.js HTTP ${x.status}`); return x.text(); }),
    fetchImpl(`${base}/rebate.js`).then((x) => (x.ok ? x.text() : "")).catch(() => ""),
  ]);
  const text = buildKnowledge(parseHarga(d), parseRebate(r), now, base);
  cache = { at: Date.now(), text };
  return text;
}

export function _resetCache() { cache = { at: 0, text: "" }; }
