# Bot WhatsApp AI: keperluan

Status: perancangan (belum dibina).

## Keputusan setakat ini
- Mesti guna WhatsApp API rasmi (elak ban). Tiada QR/Baileys.
- Cadangan: Zernio (Coexistence) + bot kecil di Netlify Functions + Claude Haiku 5.5.
- Nombor: disahkan oleh pemilik, sudah guna WhatsApp Business app -> sesuai untuk Coexistence.

## Peraturan isi kandungan bot
- JANGAN guna perkataan "test drive" langsung, dan jangan tawarkan test drive.
- Jawab hanya topik kereta Perodua / harga / loan. Tolak soalan luar topik.
- Harga ambil dari `kalkulator/data.js` (OTR, kadar faedah per model).
- Sentiasa beri pilihan bercakap dengan sales advisor (manusia).
