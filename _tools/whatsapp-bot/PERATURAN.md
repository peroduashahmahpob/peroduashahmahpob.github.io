# Bot WhatsApp AI: keperluan

Status: kod siap & diuji (`npm test`), menunggu pemilik buat akaun (lihat PANDUAN.md). Mod mula: draf (lulus di Telegram).

## Keputusan setakat ini
- Mesti guna WhatsApp API rasmi (elak ban). Tiada QR/Baileys.
- Seni bina: Zernio (Coexistence) -> Netlify Functions (`functions/`) -> Claude (asal `claude-opus-5-5`, effort low) -> draf ke Telegram pemilik -> butang Hantar -> Zernio.
- Bukan Hermes: Hermes direka sebagai pembantu peribadi; ingatan antara pelanggan tidak terasing dan perlu VPS.
- Nombor: disahkan oleh pemilik, sudah guna WhatsApp Business app -> sesuai untuk Coexistence.

## Peraturan isi kandungan bot
- JANGAN guna perkataan "test drive" langsung, dan jangan tawarkan test drive.
- Jawab hanya topik kereta Perodua / harga / loan. Tolak soalan luar topik.
- Harga ambil dari `kalkulator/data.js` (OTR, kadar faedah per model).
- Sentiasa beri pilihan bercakap dengan sales advisor (manusia).
