// ====== REBATE BULAN INI — tukar fail ni sahaja setiap bulan ======
// Senarai dari Shah: "Rebate Perodua Nov 2026". Nama ikut varian dalam kalkulator/data.js.
window.REBATE = {
  bulan: "NOVEMBER",
  tamat: "2026-11-30T23:59:59+08:00",   // waktu Malaysia
  sehingga: 7500,                        // rebate paling tinggi (untuk banner)
  rules: [                               // [teks dalam nama varian, rebate RM] — yang pertama padan dipakai
    ["axia g", 500], ["axia x", 3900], ["axia se", 4300], ["axia av", 4900],
    ["bezza g 1.0", 1000], ["bezza premium x", 4000], ["bezza advance", 5000],
    ["myvi", 1500],
    ["ativa 1.0 turbo x", 6500], ["ativa 1.0 turbo h", 7000], ["ativa 1.0 turbo advance", 7500],
    ["aruz", 4000],
    ["traz", 0], ["alza", 0],
  ],
};
// ==================================================================
window.rebateFor = function (name) {
  const n = String(name || "").toLowerCase();
  const r = (window.REBATE.rules || []).find(([k]) => n.includes(k));
  return r ? r[1] : 0;
};
(function () {
  const R = window.REBATE, END = Date.parse(R.tamat);
  const css = document.createElement("style");
  css.textContent = `.rcd{display:block;margin:16px 0 0;padding:14px 12px 12px;border-radius:20px;background:linear-gradient(135deg,#ee7a4c,#cc5a2c);color:#fff;text-align:center;box-shadow:0 10px 30px rgba(238,122,76,.3)}
.rcd .t{font-size:11px;font-weight:900;letter-spacing:.18em}
.rcd .n{display:flex;justify-content:center;align-items:baseline;gap:4px;flex-wrap:wrap;margin-top:4px}
.rcd .n{flex-wrap:nowrap}
.rcd .n b{font-size:clamp(22px,7.4vw,32px);font-weight:900;font-variant-numeric:tabular-nums;min-width:1.3em}
.rcd .n i{font-style:normal;font-size:10px;font-weight:700;opacity:.85;margin-right:4px}
.rcd .s{margin-top:4px;font-size:13px;font-weight:700;opacity:.95}`;
  document.head.appendChild(css);
  const p2 = (n) => String(n).padStart(2, "0");
  function draw() {
    const ms = END - Date.now();
    document.querySelectorAll("[data-rebate-cd]").forEach((el) => {
      if (!el.classList.contains("rcd")) el.classList.add("rcd");
      if (ms <= 0) { el.innerHTML = `<div class="t">REBATE ${R.bulan} DAH TAMAT</div><div class="s">WhatsApp untuk promosi bulan ini</div>`; return; }
      const s = Math.floor(ms / 1000);
      el.innerHTML = `<div class="t">REBATE ${R.bulan} TAMAT DALAM</div>
        <div class="n"><b>${Math.floor(s / 86400)}</b><i>hari</i><b>${p2(Math.floor(s / 3600) % 24)}</b><i>jam</i><b>${p2(Math.floor(s / 60) % 60)}</b><i>min</i><b>${p2(s % 60)}</b><i>saat</i></div>
        <div class="s">Rebate sehingga RM${R.sehingga.toLocaleString("en-US")} · register sebelum ${new Date(END).toLocaleDateString("ms-MY", { day: "numeric", month: "short", timeZone: "Asia/Kuala_Lumpur" })}</div>`;
    });
    if (ms > 0) setTimeout(draw, 1000 - (Date.now() % 1000));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", draw); else draw();
})();
