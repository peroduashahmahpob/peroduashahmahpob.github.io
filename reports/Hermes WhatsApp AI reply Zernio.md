# Hermes boleh balas WhatsApp, Zernio pilihan sahaja

**TL;DR:** Ya, **betul**: Hermes Agent (Nous Research) memang boleh disambung ke WhatsApp dan auto-reply customer dengan AI. Ia ada dua adapter terbina dalam:

- **`whatsapp`**: Baileys, imbas QR, tak rasmi, ada risiko ban.
- **`whatsapp_cloud`**: WhatsApp Cloud API rasmi Meta, tiada risiko ban.

Dakwaan bahawa Hermes "guna Zernio untuk auto-reply WhatsApp" pula **separuh betul**. Zernio memang ada halaman setup khas untuk Hermes, tetapi itu cuma sambungan **MCP**. Hermes dapat *tools* untuk baca inbox dan hantar mesej, tetapi **tidak menerima mesej masuk secara automatik**. Untuk auto-reply melalui Zernio, anda perlu bina gelung webhook sendiri: Zernio `message.received` → Hermes/LLM → Zernio send API. Bagi seorang sales advisor Perodua yang mahu bot jawab customer, laluan paling mudah dan selamat ialah **Hermes + adapter `whatsapp_cloud` terus ke Meta**, tanpa Zernio. Zernio hanya berbaloi kalau anda mahu kekalkan nombor WhatsApp Business sedia ada melalui Coexistence, atau mahu satu inbox untuk IG/FB/WhatsApp. Baileys QR sesuai untuk cubaan sahaja, jangan untuk nombor jualan utama.

| Dakwaan | Verdict | Ringkasan |
|---|---|---|
| Hermes boleh connect ke WhatsApp | **Betul** | Dua adapter terbina dalam, didokumenkan dalam repo rasmi |
| Hermes boleh auto-reply AI kepada customer (bukan diri sendiri sahaja) | **Betul** | Perlu set `ALLOW_ALL_USERS` dan "harden" gateway. Asalnya ia direka sebagai assistant peribadi |
| Hermes "guna Zernio" untuk auto-reply WhatsApp | **Separuh betul** | Zernio beri MCP tools sahaja. Auto-reply perlukan gelung webhook yang anda bina sendiri |
| Perlu Zernio untuk guna API rasmi WhatsApp | **Tak betul** | Hermes ada adapter `whatsapp_cloud` sendiri, terus ke Meta |
| Sambungan QR (Baileys) selamat, tiada ban | **Tak betul** | Docs Hermes sendiri kata "ban risk". Ia melanggar ToS WhatsApp |
| Meta dah haramkan AI chatbot di WhatsApp | **Separuh betul** | Yang diharamkan ialah AI *general-purpose* (ChatGPT dsb.). Bot jualan untuk bisnes sendiri dibenarkan |
| Semuanya percuma | **Separuh betul** | Software percuma, tapi perlu VPS (~RM20/bulan), token LLM, dan yuran Meta untuk template |
| Boleh guna nombor WhatsApp sedia ada | **Separuh betul** | Hanya nombor **WhatsApp Business app**, melalui Coexistence (Zernio sokong). Nombor WhatsApp peribadi tidak boleh |

## Hermes Agent memang ada dua pintu WhatsApp terbina dalam

"Hermes" dalam konteks ini ialah **Hermes Agent**: agent AI open-source (lesen MIT) dari Nous Research yang anda host sendiri. README-nya sendiri kata ia boleh "Run it on a $5 VPS" dan menyenaraikan WhatsApp sebagai saluran terbina dalam bersama Telegram, Discord, Slack dan Signal ([README](https://github.com/NousResearch/hermes-agent/blob/main/README.md)). Ini bukan produk SaaS. Tiada "akaun Hermes" untuk didaftar; anda install sendiri di VPS, PC atau Docker. Jangan keliru dengan model LLM "Hermes 3/4" keluaran Nous, yang merupakan benda berlainan.

Adapter pertama ialah **`whatsapp`**. Docs rasmi menyatakan dengan jelas bahawa ia guna bridge **Baileys**, iaitu "emulating a WhatsApp Web session — **not** through the official WhatsApp Business API". Tiada akaun Meta developer diperlukan; anda cuma imbas QR dari telefon ([Hermes WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)). Adapter kedua ialah **`whatsapp_cloud`**, yang guna **WhatsApp Business Cloud API rasmi Meta**. Docs menyifatkannya sebagai "the production-grade path: no Node.js bridge subprocess, no QR codes, no account-ban risk". Pertukarannya: anda perlukan akaun Meta Business, nombor bisnes khusus, dan URL HTTPS awam untuk webhook ([Hermes Cloud API docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp-cloud)). Docs Hermes sendiri memberi cadangan: "Most users running Hermes for personal projects prefer Baileys. Most users running customer-facing bots prefer Cloud API."

Untuk auto-reply kepada **customer**, Hermes boleh melakukannya, tetapi tetapan asalnya ketat. Tanpa allowlist, gateway "**denies all incoming messages**". Untuk membalas semua orang, anda perlu set `WHATSAPP_ALLOW_ALL_USERS=true` atau `WHATSAPP_CLOUD_ALLOW_ALL_USERS=true`. Docs ada seksyen khas "Customer-facing bot" yang memberi amaran bahawa "everyone on the allowlist is trusted the same way". Langkah hardening yang disarankan:

- matikan `tool_progress`, supaya customer tidak nampak tools yang dijalankan;
- set `interim_assistant_messages: false`;
- tetapkan `home_channel` kepada chat anda sendiri, supaya orang luar tidak boleh "rampas" notifikasi dengan `/sethome`;
- hadkan arahan admin dengan `allow_admin_from` ([Hermes WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)).

Ini menunjukkan Hermes asalnya direka sebagai **assistant peribadi**, dan mod customer service perlu dikonfigurasi dengan sengaja. Satu jurang yang belum terjawab: docs tidak menjelaskan sama ada memori jangka panjang agent diasingkan antara customer. Ini penting untuk privasi, jadi uji dahulu sebelum guna sebenar.

Dari segi ciri, adapter Cloud API menyokong:

- teks, gambar, voice note (ditranskrip automatik) dan dokumen;
- butang interaktif, read receipt dan typing indicator;
- **DM sahaja** (tiada group) dalam versi pertama.

Adapter ini **belum menyokong message template**, jadi Hermes tidak boleh menghantar follow-up selepas tamat tetingkap 24 jam ([Hermes Cloud API docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp-cloud)). Bagi advisor yang mahu follow-up customer selepas seminggu, ini batasan sebenar.

## Baileys QR murah, tapi nombor anda yang jadi taruhan

Laluan QR menarik kerana tiada kertas kerja Meta dan tiada yuran per mesej. Tetapi ia **melanggar terma WhatsApp**. Messaging Guidelines WhatsApp menyenaraikan tingkah laku terlarang termasuk "use unofficial clients, bulk messaging, auto-messaging, auto-dialing, or automation" ([WhatsApp Messaging Guidelines](https://www.whatsapp.com/legal/messaging-guidelines?lang=en)). ToS pula melarang "bulk messaging, auto-messaging" ([WhatsApp ToS UK](https://www.whatsapp.com/legal/terms-of-service-uk)). Docs Hermes sendiri mengaku bahawa "WhatsApp does **not** officially support third-party bots outside the Business API" dan mencadangkan nombor bot berasingan ([Hermes WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)).

Ban memang berlaku, walaupun buktinya anekdot dan bukan statistik. Dalam issue Baileys #1983, seorang pengguna yang menghantar mesej bertemplat kepada nombor yang tidak disimpan (~15–20 mesej sehari) kena restrict, kemudian ban sementara, dan akhirnya **ban kekal** ([Baileys #1983](https://github.com/WhiskeySockets/Baileys/issues/1983)). Issue #1869 pula melaporkan ban selepas bot membalas ahli group ([Baileys #1869](https://github.com/WhiskeySockets/Baileys/issues/1869)). Angka popular "68% bisnes kena ban dalam 12 bulan" datang daripada **analisis vendor** yang menjual API rasmi, jadi jangan percaya bulat-bulat ([adviseai.in](https://www.adviseai.in/blog/whatsapp-automation-ban-risk)).

Selain ban, laluan Baileys juga ada masalah operasi:

- **Mesej hilang senyap.** Issue Hermes #11951 (P1) melaporkan bridge "silently drops all messages": `/health` kata connected tetapi tiada mesej masuk. Issue ini ditutup pada Jun 2026 ([GitHub #11951](https://github.com/NousResearch/hermes-agent/issues/11951)).
- **Pairing passkey.** WhatsApp kini mewajibkan passkey semasa pairing peranti. Penyelesaian Hermes masih "has not been verified with a real WhatsApp account" dan memerlukan browser Chrome/Edge, jadi ia tidak berfungsi melalui SSH headless ([PASSKEY.md](https://github.com/NousResearch/hermes-agent/blob/main/scripts/whatsapp-bridge/PASSKEY.md)).

Bagi seorang sales advisor, nombor WhatsApp ialah aset yang menyimpan bertahun-tahun hubungan dengan customer. Kehilangan nombor itu jauh lebih mahal daripada RM sebulan yang dijimatkan. Kesimpulannya, **Baileys hanya untuk eksperimen dengan nombor kedua**. Bot inbound sahaja (balas orang yang mesej dulu, tanpa broadcast dan tanpa group) berisiko lebih rendah, tetapi **bukan sifar**.

## Zernio rasmi dan sah, tetapi MCP-nya tidak "mendengar" mesej masuk

Zernio (dahulunya Late / getlate.dev, rebrand sekitar Mac 2026) ialah "unified API" untuk media sosial, inbox, WhatsApp, SMS dan panggilan, yang disasarkan kepada AI agent ([npm @zernio/node](https://www.npmjs.com/package/@zernio/node); [zernio.com/rebrand](https://zernio.com/rebrand)). WhatsApp Zernio berjalan di atas **Cloud API rasmi Meta**. SDK rasminya (yang saya semak terus) mengandungi:

- aliran Meta **Embedded Signup** dan sambungan guna kredential WABA sendiri;
- template, broadcast dan inbox bersatu;
- webhook `message.received`, dan endpoint hantar `POST /v1/inbox/conversations/{id}/messages` ([npm @zernio/node](https://www.npmjs.com/package/@zernio/node)).

Zernio juga menyokong **Coexistence**: nombor yang sedang guna WhatsApp Business app boleh disambung ke API sambil app terus berfungsi, dengan had 20 msg/s dan tanpa Groups API ([docs.zernio.com connect](https://docs.zernio.com/platforms/whatsapp/connect)). Maklumat Coexistence ini datang daripada *snippet carian*, bukan bacaan penuh.

Memang ada halaman **zernio.com/hermes** yang mengajar cara tambah Zernio ke Hermes sebagai pelayan MCP HTTP `https://mcp.zernio.com/mcp` dengan login OAuth ([zernio.com/hermes](https://zernio.com/hermes), *snippet carian sahaja; halaman tidak dapat dibuka*). Dari sisi Hermes, konfigurasi MCP jauh guna corak `mcp_servers: { <nama>: { url: ..., auth: oauth } }` ([Hermes MCP docs](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/mcp.md)). Sebaliknya, repo Hermes sendiri **tiada sebarang integrasi Zernio**: `grep -ri zernio` pada commit 24 Nov 2026 tidak memberi hasil.

Inilah perkara paling penting yang sering disalah faham. **MCP memberi Hermes "tangan", bukan "telinga".** Dengan MCP Zernio, Hermes boleh *menyenaraikan* perbualan, *membaca* mesej dan *menghantar* balasan, tetapi hanya apabila ada sesuatu yang menyuruhnya, iaitu anda yang menaip arahan atau satu cron. MCP tidak menjadikan Zernio sebuah adapter gateway WhatsApp, jadi mesej baru customer **tidak** mencetuskan giliran Hermes secara automatik. SDK Zernio sendiri mengesyorkan "Subscribe to the `message.received` webhook for real-time delivery" ([npm @zernio/node](https://www.npmjs.com/package/@zernio/node)). Maknanya, auto-reply melalui Zernio memerlukan **gelung webhook**:

**Zernio `message.received` webhook → penerima anda (sahkan tandatangan) → Hermes/LLM jana jawapan → Zernio `POST /v1/inbox/conversations/{id}/messages`.**

Persoalan seterusnya ialah sama ada webhook Zernio boleh terus menembak Hermes. Saya semak repo Hermes. Hermes **memang ada** adapter webhook generik terbina dalam (port 8644, laluan `/webhooks/<route>`) yang boleh "trigger Hermes agent runs automatically" ([Hermes Webhooks docs](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/messaging/webhooks.md)). Hermes juga ada **API server serasi OpenAI** (`POST /v1/chat/completions`, `/v1/responses`, port lalai 8642, wajib `API_SERVER_KEY`) ([Programmatic Integration](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/developer-guide/programmatic-integration.md); [Env vars](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/reference/environment-variables.md)). Namun ada tiga halangan untuk menyambung Zernio **terus** ke adapter webhook:

1. **Format tandatangan tak sepadan.** Adapter webhook Hermes hanya menerima skema `generic` (`X-Webhook-Signature-V2` + `X-Webhook-Timestamp`, atau Standard Webhooks/Svix), `github`, `gitlab` dan `linear`. Tandatangan yang salah atau tidak dikenali dibalas `404`. Zernio pula menghantar `X-Zernio-Signature` (HMAC-SHA256 menurut SDK), dan skema itu tidak dikenali Hermes. Mod `INSECURE_NO_AUTH` hanya dibenarkan pada loopback ([webhook.py](https://github.com/NousResearch/hermes-agent/blob/main/gateway/platforms/webhook.py)).
2. **Tiada sasaran `deliver` untuk Zernio.** Senarai `deliver` hanya termasuk `whatsapp` milik Hermes sendiri, Telegram dan lain-lain. Balasan terpaksa dihantar oleh agent melalui tool MCP Zernio, dan toolset lalai untuk webhook sengaja dihadkan kepada `web_search`, `web_extract`, `vision_analyze` dan `clarify`.
3. **Tiada sambungan perbualan.** Setiap event webhook memulakan larian agent baru, jadi tiada kesinambungan perbualan per customer.

Kesimpulannya, **jurang terbuka:** setakat 24 Nov 2026, tiada cara rasmi untuk webhook Zernio terus menghidupkan Hermes. Penyelesaian paling bersih ialah satu **relay kecil** di VPS anda. Relay itu mengesahkan `X-Zernio-Signature`, memanggil API server Hermes dengan ID sesi per customer, kemudian menghantar balasan melalui API Zernio. Ini reka bentuk yang saya simpulkan dari dokumentasi; ia **belum diuji**.

Jalan pintas ketiga juga wujud. Melalui Zernio, anda boleh hidupkan **Meta Business Agent**, AI WhatsApp milik Meta sendiri, melalui endpoint `/v1/accounts/{accountId}/business-agent/*`. Untuk menghidupkannya kepada semua customer, anda perlu kaedah bayaran pada akaun billing Meta ([npm @zernio/node](https://www.npmjs.com/package/@zernio/node)). Harga dan kelayakan untuk Malaysia tidak ditemui.

## Polisi AI Meta tidak menyekat bot jualan kereta anda

Mulai **15 Jan 2026**, Meta melarang penyedia AI daripada guna WhatsApp Business API apabila AI itu ialah fungsi "primary (rather than incidental or ancillary)". Sasarannya ialah ChatGPT, Perplexity, Copilot dan seumpamanya, bukan bisnes yang guna AI untuk melayan customer sendiri ([TechCrunch](https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform); [respond.io](https://respond.io/blog/whatsapp-general-purpose-chatbots-ban)). Bot yang menjawab soalan tentang model Perodua, harga, pinjaman, promosi dan tempahan test drive jatuh di pihak "ancillary" yang dibenarkan. Meta tetap berkuasa penuh menentukan apa yang "primary", jadi pastikan system prompt **menolak soalan luar topik** (kerja sekolah, coding, sembang umum).

Business Messaging Policy juga dilaporkan mewajibkan "prompt, clear and direct escalation paths" kepada manusia ([upperfloor.ai](https://upperfloor.ai/en/blog/meta-policy-ai-agents), *sumber sekunder*). Jadi bot anda mesti ada pilihan "cakap dengan advisor". Ingat juga, polisi ini hanya untuk API rasmi. Ia tidak menghalalkan Baileys, yang sudah pun dilarang di bawah ToS pengguna.

Di Malaysia, simpan juga dalam fikiran PDPA (Pindaan) 2024. Pemindahan data rentas sempadan kini berasaskan risiko (berkuat kuasa 1 Apr 2025), manakala kewajipan DPO dan notifikasi kebocoran data bermula 1 Jun 2025 ([Lexology](https://www.lexology.com/library/detail.aspx?g=8cec8a2a-8733-42ae-83f9-d322ba96cbea); [Shook Lin & Bok](https://shooklin.com.my/legal-update/action-required-new-guidelines-on-data-protection-officer-appointment-data-breach-notification-and-cross-border-personal-data-transfers/)). Chat customer yang dihantar ke LLM luar negara ialah pemindahan rentas sempadan. Langkah praktikal:

- letak notis ringkas dalam BM/EN pada balasan pertama (chat ini mungkin dijawab AI dan disimpan);
- jangan minta IC atau slip gaji melalui bot.

Satu perkara belum disahkan: sama ada nama paparan seperti "Ali – Perodua Sales Advisor" diterima tanpa kebenaran pengedar. Semak dengan pengedar anda dahulu.

## Kos sebulan di Malaysia: kebanyakannya RM20–RM90 + token LLM

Sejak 1 Julai 2025, Meta mengecaj **per template yang dihantar**. Mesej customer membuka **tetingkap 24 jam** untuk balasan bebas. Mulai **1 Okt 2026**, balasan "service" dalam tetingkap itu percuma untuk **1,000 mesej pertama sebulan per nombor**, dan selepas itu dicaj pada kadar utility ([respond.io pricing change](https://respond.io/blog/whatsapp-pricing-change-2026)). Perubahan 1 Okt ini **hanya disahkan oleh sumber pihak ketiga**; halaman Meta tidak dapat dibaca. Blog Zernio pula menyenaraikan service Malaysia sebagai "Free", jadi ada percanggahan. Kadar Malaysia yang dilaporkan ialah **marketing USD 0.0860 (RM0.3467)**, dan **utility/authentication/service berbayar USD 0.0140 (RM0.0564)** ([respond.io Malaysia](https://respond.io/blog/whatsapp-api-pricing-malaysia); [Flowcall](https://www.flowcall.co/blog/whatsapp-business-api-pricing)). Kad kadar Gallabox menunjukkan angka lebih tinggi (USD 0.0989 / 0.0161), mungkin versi lama ([Gallabox](https://docs.gallabox.com/pricing-and-billing/whatsapp-pricing/rate-card)). Satu sumber Malaysia juga kata kad kadar final Okt 2026 belum diterbitkan ([mrvsmedia](https://www.mrvsmedia.com/resources/whatsapp-business-pricing-change-october-2026-malaysia/)). Kadar tukaran tersirat ialah ~RM4.03/USD.

Untuk Zernio, model terkini yang dilaporkan ialah bayaran **per akaun bersambung**:

- akaun 1–2 percuma;
- akaun 3–10 pada USD 6 sebulan setiap satu;
- 10,000 mesej keluar inbox sebulan percuma, kemudian USD 1 per 10,000.

Yuran Meta dibil terus kepada WABA anda tanpa markup ([docs.zernio.com/pricing](https://docs.zernio.com/pricing); [docs.zernio.com/pricing/inbox](https://docs.zernio.com/pricing/inbox), *snippet carian*). Ulasan lama ada menyebut pelan tetap dan "inbox add-on" yang bercanggah dengan model ini, jadi semak halaman harga semasa sebelum melanggan ([MakerStack](https://makerstack.co/reviews/zernio-review/)).

| Item (anggaran sebulan) | A: Hermes `whatsapp_cloud` (disyorkan) | B: Hermes + Zernio (relay) | C: Hermes Baileys QR |
|---|---|---|---|
| Software Hermes | RM0 (MIT) | RM0 | RM0 |
| VPS ("$5 VPS" menurut README) | ~USD 5 ≈ RM20 | ~RM20 (relay pada VPS sama) | ~RM20 |
| Zernio | — | RM0 (≤2 akaun, ≤10k mesej) | — |
| Meta: 600 balasan AI dalam tetingkap 24j (<1,000) | RM0 | RM0 | RM0 (tiada Meta) |
| Meta: 300 utility (cth. pengesahan test drive) | ~USD 4.20 ≈ RM17* | ~RM17 | — |
| Meta: 200 template marketing (promo kepada lead opt-in) | ~USD 17.20 ≈ RM69* | ~RM69 | — |
| Balasan service melebihi 1,000 | ~5.6 sen setiap satu | ~5.6 sen | — |
| Token LLM | Bergantung model (tiada angka rasmi) | Sama | Sama |
| Kos tersembunyi | Kertas kerja Meta | Kerja bina relay | **Risiko ban nombor** |

\*Hermes belum menyokong template, jadi baris utility dan marketing di bawah A hanya terpakai jika anda hantar template melalui alat lain. Jumlah realistik untuk bot inbound sahaja: **~RM20 sebulan + token LLM**. Dengan template: **~RM90–110**.

Satu peringatan teknikal: setiap giliran Hermes membawa system prompt dan skema tools yang besar, jadi kos token per balasan lebih tinggi daripada chatbot ringkas. Model murah melalui OpenRouter, atau Ollama tempatan, boleh mengawal kos ([Providers docs](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/integrations/providers.md)). Penting juga: **GitHub Pages tidak boleh menjalankan semua ini.** Ia hanya hos fail statik dan tidak boleh menerima webhook, jadi VPS (atau PC yang hidup 24/7) memang wajib.

## Langkah setup: laluan disyorkan dan alternatif

**Syarat asas (semua laluan):**

- VPS Linux (atau Mac/WSL2) yang hidup 24/7;
- akaun penyedia LLM (OpenRouter, Anthropic, OpenAI, Nous Portal, atau Ollama tempatan);
- nombor telefon khusus untuk bot.

Laluan rasmi juga memerlukan Meta Business Portfolio. Portfolio yang belum disahkan bermula dengan had **250 penerima unik per 24 jam** untuk mesej yang *dimulakan bisnes*. Balasan dalam tetingkap 24 jam tidak dikira ([chatarmin](https://chatarmin.com/en/blog/whats-app-messaging-limits)). Coexistence (kekalkan WhatsApp Business app pada nombor yang sama) dilaporkan disokong di Malaysia sejak Mei 2025, tetapi hanya untuk nombor **WhatsApp Business app**, bukan WhatsApp peribadi ([forwardchat.my](https://forwardchat.my/blog/whatsapp-business-coexistence-malaysia), *sumber vendor*).

### Laluan A (disyorkan): Hermes + `whatsapp_cloud` terus ke Meta

Semua langkah ini disokong docs rasmi ([Hermes Cloud API docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp-cloud); [README](https://github.com/NousResearch/hermes-agent/blob/main/README.md)).

1. Di VPS, pasang Hermes: `curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash`. Kemudian jalankan `hermes model` untuk pilih LLM.
2. Cipta Meta Business Portfolio di business.facebook.com. Di developers.facebook.com/apps, pilih **Create App** → use case "Connect with customers through WhatsApp" dan pastikan WABA dipautkan. Docs Hermes menganggap nombor bisnes khusus dan **tidak menyebut Coexistence**. Kalau anda mahu kekalkan nombor WhatsApp Business sedia ada, Laluan B lebih sesuai.
3. Jana **System User permanent token** dengan kebenaran `business_management`, `whatsapp_business_messaging` dan `whatsapp_business_management`, dan tetapkan expiration "Never". Token sementara mati selepas 24 jam.
4. Jalankan `hermes whatsapp-cloud`. Wizard akan minta Phone Number ID (bukan nombor telefon!), Access Token, App Secret, dan menjana Verify Token.
5. Dedahkan port 8090 dengan HTTPS, contohnya `cloudflared tunnel --url http://localhost:8090`. Untuk produksi, guna tunnel bernama atau domain sendiri, kerana URL trycloudflare dijana secara rawak.
6. Dalam Meta App Dashboard → WhatsApp → Configuration, set Callback URL `https://<url-anda>/whatsapp/webhook` dan Verify Token, klik **Verify and save**, kemudian langgan medan **messages**.
7. Dalam `~/.hermes/.env`, set `WHATSAPP_CLOUD_ALLOW_ALL_USERS=true` supaya bot jawab semua customer. Lakukan hardening "Customer-facing bot": `tool_progress: "off"`, `interim_assistant_messages: false`, `home_channel` ke chat anda, dan `allow_admin_from`. Buang prefix "☤ Hermes Agent" dengan `whatsapp.reply_prefix: ""` ([Hermes WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)).
8. Tulis arahan persona: jawab hanya topik Perodua dan perkhidmatan anda, tolak soalan umum, tawarkan "cakap dengan advisor", dan sertakan notis PDPA ringkas.
9. Jalankan sebagai servis: `sudo hermes gateway install --system`.
10. Uji dengan nombor sendiri. Menurut docs Hermes, mod pembangunan hanya membenarkan 5 nombor penerima sehingga App Review.

### Laluan B: Zernio + Hermes (gelung webhook, untuk Coexistence / inbox pelbagai platform)

1. Daftar di Zernio dan sambung WhatsApp melalui Embedded Signup. Pilih kekal di WhatsApp Business app untuk Coexistence. Matikan two-step verification dahulu ([zernio.com coexistence blog](https://zernio.com/blog/whatsapp-coexistence), *snippet carian*).
2. Pada Hermes (Laluan A langkah 1), hidupkan API server: `API_SERVER_ENABLED=true`, `API_SERVER_KEY=<rahsia>`, port 8642 pada localhost.
3. *(Pilihan, untuk kegunaan operator)* Tambah MCP Zernio dalam `~/.hermes/config.yaml`: `mcp_servers: { zernio: { url: "https://mcp.zernio.com/mcp", auth: oauth } }`. Dengan ini anda boleh suruh Hermes "senaraikan perbualan WhatsApp hari ini". Ini **tidak** mengaktifkan auto-reply.
4. Bina **relay kecil** (Node/Python) di VPS yang sama, dengan URL HTTPS awam. Relay itu perlu:
   - terima POST `message.received`;
   - sahkan `X-Zernio-Signature` (HMAC-SHA256; semak format tepat di docs Zernio);
   - abaikan mesej keluar/echo;
   - panggil `POST http://127.0.0.1:8642/v1/chat/completions` dengan `Authorization: Bearer <API_SERVER_KEY>` dan pengecam sesi per `conversationId` (docs menyebut header `X-Hermes-Session-Id`; semak semantiknya di halaman API Server);
   - hantar jawapan ke Zernio `POST /v1/inbox/conversations/{conversationId}/messages` dengan `ZERNIO_API_KEY`.
5. Daftar webhook di Zernio (`POST /v1/webhooks/settings`, events `["message.received"]`) dan uji dengan `/v1/webhooks/test`.
6. Hadkan kadar balasan bawah ~10 mesej/minit per penerima untuk elak ralat Meta 131056. Pantau `whatsapp.account.quality_updated`. Ambil perhatian: webhook Zernio dimatikan automatik selepas kegagalan berterusan selama 3 hari ([npm @zernio/node](https://www.npmjs.com/package/@zernio/node)).

### Laluan C (eksperimen sahaja): Hermes Baileys QR

1. Install Hermes, kemudian jalankan `hermes whatsapp`, pilih mod **bot**, dan imbas QR dari **nombor kedua** (WhatsApp → Linked Devices).
2. Dalam `.env`: `WHATSAPP_ENABLED=true`, `WHATSAPP_MODE=bot`, `WHATSAPP_ALLOWED_USERS=60xxxxxxxxx` (atau `*`), kemudian `sudo hermes gateway install --system`.
3. Jangan sesekali broadcast atau mesej nombor yang tidak menghubungi anda dahulu ([Hermes WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)).

## Tahap kepastian sumber

Fakta tentang Hermes (adapter, arahan, adapter webhook dan API server) datang daripada **sumber primer**: klon repo `NousResearch/hermes-agent` pada commit `4c84e786` (24 Nov 2026). Fakta tentang endpoint dan webhook Zernio datang daripada SDK rasmi `@zernio/node` v0.2.1802, juga primer. Sebaliknya, halaman zernio.com (termasuk /hermes dan harga), halaman polisi dan harga Meta, data Coexistence Malaysia, dan perubahan harga 1 Okt 2026 **hanya dilihat melalui snippet carian atau blog vendor**, kerana hos-hos itu disekat semasa kajian. Sahkan angka-angka ini di developers.facebook.com/docs/whatsapp/pricing dan docs.zernio.com sebelum membuat keputusan kewangan. Ulasan bebas tentang Zernio juga sedikit dan bercampur, contohnya "The API is great.. when it works" ([Trustpilot](https://ch.trustpilot.com/review/zernio.com)). Produk WhatsApp Zernio pula baru dilancarkan pada Jun 2026 ([Product Hunt](https://www.producthunt.com/p/zernio/zernio-whatsapp-api)).

## Kesimpulan

Mesej sebenar di sebalik dakwaan "Hermes + Zernio = auto-reply WhatsApp" ialah dua lapisan yang sering dicampur. **Lapisan saluran** menentukan siapa yang menerima mesej customer: Baileys, Cloud API terus, atau Zernio. **Lapisan otak** ialah Hermes/LLM. Hermes sudah ada saluran rasmi sendiri (`whatsapp_cloud`), jadi Zernio bukan prasyarat. Zernio menambah nilai hanya pada kes khusus: Coexistence dengan nombor Business sedia ada, inbox IG/FB/WhatsApp bersatu, broadcast template (yang Hermes belum sokong), atau Meta Business Agent. Untuk kes-kes itu pun, anda perlu sanggup menulis relay kecil sendiri, kerana webhook Zernio tidak serasi terus dengan adapter webhook Hermes.

Bagi seorang advisor Perodua, keputusan praktikalnya jelas. Mulakan dengan **Laluan A** pada nombor bisnes khusus, hadkan bot kepada topik jualan, dan sediakan serahan kepada manusia. Kemudian ukur jumlah balasan sebulan. Selagi bawah 1,000 balasan service dan tiada template, kos Meta hampir sifar, dan perbelanjaan sebenar ialah VPS dan token LLM. Laluan B patut dipertimbangkan hanya apabila anda mahu nombor WhatsApp Business lama kekal hidup di telefon atau mula buat follow-up template secara besar-besaran.
