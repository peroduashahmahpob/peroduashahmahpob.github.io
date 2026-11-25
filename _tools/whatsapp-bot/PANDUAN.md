# Panduan setup bot WhatsApp (mod draf)

Cara bot berfungsi:

1. Pelanggan WhatsApp nombor bisnes anda.
2. Zernio (API rasmi Meta) hantar mesej itu ke bot di Netlify.
3. Bot (AI Claude) sediakan **draf** jawapan guna harga dari website.
4. Draf sampai ke **Telegram** anda dengan butang **✅ Hantar** / **❌ Abaikan**.
5. Anda tekan Hantar, dan pelanggan terima jawapan di WhatsApp.

Nak tukar ayat dulu? Tekan lama pada kad draf, pilih **Reply**, taip versi anda, kemudian hantar.

Peraturan yang dah ditetapkan:

- Tiada perkataan "test drive".
- Topik Perodua sahaja.
- Mesej kawan/keluarga diabaikan.
- Bot **diam 12 jam** bila anda sendiri balas dari telefon.

> Jangan sesekali hantar kunci/API key dalam chat (WhatsApp, Telegram, Claude). Masukkan terus dalam Netlify sahaja (Langkah 4).

---

## Langkah 1: Bot Telegram untuk terima draf (5 minit)

1. Install **Telegram** di telefon kalau belum ada.
2. Cari **@BotFather** (ada tanda biru), tekan **Start**.
3. Taip `/newbot`.
   - Nama: `Draf WhatsApp Shah`
   - Username: mesti berakhir dengan `bot`, contoh `drafshah_bot`
4. BotFather beri **token** (panjang, ada tanda `:`). Simpan dulu, untuk Langkah 4.

## Langkah 2: Zernio, sambung nombor WhatsApp Business (15 minit)

1. Update app **WhatsApp Business** ke versi terbaru.
2. Daftar di **zernio.com**.
3. Pilih **Connect account**, kemudian **WhatsApp**, dan login Facebook.
4. Pilih **guna nombor WhatsApp Business app sedia ada** (Coexistence). JANGAN pilih nombor baru.
5. Masukkan nombor anda dan ikut arahan sahkan dalam app di telefon. Benarkan kongsi sejarah chat.
6. Dalam Zernio, buka **Settings → API Keys** dan buat satu key. Simpan untuk Langkah 4.

Tersangkut? Screenshot skrin dan tunjuk kepada Claude.

## Langkah 3: Akaun AI (5 minit)

1. Daftar di **console.anthropic.com**.
2. Buka **Billing** dan top-up **USD 5** (~RM20). Ini cukup untuk lama dalam mod draf.
3. Buka **API Keys**, buat satu key, dan simpan untuk Langkah 4.

## Langkah 4: Masukkan kunci dalam Netlify

Buka **app.netlify.com**, pilih site **teamshahmahpob**, kemudian pergi ke **Site configuration → Environment variables**. Tambah satu-satu:

| Nama (Key) | Nilai (Value) |
|---|---|
| `ZERNIO_API_KEY` | key dari Langkah 2 |
| `ANTHROPIC_API_KEY` | key dari Langkah 3 |
| `TELEGRAM_BOT_TOKEN` | token dari Langkah 1 |
| `WEBHOOK_TOKEN` | reka sendiri: huruf + nombor, sekurang-kurangnya 25 aksara, tanpa simbol (contoh corak: `kucingMerah88pintuBiru42Laut`) |
| `TELEGRAM_SECRET` | reka satu lagi, cara sama, mesti berbeza dari di atas |
| `BOT_MODE` | `draft` |
| `TEST_NUMBERS` | nombor telefon **kedua** anda untuk ujian (contoh `60123456789`). Semasa ujian, bot hanya layan nombor ini |

Kemudian beritahu Claude: **"kunci dah masuk"**. Claude akan deploy bot.

## Langkah 5: Sambungkan semua (selepas Claude deploy)

1. Buka di browser: `https://teamshahmahpob.netlify.app/api/bot-setup?token=WEBHOOK_TOKEN_ANDA`
   - Halaman itu sambungkan Telegram dan tunjuk **URL webhook untuk Zernio**.
2. Di Telegram, buka bot anda dan taip `/start`. Bot balas dengan **Chat ID**.
   - Masukkan sebagai `TELEGRAM_CHAT_ID` di Netlify (Langkah 4), dan beritahu Claude untuk deploy semula.
3. Dalam Zernio, buka **Settings → Webhooks** dan tambah URL webhook tadi.
   - Pilih event **message.received**.
   - Tekan **Test**. Telegram anda patut terima "✅ Ujian webhook Zernio diterima".

## Langkah 6: Tetapan app WhatsApp Business

Matikan **Mesej sapaan (Greeting message)** dan **Mesej tiada di tempat (Away message)**:

- Cara: **Settings → Business tools**.
- Sebab: mesej automatik dari app dikira sebagai "anda sedang balas", dan bot akan berdiam diri.

## Langkah 7: Uji

1. Dari nombor kedua, WhatsApp ke nombor bisnes: "Salam, berapa bulanan Myvi kalau DP 5k?"
2. Dalam beberapa saat, draf muncul di Telegram. Tekan **✅ Hantar**.
3. Bila dah puas hati, buang `TEST_NUMBERS` di Netlify supaya bot layan semua pelanggan, dan beritahu Claude untuk deploy semula.

---

## Selepas ini (pilihan)

| Mahu | Tukar di Netlify |
|---|---|
| Malam auto-balas, siang draf | `BOT_MODE` = `hybrid`, `AUTO_HOURS` = `21-9` |
| Auto-balas 24 jam | `BOT_MODE` = `auto` (soalan susah tetap jadi draf) |
| Bot lebih cepat & murah | `BOT_MODEL` = `claude-haiku-5-5` (kalau selalu dapat "Bot gagal sediakan jawapan") |
| Tempoh bot diam selepas anda balas | `HUMAN_PAUSE_HOURS` (asal 12) |

Harga & rebate dibaca terus dari website (`kalkulator/data.js`, `rebate.js`). Kemas kini website, dan bot ikut dalam ~10 minit.

## Had yang perlu tahu

- WhatsApp hanya benarkan balasan dalam **24 jam** selepas mesej terakhir pelanggan. Draf yang lebih lama akan gagal dihantar, dan bot akan beritahu.
- Chat **group** dan panggilan telefon tidak melalui bot.
- Harga dalam jawapan ialah anggaran. Kelulusan loan ikut bank.
