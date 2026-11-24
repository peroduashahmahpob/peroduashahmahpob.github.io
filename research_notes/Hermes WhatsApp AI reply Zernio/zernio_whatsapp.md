# Zernio (formerly Late / getlate.dev): WhatsApp capabilities and AI-agent (Hermes) integration, as of 24 Nov 2026

**Method note (read first):** In this research session, direct page fetches to zernio.com, docs.zernio.com, dev.to, docs.rs and producthunt.com were blocked by the sandbox network. Evidence therefore comes from (a) web-search result summaries of those pages, which are lower confidence, and (b) **primary evidence I inspected directly**: Zernio's official npm packages. These are `@zernio/node` v0.2.1802, published 24 Nov 2026, whose generated SDK `sdk.gen.ts` embeds the OpenAPI doc comments and has ~1,378 endpoint bindings, and `@zernio/cli` v0.7.0, published 23 Nov 2026, including its `SKILL.md`. Claims marked **[SDK]** were read verbatim from the official SDK source, which is the same OpenAPI spec that docs.zernio.com is generated from. Claims marked **[search]** come from search-engine summaries of the cited pages and were not read in full.

## 1. What Zernio is, who runs it, and whether it is the rebranded Late / getlate.dev

### Takeaway
It is verified that Zernio is the rebrand of Late (getlate.dev), done around March 2026. It is a developer-first "unified API" for social publishing, DMs/inbox, ads, WhatsApp, SMS and calls, aimed at AI agents. It is run by founder Miki Palet (npm/GitHub handle `mikipalet`, miki@zernio.com) and a small team.

### Cited Findings
- Zernio's official rebrand page says that old getlate.dev URLs permanently redirect to zernio.com and existing API keys keep working. It also says the Node SDK moved from `@getlatedev/node` to `@zernio/node`, the env var changed from `LATE_API_KEY` to `ZERNIO_API_KEY`, and old SDK packages stay usable for about 6 months [search]. — [zernio.com/rebrand](https://zernio.com/rebrand)
- The founder, Miki Palet, said on Product Hunt that the product "outgrew" the Late name as it became broader social-media infrastructure. Zernio marketing dates the change to March 2026 ("Late becomes Zernio"); EveryDev.ai says early 2026 [search]. — [Product Hunt activity](https://www.producthunt.com/@paletmiki/activity); [EveryDev.ai](https://www.everydev.ai/tools/zernio); [zernio.com/marketing-infrastructure](https://zernio.com/marketing-infrastructure)
- npm registry data I checked directly:
  - `@zernio/node` was first published 17 Mar 2026. `@getlatedev/node` is still published in lockstep (v0.2.1802 on 24 Nov 2026), and its description reads "The official Node.js library for the Zernio API".
  - The official packages (`@zernio/node`, `@zernio/cli`, `@zernio/chat-sdk-adapter`, `n8n-nodes-zernio`) are maintained by `mikipalet` plus team accounts (`gemmatm`, `pauguicas`, `paugc`). The author email is miki@zernio.com / hello@zernio.com, and the GitHub org is `zernio-dev`.
  - Source: [npm @zernio/node](https://www.npmjs.com/package/@zernio/node); [npm @getlatedev/node](https://www.npmjs.com/package/@getlatedev/node); [GitHub zernio-dev](https://github.com/zernio-dev)
- Positioning: the homepage title is "Zernio – Marketing Infrastructure for Agents", and it describes social, ads, inbox, WhatsApp, SMS and calls behind one API key [search]. — [zernio.com](https://zernio.com/); [zernio.com/agents](https://zernio.com/agents)
- Platform list per the official CLI (18 platforms): Instagram, TikTok, X, LinkedIn, Facebook, YouTube, Threads, Pinterest, Bluesky, Google Business Profile, Snapchat, WhatsApp, Telegram, Discord, Slack, iMessage, LINE, WeChat. The official CLI README says "Built for developers and AI agents. Outputs JSON by default." — [npm @zernio/cli README / SKILL.md](https://www.npmjs.com/package/@zernio/cli)
- The SDK [SDK] covers far more than posting. Endpoint groups include:
  - inbox (DMs, comments, reviews, mentions) and contacts, broadcasts, sequences
  - automations / comment-to-DM
  - ads (Meta, Google, TikTok, LinkedIn, X, Pinterest, Reddit, OpenAI/ChatGPT Ads, etc.)
  - email (Gmail/Microsoft), phone numbers/SMS/voice, analytics, webhooks
  - Source: [npm @zernio/node source](https://www.npmjs.com/package/@zernio/node)
- A Wati comparison describes Zernio as "a unified REST API for developers and AI agents" covering messaging, publishing, inboxes, analytics and ads across 15+ platforms. It contrasts Zernio with Wati's no-code inbox/chatbot product for business teams [search]. — [Wati vs Zernio](https://www.wati.io/geo/comparing-whatsapp-and-instagram-api-providers-for-growing-teams)

### Inferences
- Zernio is a developer API/infrastructure product, not a turnkey no-code WhatsApp chatbot/inbox SaaS like Wati or SleekFlow. Using it with an AI agent means wiring API + webhooks (or MCP) yourself.
- The very high release cadence (several SDK versions per day on 24 Nov 2026) shows active development. It also means docs and features change fast, so re-verify before building.

### Gaps
- Company legal entity, HQ country, and funding were not verified, because the pages could not be fetched.
- Exact rebrand date: sources conflict between "March 2026" and "early 2026". npm data (the `@zernio/node` scope was created 17 Mar 2026) supports March 2026.

## 2. WhatsApp support specifics (send, templates, receive, inbox, broadcast, automation, API endpoints)

### Takeaway
WhatsApp support is extensive and real. Zernio runs on Meta's official WhatsApp Business Platform / Cloud API, not an unofficial Baileys-style bridge. The SDK covers:
- sending and receiving through a unified inbox
- templates, broadcasts and sequences
- Flows, catalogs, WhatsApp groups and calling
- business profile, phone-number purchase, a sandbox
- real-time `message.received` webhooks

The WhatsApp product launched publicly on Product Hunt on 19 Jun 2026.

### Cited Findings
- The Product Hunt launch, "Zernio WhatsApp API – One API for WhatsApp: messaging, calling, and AI agents", was on 19 Jun 2026. Zernio's API reference advertises 37 WhatsApp endpoints for messaging, broadcasts, contacts, templates, phone numbers and business profile. It mentions free API key signup, "one-click Meta OAuth", REST, SDKs, CLI and a hosted MCP server [search]. — [Product Hunt](https://www.producthunt.com/p/zernio/zernio-whatsapp-api); [zernio.com/whatsapp-api](https://zernio.com/whatsapp-api); [zernio.com/whatsapp](https://zernio.com/whatsapp)
- **Connection flows** [SDK] — [npm @zernio/node](https://www.npmjs.com/package/@zernio/node):
  - `POST /v1/connect/whatsapp/embedded-signup` exchanges the code from **Meta's Embedded Signup popup**. Integrators start the hosted flow with `GET /v1/connect/whatsapp?signup=hosted` and send the user to the returned `authUrl`.
  - `GET /v1/connect/whatsapp/sdk-config` returns "the Meta app id and Embedded Signup configuration id". In other words, Zernio uses **its own Meta app**, which is consistent with a Tech Provider setup.
  - `POST /v1/connect/whatsapp/credentials` is the "headless alternative". You supply your own WABA ID, Phone Number ID, and a permanent System User token with `whatsapp_business_management` + `whatsapp_business_messaging`.
  - Warning from the SDK doc: connecting this way "redirects its webhook delivery to Zernio", and the WABA's events "stop reaching any callback URL you had configured before".
  - `POST /v1/connect/whatsapp/select-phone-number` picks the number to connect.
  - `/v1/accounts/{accountId}/whatsapp/register|request-code|verify-code` re-registers a number. This is needed if the number has its own two-step-verification PIN; otherwise Meta error 133005 makes sends fail with "(#200) You do not have the necessary permission".
- **Meta Tech Provider status:**
  - Zernio's site says it is a Meta Tech Provider on the official WhatsApp Business Platform [search]. — [zernio.com/blog/whatsapp-coexistence](https://zernio.com/blog/whatsapp-coexistence); [docs.zernio.com/platforms/whatsapp/connect](https://docs.zernio.com/platforms/whatsapp/connect)
  - The coexistence blog says coexistence requires being a Meta Solution Partner or Tech Provider. Zernio says it handles the Meta app, app review, Embedded Signup, token management and webhooks for the customer [search]. — [zernio.com/blog/whatsapp-coexistence](https://zernio.com/blog/whatsapp-coexistence)
- **Coexistence (keep using the WhatsApp Business app on the same number) is supported:**
  - Embedded Signup offers to keep the number in the WhatsApp Business app unless `onboarding=api` is passed. Keeping it caps throughput at 20 msg/s and disables the Groups API and calling [search]. — [docs.zernio.com/platforms/whatsapp/connect](https://docs.zernio.com/platforms/whatsapp/connect)
  - SDK health docs mention a `coexistenceHistorySync` status. Meta shares a coexistence number's chat history only once [SDK]. — [npm @zernio/node](https://www.npmjs.com/package/@zernio/node)
- **Sending** [SDK]:
  - `POST /v1/inbox/conversations/{conversationId}/messages` "Supports text, attachments, quick replies, buttons, templates, and message tags".
  - WhatsApp per-recipient pacing is "roughly 10 per minute". Bursts return 400 with Meta code `131056`.
  - Reactions, typing indicator and read receipts are supported (`/reactions`, `/typing`, `/read`).
- **Templates** [SDK]: `GET/POST /v1/whatsapp/templates`, `/v1/whatsapp/templates/{templateName}`, `/v1/whatsapp/templates/id/{templateId}`, `/v1/whatsapp/template-library`. Templates are "fetched directly from the WhatsApp Cloud API".
- **Broadcasts** [SDK + CLI]: `/v1/broadcasts` plus `/send`, `/schedule`, `/cancel`, `/recipients`. CLI example: `zernio broadcasts:create ... --platform whatsapp --templateName "order_confirmation" --templateLanguage "en"`. Broadcasts and sequences work across all inbox platforms, including WhatsApp. — [npm @zernio/cli SKILL.md](https://www.npmjs.com/package/@zernio/cli)
- **Unified inbox** [SDK]:
  - `GET /v1/inbox/conversations` fetches DMs from "Facebook, Instagram, X, Bluesky, Reddit, Telegram, WhatsApp, iMessage, SMS, LINE and WeChat" in one call.
  - The SDK recommends: "Subscribe to the `message.received` webhook for real-time delivery, and use `updatedSince` to reconcile."
  - Also available: labels, search, accept, thread-control (handover), and an inbox analytics group (response time, volume, heatmap).
- **Other WhatsApp endpoints** [SDK]:
  - Flows: `/v1/whatsapp/flows`, publish, send, preview, encryption-key.
  - Commerce: catalogs and commerce-settings.
  - WhatsApp groups: `/v1/whatsapp/wa-groups`, participants, invite-link.
  - Calling: `/v1/whatsapp/calls`, call-permissions, recordings, estimate.
  - Business profile: display-name, photo, username.
  - Blocking: block-users.
  - Conversational automation (Meta ice breakers, slash commands, welcome message).
  - Number management: number-info, phone-number purchase/KYC (deprecated alias of `/v1/phone-numbers/*`).
  - A **sandbox**: `/v1/whatsapp/sandbox/sessions`, "one-phone-per-user".
- **Quickstart sandbox:** a test setup needs "no number purchase, no WhatsApp Business Account, and no Meta review". A reply from the user opens the 24-hour window for free-form text. To message real customers you must connect your own number [search]. — [docs.zernio.com/quickstart](https://docs.zernio.com/quickstart)
- **Webhook events** in the SDK types [SDK] include:
  - Messages: `message.received`, `message.sent`, `message.delivered`, `message.read`, `message.failed`, `message.edited`, `message.deleted`.
  - Conversations: `conversation.started`, `conversation.control_changed`.
  - Comments: `comment.received`, `comment.keyword`.
  - Accounts: `account.connected/disconnected/restricted/rate_limited`.
  - WhatsApp-specific: `whatsapp.template.status_updated`, `whatsapp.template.category_updated`, `whatsapp.account.quality_updated`, `whatsapp.account.name_status_updated`, `whatsapp.number.*` (activated, suspended, verification_required, etc.).
- **Webhook mechanics** [SDK]:
  - Up to 50 webhooks per user, created via `POST /v1/webhooks/settings` (name, url, events).
  - Deliveries carry `X-Zernio-Event`, `X-Zernio-Event-Id` and `X-Zernio-Signature` headers (signing secret).
  - Retry ladder, logs and redelivery (`/v1/webhooks/logs`, `/v1/webhooks/logs/redeliver`), and a test endpoint (`/v1/webhooks/test`).
  - Auto-disable happens after 3 days with no successful delivery, combined with either 20 consecutive terminal failures or 3 days of continuous failure.
- **Comment-to-DM / automations** [SDK + CLI]: `/v1/comment-automations`, `/v1/automations` (catalog, templates, approvals, backtest, take-over), `/v1/sequences`, `/v1/workflows`. The SDK states: "Sequences and comment to DM need the inbox add-on…; Flows need the inbox add-on and a full-access key."

### Inferences
- Zernio offers everything needed for a WhatsApp AI-reply loop at the API level: inbound webhook, conversation ID, and a send endpoint.
- Comment-to-DM is primarily an Instagram/Facebook feature. On WhatsApp, the equivalent automations are sequences, broadcasts and Flows.

### Gaps
- The full WhatsApp `message.received` webhook payload schema was not read; check the docs' Webhook Events page.
- The exact HMAC algorithm behind `X-Zernio-Signature` was not confirmed. One third-party GitHub project describes it as a "signed webhook" ([carlosbasile19 PR](https://github.com/carlosbasile19/dispensario-santisima-trinidad/pull/12)).
- Whether an "inbox add-on" is still a separate purchase under the newer usage-based pricing is unclear (see section 4).

## 3. AI agent integrations: MCP, CLI, n8n/Make/Zapier, skills, and Hermes Agent specifically

### Takeaway
Zernio runs an **official hosted MCP server** at `https://mcp.zernio.com/mcp` (OAuth 2.1). It also has a **dedicated Hermes Agent setup page** (zernio.com/hermes), an official CLI with a `SKILL.md` (it names Claude Code and OpenClaw), an official n8n community node, and a Chat SDK adapter. Zernio's Hermes integration is MCP-based: Hermes gets tools to send, read, post and so on. It is **not** a push channel that makes Hermes react to incoming WhatsApp messages automatically.

### Cited Findings
- **Hermes page:**
  - zernio.com/hermes ("Hermes MCP Server for Social Media") tells users to add Zernio to Hermes as a single HTTP MCP server named `zernio`, URL `https://mcp.zernio.com/mcp`, with no auth headers. Auth is an OAuth 2.1 sign-in that Hermes opens.
  - Headless setups can use an API key instead.
  - A suggested test is asking Hermes to list the connected Zernio accounts.
  - The page says 16 platforms; the agents page says 18 [search].
  - Source: [zernio.com/hermes](https://zernio.com/hermes); [zernio.com/agents](https://zernio.com/agents)
- **Hermes-side MCP config:** an `mcp_servers` block in `~/.hermes/config.yaml` or `hermes mcp add`, then `/reload-mcp` to apply [search]. — [Hermes docs: Use MCP with Hermes](https://hermes-agent.nousresearch.com/docs/guides/use-mcp-with-hermes); [GitHub NousResearch/hermes-agent guide](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/guides/use-mcp-with-hermes.md)
- **WhatsApp MCP page:** zernio.com/whatsapp-mcp markets a "WhatsApp MCP Server on the Official Business API". It describes the 24-hour window limit for AI agents, with replies inside the window free [search]. Zernio also says its hosted MCP has 300+ tools generated from the OpenAPI spec [search]. — [zernio.com/whatsapp-mcp](https://zernio.com/whatsapp-mcp); [chatgate.ai summary](https://chatgate.ai/post/zernio-whatsapp-api)
- **Official CLI** `@zernio/cli`:
  - Commands include `inbox:conversations`, `inbox:messages`, `inbox:send`, broadcasts, sequences and automations.
  - The README says "This CLI ships with a `SKILL.md` file for AI agent discovery (Claude Code, OpenClaw, etc.)".
  - Auth is `zernio auth:login` or `ZERNIO_API_KEY`, and the API base defaults to `https://zernio.com/api`.
  - Source: [npm @zernio/cli](https://www.npmjs.com/package/@zernio/cli)
- **Official Chat SDK adapter** `@zernio/chat-sdk-adapter` (v0.5.1, Aug 2026): "build chatbots across Instagram, Facebook, Twitter/X, Telegram, WhatsApp, Bluesky, and Reddit through a single integration". — [npm @zernio/chat-sdk-adapter](https://www.npmjs.com/package/@zernio/chat-sdk-adapter)
- **Official n8n node** `n8n-nodes-zernio` (v0.7.1, May 2026, maintainer mikipalet): its description covers posting to 13 platforms. WhatsApp is not listed in that description. — [npm n8n-nodes-zernio](https://www.npmjs.com/package/n8n-nodes-zernio)
- **Third-party / unofficial packages** (not by Zernio):
  - `zernio-mcp` by Eyalm321: a stdio MCP with "275 tools … WhatsApp Business".
  - `zernio-cli` by mrgoonie.
  - `n8n-nodes-zernio-messaging` by autoverse12.
  - `convex-flows`: "conversational flows over Zernio (WhatsApp first)".
  - A Spanish-language kit `Hainrixz/whatsapp-agentkit` ("build your WhatsApp AI agent… Zernio or Meta Cloud API").
  - Sources: [npm zernio-mcp](https://www.npmjs.com/package/zernio-mcp); [npm convex-flows](https://www.npmjs.com/package/convex-flows); [GitHub whatsapp-agentkit](https://github.com/Hainrixz/whatsapp-agentkit)
- **Make / Zapier:** a TaskMagic app exists (`@taskmagic/apps-zernio`). I found no evidence of official Make or Zapier apps for Zernio in this session. — [npm @taskmagic/apps-zernio](https://www.npmjs.com/package/@taskmagic/apps-zernio)
- **Hermes Agent's own WhatsApp support** (context, independent of Zernio):
  - Hermes has a built-in WhatsApp gateway using a Baileys (WhatsApp Web emulation) bridge with QR pairing via `hermes whatsapp`. It is unofficial and carries ban risk.
  - Guides also mention an official Cloud API path, `hermes whatsapp-cloud` [search; the command name comes from third-party guides].
  - Sources: [Hermes docs: WhatsApp](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp); [hermes-agent.ai WhatsApp integration](https://hermes-agent.ai/integrations/whatsapp); [hermeswatcher.com](https://hermeswatcher.com/learn/hermes-agent-whatsapp-setup)

### Inferences
- **Hermes + Zernio MCP alone** gives an *operator-driven* agent: you ask Hermes to read the inbox, reply or broadcast. For *automatic* replies to every incoming WhatsApp message, something must trigger Hermes on each `message.received` webhook. Options:
  - (a) a small webhook-receiver service that verifies `X-Zernio-Signature`, calls Hermes (via its API server/gateway, or a cron/polling skill) or an LLM directly, then calls Zernio's send-message endpoint; or
  - (b) Hermes polling `GET /v1/inbox/conversations?updatedSince=…` via MCP on a schedule. This is slower and less reliable.
  - I did not verify whether Hermes can natively accept arbitrary inbound webhooks as a trigger.
- Compared with Hermes's native Baileys bridge, Zernio + Cloud API is the compliant, ban-safe route. The trade-off is Meta business onboarding, template rules, the 24-hour window, and per-message costs.

### Gaps
- No Zernio-published tutorial specifically for a Hermes WhatsApp auto-reply loop (webhook → Hermes → reply) was found. The Hermes page covers MCP setup only.
- The full contents of zernio.com/hermes were seen only via search summary.

## 4. Building an AI auto-reply loop, and whether there is a built-in AI reply feature

### Takeaway
A DIY loop is fully supported:
1. The `message.received` webhook delivers the incoming message.
2. Your code or agent produces a reply.
3. `POST /v1/inbox/conversations/{id}/messages` sends it.

Zernio also exposes **Meta's own "Meta Business Agent"** (Meta's native AI agent for WhatsApp) through `/v1/accounts/{accountId}/business-agent/*`. That is the closest thing to a built-in AI auto-reply, but it is Meta's AI, billed by Meta, and needs eligibility.

### Cited Findings
- **Recommended pattern** [SDK]: "Subscribe to the `message.received` webhook for real-time delivery". The send endpoint supports text, buttons, quick replies and templates.
- **Tone-of-voice data** [SDK]: listing messages with `direction=outgoing` lets you "collect examples of how you write to customers, for example to teach an AI agent your tone of voice."
- **Meta Business Agent endpoints** [SDK]:
  - `GET /v1/accounts/{accountId}/business-agent` reports "whether the number is eligible, whether the Meta Business Agent terms are accepted, whether an agent exists, whether it is on".
  - `POST .../business-agent/onboard` creates the agent (an ineligible number gets 403 `business_agent_not_eligible`).
  - Configuration: `faqs`, `files`, `websites`, `skills`, `connectors` (with tools / `tools/{toolId}/run`), `allowlist`, `budget`, `evals`, `test-messages`, `business-information`.
  - `PATCH .../business-agent/settings`: `rollout.enabled`. Turning it on for `EVERYONE` "needs a payment method on the Business Agent billable account (Meta accepts the call but delivers nothing without one)". `ALLOWLISTED_ONLY` allows testing with a few numbers without billing. `never_say_phrases` is also available.
  - Source: [npm @zernio/node](https://www.npmjs.com/package/@zernio/node)
- **Human/AI handover** [SDK]: `POST /v1/inbox/conversations/{id}/thread-control`. On WhatsApp numbers with Meta Business Agent enabled, `take` stops the agent and `release` hands back. Meta rejects `pass` ("Pass action is not supported", verified 2026-09-08). Webhook `conversation.control_changed` reports owner `app | ai_agent | other`.
- **Third-party evidence of the DIY pattern:** a GitHub PR for a clinic's WhatsApp reminders uses Zernio with Coexistence. Patient replies arrive via Zernio's signed webhook, which confirms or cancels the visit and replies [search]. — [GitHub PR](https://github.com/carlosbasile19/dispensario-santisima-trinidad/pull/12)
- **Marketing claims:** the Zernio WhatsApp landing says it "works with any AI backend" and that the Embedded Signup flow means no separate Meta app is needed [search]. — [zernio.com/whatsapp](https://zernio.com/whatsapp)

### Inferences
- A loop of `message.received` → AI → reply within the 24-hour customer-service window should normally incur no Meta charge, since service replies are free under Meta's per-message model per Zernio's MCP page. It does consume Zernio's inbox outbound-message meter.
- Pace replies to under about 10/min per recipient to avoid error 131056.
- A user-run AI (Hermes/Claude/etc.) via webhook gives full control and model choice. Meta Business Agent is lower-effort but a black box with eligibility and billing constraints.

### Gaps
- Meta Business Agent pricing and eligibility (including Malaysia availability) were not found.
- I could not confirm whether Zernio's own automation builder (`/v1/automations`, `/v1/workflows`) includes a native LLM "AI reply" action. The SDK types contain `'ai'`, `'ai_turn'`, `'ai_assistant'` literals, but their context was not verified.

## 5. Pricing (USD), plan inclusion of WhatsApp, Meta fees, and onboarding requirements

### Takeaway
As of late 2026, Zernio reportedly prices **per connected account**, with all features included:
- accounts 1–2 free
- accounts 3–10 at $6/month each
- accounts 11–100 at $3/month each
- accounts 101+ at $1/month each

On top of that comes a metered inbox (outbound) message charge: 10,000/month included per team, then $1 per 10,000, starting 1 Oct 2026. Meta's WhatsApp per-message fees are billed by Meta directly to the customer's WABA with no Zernio markup, per Zernio. Older fixed plans (Build/Accelerate/Unlimited with add-ons) appear in older reviews and conflict with this.

### Cited Findings
- **Current per-account model:** "Zernio has no plans. You pay per connected social account per month", with the bands above. The inbox meter is 10,000 outbound messages/month per team, then $1 per 10,000 ($0.0001/msg), from 1 Oct 2026, covering the Inbox API, Broadcasts, sequences and workflows [search]. — [docs.zernio.com/pricing](https://docs.zernio.com/pricing); [docs.zernio.com/pricing/inbox](https://docs.zernio.com/pricing/inbox)
- **Prepaid balances:** Zernio's pricing page says prepaid balances will cover phone numbers, SMS, calls and some other channels for every account from 1 Dec 2026 [search]. — [docs.zernio.com/pricing](https://docs.zernio.com/pricing)
- **Conflicting older pricing:**
  - MakerStack (about 7 months old) lists Build at $16/mo (yearly), Accelerate at $41/mo and Unlimited at $833/mo, with paid add-ons for Analytics, "Comments and DMs" (inbox) and Ads [search]. — [makerstack.co review](https://makerstack.co/reviews/zernio-review/)
  - The current SDK still references "Analytics add-on", "Ads add-on" and "inbox add-on" requirements, and "legacy Stripe accounts" vs "usage-based billing" [SDK].
  - Inference: legacy plan holders may still have add-on gating. Confirm on the live pricing page.
- **WhatsApp launch pricing claim:** "free for your first 2 accounts… you pay exactly what Meta charges per message sent" plus the Zernio subscription [search]. — [Product Hunt WhatsApp launch](https://www.producthunt.com/p/zernio/zernio-whatsapp-api); [zernio.com/whatsapp-api](https://zernio.com/whatsapp-api)
- **Meta fee pass-through:** Zernio says Meta bills the WABA directly and Zernio adds no markup on message fees. Its Twilio comparison lists Zernio's per-message WhatsApp fee at $0 vs Twilio's $0.005 (vendor claim) [search]. — [zernio.com/whatsapp-api-pricing](https://zernio.com/whatsapp-api-pricing); [zernio.com/alternatives/twilio](https://zernio.com/alternatives/twilio)
- **Phone numbers:**
  - Buying a number requires usage-based billing (the "Usage plan") with a payment method on file. The price is a flat monthly fee per country, quoted by `GET /v1/phone-numbers/countries`.
  - Regulated countries return `kyc_required`. The number of numbers is limited by plan [SDK].
  - Zernio's pages mention numbers in 53–55 countries (counts vary by page) [search]. — [zernio.com/alternatives/twilio](https://zernio.com/alternatives/twilio); [zernio.com/blog/whatsapp-business-api-pricing](https://zernio.com/blog/whatsapp-business-api-pricing)
- **Requirements** [search]:
  - Meta business verification is required to exceed 250 messages/day, and Zernio's Embedded Signup flow handles the verification request as part of onboarding. — [zernio.com/whatsapp](https://zernio.com/whatsapp)
  - Outside the 24-hour window, only approved template messages work. — [zernio.com/whatsapp-mcp](https://zernio.com/whatsapp-mcp)
  - The coexistence blog says two-step verification must be off before onboarding. — [zernio.com/blog/whatsapp-coexistence](https://zernio.com/blog/whatsapp-coexistence)
  - Display name status is shown in the dashboard (Aug 2026 update), and the webhook `whatsapp.account.name_status_updated` reports display-name review results [SDK]. — [zernio.com/blog/august-26-2026-product-updates](https://zernio.com/blog/august-26-2026-product-updates)
  - The credentials connect path requires a Meta Business Suite System User token [SDK].
- **Phone number on the WhatsApp app:** a number already on the consumer WhatsApp app must be removed before API registration. That is standard Meta policy, not Zernio-specific, and was not verified in Zernio docs. A number on the **WhatsApp Business app** can instead be connected via coexistence (see section 2).

### Inferences
- **Rough minimum cost for one WhatsApp number plus an AI auto-reply bot:**
  - $0 Zernio account fee if it is within the first 2 connected accounts.
  - Inbox sends free up to 10k/month, then $0.0001 each.
  - Meta fees: $0 for service replies inside the 24-hour window; template sends billed per Meta's rate card.
  - Plus any Zernio-purchased number fee, if you do not bring your own number.
- These figures rest on search summaries of the docs. Verify on docs.zernio.com/pricing before quoting.

### Gaps
- I could not read the live zernio.com/pricing page directly. Exact current WhatsApp-specific inclusions, and whether "WhatsApp counts as a connected account", were not confirmed.
- Meta Business Agent (AI) pricing was not found.

## 6. Malaysia availability and limitations

### Takeaway
I found no Malaysia-specific restriction for connecting a Malaysian WhatsApp Business number via Zernio. Meta's Cloud API supports Malaysia, and Zernio's pricing calculator lists Malaysia rates. Whether Zernio can *sell* a Malaysian (+60) number is unverified.

### Cited Findings
- **Meta rates for Malaysia** (USD, effective 1 Oct 2026, per rate-card sites and Zernio's calculator) [search]:
  - marketing $0.086/message
  - utility, authentication and service $0.014 each
  - authentication-international $0.0418
  - Malaysia is one of nine markets with a separate auth-international rate.
  - Sources: [zernio.com/whatsapp-api-pricing](https://zernio.com/whatsapp-api-pricing); [purands.com](https://www.purands.com/whatsapp-pricing); [whautomate.com](https://whautomate.com/whatsapp-business-api-pricing)
- **MYR-billed equivalents:** MYR 0.3467 for marketing and MYR 0.0564 for the other categories [search]. — [flowcall.co](https://www.flowcall.co/blog/whatsapp-business-api-pricing)
- **Conflict:** Zernio's blog lists Malaysia's "service" rate as "Free", while rate-card sites show $0.014. Service conversations initiated by the user and answered within 24 hours are generally free under Meta's model, which likely explains the difference. — [zernio.com/blog/whatsapp-business-api-pricing](https://zernio.com/blog/whatsapp-business-api-pricing)

### Inferences
- A Malaysian business bringing its own +60 number through Embedded Signup should work like any other Cloud API market. Meta business verification (SSM documents) is likely needed to scale beyond 250/day.

### Gaps
- Zernio's list of number-purchase countries (`GET /v1/phone-numbers/countries`) was not retrieved, so it is unknown whether +60 numbers are purchasable.
- No Malaysian user reports of Zernio were found.

## 7. Reviews, user reports, reliability

### Takeaway
There are few independent reviews and they are mixed. Users report early posting errors that improved over time, "great API when it works", and pricing complaints from the AppSumo/Late era. I found no WhatsApp-specific reliability reports, and the WhatsApp product is only about 5 months old (June 2026).

### Cited Findings
- **Trustpilot reviewers:**
  - One reports early posting errors but says "the reliability of the platform continues to improve".
  - A 3-star review says "The API is great.. when it works", and Zernio replied asking for details [search]. — [Trustpilot zernio.com](https://ch.trustpilot.com/review/zernio.com)
- **AppSumo (Late era):** a reviewer complained that additional API features stopped working, and about pricing [search]. — [AppSumo Late reviews](https://appsumo.com/products/late/reviews)
- **Low review volume:** Product Hunt shows about 2 reviews, and GetApp UK shows a single 1.0/5 rating [search]. — [Product Hunt reviews](https://www.producthunt.com/products/zernio/reviews); [GetApp UK](https://www.getapp.co.uk/software/2084070/late)
- **Uptime claim:** Zernio's trust page claims 99.97% uptime (vendor claim) [search]. — [zernio.com](https://zernio.com/)
- **Known platform outage:** organic Reddit functionality returns 503 `PLATFORM_DISABLED` because Reddit blocked third-party API access. This is not WhatsApp-related [search]. — [zernio.com/reddit](https://zernio.com/reddit)
- **Documented WhatsApp operational gotchas** [SDK]:
  - two-step-verification PIN error 133005 causing misleading permission errors
  - per-recipient rate limit 131056
  - coexistence history sync can happen only once
  - connecting via credentials hijacks existing WABA webhooks
  - Meta rejects the thread-control `pass` action (verified 2026-09-08)

### Inferences
- The SDK documents many edge cases in detail, which suggests a team actively fixing real WhatsApp/Meta issues. It also shows that the Meta platform layer has real gotchas.
- For a production AI auto-reply bot, monitor webhook auto-disable and `whatsapp.account.quality_updated` events.

### Gaps
- No Reddit or X threads discussing Zernio WhatsApp reliability were found.
- No YouTube tutorials on Zernio + WhatsApp + Hermes were found in this session.
