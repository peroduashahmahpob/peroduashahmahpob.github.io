# Hermes Agent (Nous Research) and WhatsApp AI auto-reply: research notes (as of 24 Nov 2026)

Method note: the primary source is a shallow clone of `github.com/NousResearch/hermes-agent` at HEAD commit `4c84e786` (committed 24 Nov 2026), so everything marked "repo/docs" reflects the docs as of that day. The repo's `website/docs/` folder is the source of the official docs site (hermes-agent.nousresearch.com/docs). The `gh api` calls were blocked in this session, so issue data comes from fetching github.com pages directly. `zernio.com` and `hermify.io` could not be fetched because this session's network does not allow those hosts, so claims about them come only from search-result snippets and are marked that way.

Doc URLs used below:
- Baileys guide: https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp (source: https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/messaging/whatsapp.md)
- Cloud API guide: https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp-cloud (source: https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/messaging/whatsapp-cloud.md)

## Q1. What "Hermes" means here, and other products with the name

### Takeaway
In the context of "AI auto-reply on WhatsApp", "Hermes" almost certainly means **Hermes Agent**, the MIT-licensed, self-hosted agent by Nous Research. It ships native WhatsApp support, and nearly all "Hermes + WhatsApp" search results are about it. I found no separate WhatsApp CRM or marketing product called "Hermes".

### Cited Findings
- The README describes it as "The self-improving AI agent built by Nous Research… Run it on a $5 VPS, a GPU cluster, or serverless infrastructure". It is MIT-licensed, and its docs live at hermes-agent.nousresearch.com/docs — [README](https://github.com/NousResearch/hermes-agent/blob/main/README.md)
- The README lists WhatsApp as a built-in channel: "Telegram, Discord, Slack, WhatsApp, Signal, and CLI — all from a single gateway process." — [README](https://github.com/NousResearch/hermes-agent/blob/main/README.md)
- A third-party search summary dates the first public release to Feb/Mar 2026. Release notes put v0.2.0 at 12 Mar 2026 (tag v2026.3.12) — [hermesagents.net recap](https://hermesagents.net/blog/hermes-agent-v0-2-0-public-launch); [mirrored RELEASE_v0.2.0.md](https://download.ai.regdesk.co/youtube/2026-04-18-hermes-vs-openclaw/hermes-agent/RELEASE_v0.2.0.md)
- Latest version: a third-party report says v0.23.1 was the newest tag as of 12 Nov 2026, and that v0.23.0 shipped on 5 Nov 2026. I could not verify this against GitHub releases — [Hermes Atlas, "State of Hermes Agent — November 2026"](https://hermesatlas.com/reports/state-of-hermes-november-2026)
- Other uses of the name "Hermes":
  - **Hermes LLM models** (Hermes 3/4 etc.) are Nous Research's open-weight model family. They are a different thing from the agent, though the agent can run them. The model family is general knowledge and was not re-verified here.
  - **Hermes Desktop** is the desktop app for the same agent — [README header](https://github.com/NousResearch/hermes-agent/blob/main/README.md)
  - **NousResearch/Hermes-Bot-Mode** is a separate Nous repo that turned up in search; I did not inspect its purpose — [GitHub](https://github.com/NousResearch/Hermes-Bot-Mode/issues)
  - **Third-party sites and hosting around Hermes Agent**: hermify.io (blog plus apparent hosting service), hermesagents.net and hermesatlas.com (community news), Hostinger and OVHcloud "managed Hermes Agent" VPS offers, and a Docker Hub image — [Hostinger](https://www.hostinger.com/hermes-agent); [OVHcloud](https://www.ovhcloud.com/en/vps/vps-hermes-agent/); [Docker Hub](https://hub.docker.com/r/nousresearch/hermes-agent)
  - **Unrelated GitHub repos named "hermes"** (e.g. vlblanco/hermes, wellux/hermes) also appear in searches — [vlblanco/hermes](https://github.com/vlblanco/hermes); [wellux/hermes](https://github.com/wellux/hermes)
- A search for a WhatsApp marketing or CRM product named "Hermes" returned only generic WhatsApp CRMs (Clientify, Chatarmin, Mercately, respond.io) and nothing called Hermes — [respond.io list](https://respond.io/es/blog/best-whatsapp-marketing-software)

### Inferences
- When a user says "Hermes connecting to WhatsApp and replying with AI", they mean Hermes Agent's WhatsApp gateway. The report should still note that Hermes Agent is not a SaaS: you self-host it, or rent a managed VPS from a third party.

### Gaps
- I could not open GitHub Releases through the API to confirm the exact latest tag or date.

## Q2. Built-in WhatsApp adapter: does it exist, and how is it implemented?

### Takeaway
Yes. Hermes Agent ships **two first-party WhatsApp adapters**:
1. **`whatsapp`**: a Baileys-based bridge that emulates WhatsApp Web and pairs by QR code. It is unofficial and carries ban risk.
2. **`whatsapp_cloud`**: Meta's official WhatsApp Business Cloud API, which needs a webhook and a Meta Business account.

The two can run side by side on different numbers. There are also community plugins for other WhatsApp paths.

### Cited Findings
- Docs quote: "Hermes connects to WhatsApp through a built-in bridge based on **Baileys**. This works by emulating a WhatsApp Web session — **not** through the official WhatsApp Business API. No Meta developer account or Business verification is required." — [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- The bridge is a Node.js process (`scripts/whatsapp-bridge`). Its `package.json` says "WhatsApp bridge for Hermes Agent using Baileys" and pins `@whiskeysockets/baileys` at `7.0.0-rc13`, alongside express, pino, playwright-core and qrcode-terminal. It identifies itself to WhatsApp as `browser: ['Hermes Agent', 'Chrome', '120.0']` — [package.json](https://github.com/NousResearch/hermes-agent/blob/main/scripts/whatsapp-bridge/package.json); [bridge.js](https://github.com/NousResearch/hermes-agent/blob/main/scripts/whatsapp-bridge/bridge.js)
- Bridge architecture: it listens on loopback (default port 3000) with endpoints `/messages`, `/send`, `/send-poll`, `/send-location` and `/health`. A per-session bearer token (`.bridge-token`) is required on every route — [WhatsApp docs, "Bridge API authentication"](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- The docs present the two paths as alternatives: "This page is for the **Baileys bridge** — quick to set up, personal accounts, no public URL needed, ban risk. If you're running a real business bot and want stability, see the **WhatsApp Business Cloud API guide**… no account ban risk, but requires a Meta Business account and a public webhook URL. The two adapters can also run in parallel against different phone numbers." — [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- The Cloud API docs say: "This is the production-grade path: no Node.js bridge subprocess, no QR codes, no account-ban risk." Its dependencies are "Pure Python (httpx + aiohttp)", running an aiohttp webhook server on port 8090 at path `/whatsapp/webhook`, with default Graph API `v20.0` — [WhatsApp Cloud docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp-cloud)
- Community WhatsApp plugins listed in the repo's `plugin-catalog/` (all community tier, none official):
  - `whatsapp-agent-platform`: uses Meta's WhatsApp Agent Platform API (`/agent/v1`) with long-poll and no public URL. By default only the creator can message it. Requires Hermes ≥0.21.4.
  - `go-whatsapp`: GOWA MCP server with outbound tools and an opt-in watch.
  - `hermes-whatsapp-voice`: live voice calls via the Rust `whatsapp-rust` sidecar and Gemini Live. It answers only the owner's number.
  - `timelinesai-whatsapp`: a hosted MCP for a TimelinesAI team inbox.
  — [plugin-catalog](https://github.com/NousResearch/hermes-agent/tree/main/plugin-catalog); [marketplace page](https://hermes-agent.nousresearch.com/marketplace/whatsapp-agent-platform)
- Composio also publishes a "WhatsApp MCP with Hermes" integration page. It is third-party and not inspected — [Composio](https://composio.dev/toolkits/whatsapp/framework/hermes-agent)

### Inferences
- Earlier coverage often mentioned only Baileys. As of Nov 2026 the official Cloud API adapter exists and has its own wizard (`hermes whatsapp-cloud`), so any guide claiming "Hermes only supports unofficial WhatsApp" is outdated.

### Gaps
- I did not pin down when `whatsapp_cloud` was added, because the clone was shallow and has no history.

## Q3. Exact setup steps

### Takeaway
Install with the one-line installer, run `hermes model` to pick an LLM, then run `hermes whatsapp` (Baileys QR) or `hermes whatsapp-cloud` (Meta API wizard). Next, set the allowlist env vars in `~/.hermes/.env` and run `hermes gateway`. For 24/7 operation use `hermes gateway install`, which sets up a user service, or add `--system` on Linux, on a VPS or in Docker.

### Cited Findings
- Install commands: `curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash` (Linux/macOS/WSL2) or `iex (irm https://hermes-agent.nousresearch.com/install.ps1)` (native Windows). The installer handles Python 3.14, Node.js, npm, pnpm, ripgrep and FFmpeg. There is also an Android/Termux APT repo. `hermes model` chooses the provider — [README](https://github.com/NousResearch/hermes-agent/blob/main/README.md)
- The docs' guided option: "Run `hermes gateway setup` and pick **WhatsApp** for a guided walk-through." — [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- Baileys prerequisites: "**Node.js v20+** and **npm**" and "A phone with WhatsApp installed (for scanning the QR code)". Passkey-protected accounts also need Chrome or Edge, via `hermes whatsapp --passkey-browser "/path"`. Passkey pairing does not work over headless SSH or through dashboard onboarding — [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- Step 1 is `hermes whatsapp`. The wizard asks for a mode (bot or self-chat), installs the bridge dependencies, and shows a QR code. You scan it from your phone under WhatsApp → Settings → Linked Devices → Link a Device. QR codes refresh about every 20 seconds, and the terminal must be at least 60 columns wide — [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- Two modes:
  - **Separate bot number** (recommended): "Clean UX, multiple users, lower ban risk".
  - **Personal self-chat**: "You message yourself to talk to the agent".
  For a second number the docs suggest Google Voice (free, US), a prepaid SIM ($5–15) or VoIP (TextNow etc., some of which WhatsApp blocks) — [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- Step 3 goes in `~/.hermes/.env`: `WHATSAPP_ENABLED=true`, `WHATSAPP_MODE=bot` (or `self-chat`), and `WHATSAPP_ALLOWED_USERS=15551234567` (comma-separated, country code, no `+`). Use `*` or `WHATSAPP_ALLOW_ALL_USERS=true` to allow everyone. Optional `config.yaml` setting: `whatsapp.unauthorized_dm_behavior: ignore` (the default `pair` sends strangers a pairing code) — [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- Run commands: `hermes gateway` (foreground), `hermes gateway install` (user service), or `sudo hermes gateway install --system` ("Linux only: boot-time system service"). "The gateway starts the WhatsApp bridge automatically using the saved session." — [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- Service details: the systemd unit uses `Restart=always`. The docs say "Use the system service on VPS or headless hosts that should come back at boot". In containers, run `hermes gateway run` as the main process with a restart policy, because user-service install is refused inside containers. macOS uses launchd and Windows uses schtasks — [Messaging gateway docs](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/messaging/index.md)
- The session persists at `~/.hermes/platforms/whatsapp/session` (mode 0700). "If containerized, mount it as a persistent volume." — [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- Cloud API path:
  - Run `hermes whatsapp-cloud` (wizard).
  - Prerequisites: Meta Business account, Meta app with WhatsApp, and a public HTTPS URL. The docs recommend `cloudflared tunnel --url http://localhost:8090`, with ngrok or a reverse proxy as alternatives.
  - Env vars: `WHATSAPP_CLOUD_PHONE_NUMBER_ID`, `WHATSAPP_CLOUD_ACCESS_TOKEN`, `WHATSAPP_CLOUD_APP_SECRET`, `WHATSAPP_CLOUD_VERIFY_TOKEN`, `WHATSAPP_CLOUD_ALLOWED_USERS` / `WHATSAPP_CLOUD_ALLOW_ALL_USERS`.
  - Temp tokens expire after 24h. Use a System User permanent token for production.
  - The webhook must subscribe to the `messages` field.
  — [WhatsApp Cloud docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp-cloud)
- Docker image: `nousresearch/hermes-agent` — [Docker Hub](https://hub.docker.com/r/nousresearch/hermes-agent)

### Inferences
- Minimal working sequence for a VPS bot on Baileys:
  1. Run the installer.
  2. `hermes model`
  3. `hermes whatsapp` (scan QR from the bot number)
  4. Edit `.env` (enable, mode, allowlist)
  5. `sudo hermes gateway install --system`

### Gaps
- None material. Exact wizard prompts were not run live.

## Q4. Can it auto-reply to anyone (customers)? Groups, voice, images? Personal assistant or customer-service bot?

### Takeaway
It can auto-reply to **any** contact if you set `WHATSAPP_ALLOWED_USERS=*` or `WHATSAPP_ALLOW_ALL_USERS=true`. By default it **denies everyone** until you configure access. It was designed as a personal or team assistant, but the docs now include a "Customer-facing bot" hardening section. Groups, voice notes (STT in, TTS out), images, polls, locations and documents are supported on Baileys. The Cloud adapter handles DMs only.

### Cited Findings
- "Without any of these, the gateway **denies all incoming messages** as a safety measure." By default, unauthorized DMs get a pairing code. Setting `ignore` makes the bot stay silent instead — [WhatsApp docs, Security](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- From the "Customer-facing bot" section: "Defaults assume the people on the allowlist are you and your team. If the bot number answers customers (`WHATSAPP_ALLOWED_USERS=*`…), everyone on the allowlist is trusted the same way, so harden the gateway before going live". The hardening steps are:
  - `display.platforms.whatsapp.tool_progress: "off"`. The default `new` shows customers each tool the agent runs.
  - `interim_assistant_messages: false`.
  - Set a `home_channel` to your own operator chat. Without one, any sender can run `/sethome` and take over cron and notification delivery.
  - `allow_admin_from` / `group_allow_admin_from`, so customers keep only `/help` and `/whoami`.
  — [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- Groups (Baileys): `WHATSAPP_GROUP_POLICY` defaults to `pairing`, which "forwards nothing from groups". The other values are `allowlist` (with group JIDs in `WHATSAPP_GROUP_ALLOWED_USERS`), `open` and `disabled`. `require_mention: true` makes the bot answer only @mentions, replies or /commands — [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp); [Env var reference](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/reference/environment-variables.md)
- Voice: "Incoming: Voice messages (.ogg opus) are automatically transcribed" via local faster-whisper, Groq Whisper or OpenAI Whisper. "Outgoing: TTS responses are sent as MP3 audio file attachments" on Baileys. On Cloud API, ffmpeg makes them native voice-note bubbles — [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp); [Cloud docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp-cloud)
- Media and other features:
  - Quoted images, voice notes, videos and documents are attached to the turn.
  - Native polls, clarify-as-poll and location pins are supported (Baileys).
  - Streaming replies arrive by editing the message.
  - Replies are chunked at 4,096 characters.
  - Markdown is converted to WhatsApp formatting.
  - A 0.3s debounce batches bursts of messages.
  - The default reply prefix "☤ **Hermes Agent**" can be removed with `whatsapp.reply_prefix: ""`.
  — [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- Cloud adapter inbound handles text, images (vision or auto-description), voice notes, documents (text files up to 100KB inlined), button taps and reply context. It uses native buttons and lists for clarify and approvals, and sends read receipts and a typing indicator. "Hermes's `whatsapp_cloud` adapter currently handles **direct messages only** in v1" — [Cloud docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp-cloud)
- The ban-risk warning says to avoid outbound automation: "Don't automate outbound messaging to people who haven't messaged first" and "Don't send bulk/spam messages" — [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- From the FAQ, on multiple agents per number: "Hermes profiles each require their own WhatsApp number/session. You cannot bind multiple profiles to different chats on the same WhatsApp number" — [FAQ](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/reference/faq.md)
- Bot mode can optionally forward owner-typed replies, for human takeover. A gate (`owner_message_gate.js`) stops owner replies to non-allowlisted strangers from bypassing the allowlist — [owner_message_gate.js](https://github.com/NousResearch/hermes-agent/blob/main/scripts/whatsapp-bridge/owner_message_gate.js)

### Inferences
- **Personal assistant first.** The README pitch ("builds a deepening model of who you are"), the self-chat mode and the default-deny design all point that way. Customer-service use is possible but needs deliberate hardening. Everyone allowed gets the same trust level and, by default, the same tool access: terminal, files and web. The tool-access point is an inference from "everyone on the allowlist is trusted the same way". For a public customer bot, the toolset should be restricted, and the Cloud API path is safer against bans.
- There is no built-in CRM: no human-agent inbox, labels or assignment. That would come from plugins such as TimelinesAI or from external platforms.

### Gaps
- I did not find docs on per-customer memory isolation, i.e. whether the agent's persistent memory or user profile is shared across all WhatsApp senders. This matters for customer privacy and should be checked.

## Q5. LLM providers and rough cost

### Takeaway
Hermes Agent works with essentially any provider: Nous Portal (subscription), OpenRouter, Anthropic, OpenAI or Codex, xAI, Gemini/Vertex, Bedrock, plus local Ollama, vLLM, llama.cpp and LM Studio, and many more. The software is free (MIT). Running costs are a VPS (the README says "$5 VPS") plus LLM tokens. I found no official per-message cost figure.

### Cited Findings
- "Use any model you want — Nous Portal, OpenRouter, OpenAI, your own endpoint, and many others… Switch with `hermes model`" — [README](https://github.com/NousResearch/hermes-agent/blob/main/README.md)
- The provider table includes:
  - Nous Portal (OAuth subscription)
  - OpenAI Codex (ChatGPT OAuth)
  - Anthropic (API key, or Claude Max plus extra credits via OAuth; Claude Pro OAuth is not supported)
  - OpenRouter (`OPENROUTER_API_KEY`)
  - Fireworks, NovitaAI, z.ai/GLM, Kimi, MiniMax, xAI, Qwen/DashScope, AWS Bedrock, Google Vertex, NVIDIA NIM, Hugging Face
  - Local or self-hosted: Ollama, vLLM, SGLang, llama.cpp, LM Studio, LiteLLM
  — [Providers docs](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/integrations/providers.md)
- Nous Portal "covers 300+ models under a single subscription with one OAuth login" and also bundles web search, image generation, TTS and a cloud browser through its "Tool Gateway". STT can be routed through it with `stt.provider nous` — [Providers docs](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/integrations/providers.md); [README](https://github.com/NousResearch/hermes-agent/blob/main/README.md)
- Voice transcription can be local faster-whisper (free), Groq or OpenAI — [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- On cost, the README claims "Run it on a $5 VPS". Bot numbers cost $0–15 per the docs table. Meta Cloud API conversation fees are not documented by Hermes — [README](https://github.com/NousResearch/hermes-agent/blob/main/README.md); [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)

### Inferences
- Agent turns include a large system prompt plus tool schemas, so each WhatsApp reply likely costs more tokens than a plain chatbot call. Cheap models via OpenRouter or a local Ollama keep costs low.

### Gaps
- The Nous Portal subscription price was not found in the repo docs.
- Meta's per-conversation pricing for the Cloud API is out of scope here.

## Q6. Known issues: disconnects, bans, session expiry, bugs

### Takeaway
The Baileys path is officially labelled unofficial with "ban risk", and it can break when WhatsApp changes its protocol. Re-pairing fixes session invalidation. Notable 2026 issues are a P1 "silently drops all messages" bug (closed Jun 2026) and the new WhatsApp **passkey** requirement during companion pairing, which Hermes now handles with a browser-based passkey flow. The Cloud path has a 24-hour window limit, no template support yet, and DMs only.

### Cited Findings
- Official warnings: "WhatsApp does **not** officially support third-party bots outside the Business API. Using a third-party bridge carries a small risk of account restrictions." and "WhatsApp periodically updates their Web protocol, which can temporarily break compatibility… pull the latest Hermes version and re-pair." — [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- The troubleshooting table lists:
  - "Logged out unexpectedly — WhatsApp unlinks devices after long inactivity. Keep the phone on…"
  - "Bridge crashes or reconnect loops"
  - "Bot stops working after WhatsApp update"
  - The macOS launchd problem "Node.js not installed" (PATH)
  - Messages not received because of an allowlist mismatch (debug with `WHATSAPP_DEBUG=true`)
  — [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- Issue **#11951**, "[Bug]: WhatsApp bridge silently drops all messages — syncFullHistory:false disables essential history sync in Baileys 7.x":
  - Opened 18 Apr 2026 and labelled P1, platform/whatsapp.
  - Symptom: `/health` says connected but `GET /messages` returns `[]` forever.
  - Reported setup: Baileys 7.0.0-rc.9, Node 22, Ubuntu 24.04 on an Oracle VPS.
  - Closed as completed on 21 Jun 2026, with no maintainer comment explaining the fix.
  — [GitHub issue #11951](https://github.com/NousResearch/hermes-agent/issues/11951)
- The current `bridge.js` still sets `syncFullHistory: false`, but Baileys is now pinned to the npm release `7.0.0-rc13` instead of rc.9. Per the issue, the upstream fix (Baileys commit c81c074, Jan 2026) had not been in an npm release at the time — [bridge.js](https://github.com/NousResearch/hermes-agent/blob/main/scripts/whatsapp-bridge/bridge.js); [PASSKEY.md](https://github.com/NousResearch/hermes-agent/blob/main/scripts/whatsapp-bridge/PASSKEY.md)
- Passkey:
  - `PASSKEY.md` says the passkey handshake is adapted from Baileys PR #2689, which "was closed unmerged". It also says "Availability of a phone or operating-system passkey… has not been verified with a real WhatsApp account."
  - A passkey challenge before connect in gateway mode exits the bridge with `whatsapp_passkey_required`, a non-retryable status that requires interactive pairing.
  - The docs repeat: "Availability of phone and OS passkeys, and real-account WhatsApp acceptance, still need end-to-end validation."
  — [PASSKEY.md](https://github.com/NousResearch/hermes-agent/blob/main/scripts/whatsapp-bridge/PASSKEY.md); [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- A third-party blog (hermify.io, seen only through search; I could not fetch it) blames QR pairing failures and immediate logouts on headless servers on WhatsApp's companion-device passkey rollout ("Shortcake", Baileys issue #2672). It recommends the Cloud API. This is unverified — [hermify.io blog (search snippet only)](https://www.hermify.io/en/blog/hermes-agent-whatsapp-not-connecting)
- Related upstream Baileys reports: #2249, a restart loop with "Too many reconnect attempts: 428", and #35, where the socket stops receiving messages after hours. These are general Baileys issues and not Hermes-specific — [Baileys #2249](https://github.com/WhiskeySockets/Baileys/issues/2249); [Baileys #35](https://github.com/WhiskeySockets/Baileys/issues/35)
- Multi-profile port conflicts produce the error codes `whatsapp_bridge_foreign_session`, `whatsapp_bridge_unresponsive` and `whatsapp_unpaired` — [WhatsApp docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp)
- Cloud API limitations:
  - Meta's 24-hour window: cron or async sends after 24h fail with Graph error `131047`.
  - "Message-template support… is not yet implemented in Hermes."
  - DMs only.
  - No client-side enforcement of the 80 msg/s limit.
  - Dev mode allows at most 5 recipient numbers until App Review.
  - Temp access tokens expire after 24h (error 190, subcode 463).
  — [Cloud docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp-cloud)

### Inferences
- For a business that auto-replies to customers, the Baileys path is a real operational risk: number bans, protocol breaks and passkey re-pairing that needs a GUI browser. The Cloud API path, or a Cloud-API-based third party, suits production better.

### Gaps
- I could not list open WhatsApp issues as of Nov 2026, because the API was blocked and search surfaced only #11951.
- I found no quantified ban reports.

## Q7. Is there a Zernio integration, skill or MCP for Hermes Agent?

### Takeaway
There is **no** Zernio integration inside the Hermes Agent repo: no skill, plugin-catalog entry or docs mention, checked by grep at HEAD on 24 Nov 2026. **Zernio itself** publishes a page at `zernio.com/hermes` explaining how to connect Hermes Agent to Zernio's hosted MCP server (`mcp.zernio.com/mcp`, OAuth). Hermes supports remote HTTP MCP servers with `auth: oauth`, so the integration works through generic MCP config. I could not fetch the Zernio pages, so these details are unverified.

### Cited Findings
- `grep -ri zernio` over the whole Hermes Agent repo (skills, optional-skills, plugin-catalog, docs) returned no matches at commit 4c84e786 (24 Nov 2026). The bundled optional `social-media` skills contain only `reddit-reading` — [hermes-agent repo](https://github.com/NousResearch/hermes-agent)
- Search snippet of zernio.com/hermes: Zernio is "a social media API" with a page on connecting it to Hermes Agent. One account connects 16 platforms, every endpoint is exposed as an MCP tool, and setup means registering the MCP server `mcp.zernio.com/mcp` with OAuth sign-in. I could not fetch the page (host blocked), and no Nous announcement of a joint integration was found — [zernio.com/hermes](https://zernio.com/hermes)
- From Zernio WhatsApp search snippets (vendor-stated, unverified):
  - Zernio has a hosted WhatsApp MCP and says it "runs on Meta's Cloud API, with no WhatsApp Web session to keep alive".
  - Inbox tools list and create conversations and give access to history, which helps with the 24h window.
  - It also covers templates, broadcasts, flows, calling and group chats.
  - The unified inbox also spans Instagram and Facebook DMs, SMS and iMessage.
  - Pricing is unclear: "2 accounts free forever" in one place, while WhatsApp reportedly needs an "Inbox addon" with a 7-day trial.
  — [Zernio WhatsApp MCP](https://zernio.com/whatsapp-mcp); [Zernio WhatsApp docs](https://docs.zernio.com/platforms/whatsapp); [Zernio blog: build a WhatsApp AI agent with Zernio and Claude](https://zernio.com/blog/how-to-build-whatsapp-ai-agent); [Zernio WhatsApp Workflows](https://zernio.com/blog/whatsapp-workflows); [Product Hunt](https://www.producthunt.com/p/zernio/zernio-whatsapp-api)
- A third-party community MCP wrapper exists: `Eyalm321/zernio-mcp` on Glama, with a `zernio_connect_whatsapp` tool — [Glama](https://glama.ai/mcp/servers/Eyalm321/zernio-mcp/tools/zernio_connect_whatsapp)
- How Hermes connects to remote OAuth MCP servers (docs example pattern):
  ```yaml
  mcp_servers:
    linear:
      url: "https://mcp.linear.app/mcp"
      auth: oauth
  ```
  "On first connect, Hermes prints an authorize URL… Tokens are cached at `~/.hermes/mcp-tokens/<server>.json`." — [MCP docs](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/mcp.md)

### Inferences
- A Zernio entry would likely be `mcp_servers: { zernio: { url: "https://mcp.zernio.com/mcp", auth: oauth } }`. This is inferred from the Hermes docs pattern plus Zernio's stated URL and was not tested.
- Zernio's MCP gives Hermes *tools* to read or send via Zernio's inbox. It does **not** make Hermes a WhatsApp gateway adapter, so inbound customer messages would not automatically trigger a Hermes turn. True auto-reply via Zernio would need one of:
  - Zernio's own WhatsApp Workflows or AI agent feature
  - A Zernio webhook pointed at Hermes's webhook platform (`website/docs/user-guide/messaging/webhooks.md` exists; not inspected)
  - A cron job that polls the inbox
- The two routes to WhatsApp auto-reply therefore differ:
  - **Hermes native gateway** (Baileys or Cloud API): inbound messages trigger the agent directly.
  - **Hermes + Zernio MCP**: the agent can act on the Zernio inbox, but event-driven auto-reply needs extra wiring or Zernio's own automation.

### Gaps
- The zernio.com/hermes page could not be read in full. The exact steps, whether a Zernio "skill" for Hermes exists, and its date are unverified.
- I did not check whether Zernio webhooks can target the Hermes webhook adapter.
