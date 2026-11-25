# Bot WhatsApp AI: keperluan

Status: perancangan (belum dibina).

## Keputusan setakat ini
- Mesti guna WhatsApp API rasmi (elak ban). Tiada QR/Baileys.
- Cadangan: Zernio (Coexistence) + bot kecil di Netlify Functions + Claude Haiku 5.5.
- Nombor: belum disahkan (0189048194 vs 0189038194 di website).

## Peraturan isi kandungan bot
- JANGAN guna perkataan "test drive" langsung, dan jangan tawarkan test drive.
- Jawab hanya topik kereta Perodua / harga / loan. Tolak soalan luar topik.
- Harga ambil dari `kalkulator/data.js` (OTR, kadar faedah per model).
- Sentiasa beri pilihan bercakap dengan sales advisor (manusia).
