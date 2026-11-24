# WhatsApp AI Auto-Reply for a Malaysian Car Sales Advisor: Official (Cloud API / BSP / Zernio) vs Unofficial (Baileys / whatsapp-web.js / WAHA / Evolution API) — as of Nov 2026

> **Research method note (read first):** In this session, WebFetch could not reach `developers.facebook.com`, `www.whatsapp.com` or `sleekflow.io` (the hosts were blocked by the session's network allowlist). So **no Meta primary page was read in full**. All findings below come from search-result snippets and summaries. Many are third-party vendor/BSP blogs, and those vendors have a commercial interest, usually in pushing the official API. Where only secondary sources exist, this is flagged. Before quoting exact policy wording or rates to the user, verify against Meta's pages:
> - developers.facebook.com/docs/whatsapp/pricing
> - whatsapp.com/legal/business-solution-terms
> - whatsapp.com/legal/business-policy

## 1. Meta terms on unofficial clients, and the real ban risk of Baileys-style bots (2025–2026)

### Takeaway
WhatsApp's consumer Terms and Messaging Guidelines explicitly prohibit unofficial clients, bulk messaging, auto-messaging and automation. Every unofficial library (Baileys, whatsapp-web.js, and the WAHA/Evolution API wrappers) carries a real but unpredictable ban risk, and the projects themselves say so. Bans happen in practice. The evidence is anecdotal (GitHub issues), not statistical, and the most consistent triggers are messaging unsaved or unknown contacts, bulk or template-like sends, group activity, and robotic timing. A purely inbound auto-reply bot is lower risk than outbound blasting, but it is still a ToS violation and is never risk-free.

### Cited Findings
- WhatsApp's Messaging Guidelines (last updated 16 Feb 2024) list among harmful conduct efforts to "use unofficial clients, bulk messaging, auto-messaging, auto-dialing, or automation to harm WhatsApp or our users". — [WhatsApp Messaging Guidelines](https://www.whatsapp.com/legal/messaging-guidelines?lang=en)
- The WhatsApp Terms of Service (UK version) prohibit sending impermissible communications "such as bulk messaging, auto-messaging". They also bar non-personal use unless authorized, and say users must not "directly or through automated means: (a) reverse engineer, alter, modify…" the Services. — [WhatsApp ToS (UK)](https://www.whatsapp.com/legal/terms-of-service-uk)
- The current general Terms say: "You must not (or assist others to) directly, indirectly, through automated or other means, access, use, copy, adapt, modify…" the Services without authorization. — [WhatsApp Terms of Service](https://www.whatsapp.com/legal/terms-of-service)
- An older EEA ToS revision (Jan 2021) barred creating accounts "through unauthorized or automated means". It is archived and may be outdated. — [WhatsApp ToS EEA 2021 revision](https://www.whatsapp.com/legal/terms-of-service-eea/revisions/20210104)
- WhatsApp has a separate "Third-Party Agents Terms" page, reportedly dated Aug 2026, covering AI agents and bots that connect via WhatsApp's platform. Its details were not verified. — [WhatsApp Third-Party Agents Terms](https://www.whatsapp.com/legal/third-party-agents-terms)
- whatsapp-web.js states that "it is not guaranteed you will not be blocked". WAHA's documentation says "WhatsApp does not allow bots or unofficial clients". These quotes come via a third-party comparison and were not read directly. — [pipes.bot: Evolution API vs WAHA vs Baileys](https://www.pipes.bot/blog/evolution-api-vs-waha-vs-baileys-whatsapp-ban-risk); [wa.genuka.com comparison](https://wa.genuka.com/en/docs/compare/unofficial-whatsapp-apis)
- Evolution API and WAHA are REST wrappers around Baileys or similar engines (WAHA also offers browser-based engines), so the protocol-level ban risk is essentially the same as Baileys. — [pipes.bot](https://www.pipes.bot/blog/evolution-api-vs-waha-vs-baileys-whatsapp-ban-risk); [SocialMate: Baileys vs WAHA](https://socialmate.app/blog/baileys-vs-waha/)
- **GitHub evidence.** In Baileys issue #1983 ("[BUG] - WhatsApp number banning", ~Oct 2025), a user sending templated messages to non-saved contacts with no prior chats, around 15–20 messages a day, was restricted, then temporarily banned, then permanently banned. — [WhiskeySockets/Baileys #1983](https://github.com/WhiskeySockets/Baileys/issues/1983)
- Baileys issue #1869 ("High number of bans on WhatsApp!"): users report bans including one immediately after the bot responded to a group member on v7.0, and bans when bots were added to groups without spamming. — [WhiskeySockets/Baileys #1869](https://github.com/WhiskeySockets/Baileys/issues/1869)
- The third-party "baileys-antiban" middleware claims that WhatsApp's ML models heavily weight reply-ratio, contact-graph distance and temporal patterns. This is the project's own claim and is not independent evidence. — [kobie3717/baileys-antiban](https://github.com/kobie3717/baileys-antiban)
- A developer guide says using whatsapp-web.js or Baileys against the consumer app violates the ToS and carries "real, non-deterministic ban risk". One account can run for months while another doing the same thing is banned within a week. — [checkleaked dev guide](https://whatsapp.checkleaked.cc/blog/avoid-whatsapp-ban)
- Opinion: risk depends more on how the number behaves than on which library is used. Browser-based clients (whatsapp-web.js) are claimed to be harder to detect than protocol-level ones (Baileys). This is not measured data. — [wasender.dev ban-risk guide](https://wasender.dev/guides/whatsapp-api-ban-risk); [adviseai.in](https://www.adviseai.in/blog/whatsapp-automation-ban-risk)
- **Weak statistics.** The widely repeated figure that "68% of businesses using unofficial tools reported at least one ban within 12 months" comes from a vendor analysis. There is no official public ban-rate statistic, and "2–8 week lifespan" claims appear mainly in blogs selling official-API services. — [adviseai.in](https://www.adviseai.in/blog/whatsapp-automation-ban-risk); [pipes.bot Baileys ban risk (2026)](https://www.pipes.bot/blog/baileys-vs-whatsapp-cloud-api-ban)
- Secondary reporting says a ban can be appealed once, after which it becomes permanent. This is unverified. — [kraya blog](https://kraya-blog-platform.vercel.app/whatsapp-automation-ban-risk)
- **Separate context.** In Aug 2026, TechRepublic reported users being wrongly suspended by automated moderation errors. This is not Baileys-specific, but it shows that the enforcement systems are aggressive and opaque. — [TechRepublic](https://www.techrepublic.com/article/news-whatsapp-account-wrongful-suspensions/)
- A secondhand mention says a further Baileys issue about bans after bulk sends was opened on 7 Oct 2026. It is unverified. — [adviseai.in](https://www.adviseai.in/blog/whatsapp-automation-ban-risk)

### Inferences
- For a car sales advisor whose personal or business number holds years of customer chats, a ban is the main risk. The cost is losing the number, the contact goodwill and the chat history, which outweighs the cost savings of a free library. A ban can be permanent after a single failed appeal.
- An inbound-only AI auto-reply (answering people who messaged first, at human-like speed, with no group or broadcast activity) avoids the most-cited triggers (cold messages to unsaved contacts, bulk sends, group bots). It still violates the ToS clauses on unofficial clients and automation, so the risk is lower but never zero.
- Wrapper choice (WAHA vs Evolution API vs raw Baileys) mainly changes developer convenience, not ban exposure.

### Gaps
- No Reddit threads were retrieved, so first-person Reddit experiences are missing.
- There is no quantitative ban rate for inbound-only reply bots specifically.
- No evidence was found of WhatsApp legal action against small businesses (as opposed to bulk-spam vendors) for using Baileys.

## 2. Meta's policy on general-purpose AI chatbots (effective 15 Jan 2026): what it means for a business using AI with its own customers

### Takeaway
Meta added an "AI Providers" section to the WhatsApp Business Solution Terms. It applied to new API users from 15 Oct 2025 and to all existing users from 15 Jan 2026. It bans providers whose primary offering via the API is a general-purpose AI model or assistant (ChatGPT, Perplexity, Copilot-style bots). AI that is "incidental or ancillary" to a business's own service, such as customer support, sales FAQs or booking a test drive, is still allowed. A car advisor's bot that answers questions about its own cars and services falls on the allowed side, provided it stays on-topic. Meta alone decides what counts as "primary".

### Cited Findings
- TechCrunch (18 Oct 2025): WhatsApp changed its Business API terms to bar general-purpose chatbots, effective 15 Jan 2026. The terms target AI model developers and assistant providers, not businesses that use AI to serve their customers. — [TechCrunch, 18 Oct 2025](https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform)
- The key clause, as quoted in secondary sources: providers of AI technologies (LLMs, generative AI platforms, general-purpose AI assistants) are prohibited from accessing or using the WhatsApp Business Solution "when such technologies are the primary (rather than incidental or ancillary) functionality being made available for use, as determined by Meta in its sole discretion". — [serviceform.com](https://www.serviceform.com/blog/whatsapp-ai-chatbots-in-2026/); [remio.ai](https://www.remio.ai/post/why-whatsapp-banned-ai-chatbots-meta-s-new-api-policy-explained); [Business Solution Terms](https://www.whatsapp.com/legal/business-solution-terms?lang=en). The full text was not read directly because the host was blocked.
- The terms do **not** mention customer service by name. A European Commission summary (as quoted) says businesses may still use AI tools for ancillary or support functions, such as automated customer support via WhatsApp. — [sumgenius.ai](https://sumgenius.ai/blog/whatsapp-business-ai-bot-rules-2026/); [serviceform.com](https://www.serviceform.com/blog/whatsapp-ai-chatbots-in-2026/)
- Rollout: new Business API users were bound from 15 Oct 2025, and the update applied to all existing users on 15 Jan 2026. Bots serving a specific business function (FAQs, orders) remain allowed. — [respond.io: general-purpose chatbots ban](https://respond.io/blog/whatsapp-general-purpose-chatbots-ban); [respond.io AI chatbot policy](https://respond.io/blog/whatsapp-ai-chatbot-policy)
- Exception reported: users with Italian and Brazilian numbers can still reach general-purpose AI assistants. This is linked to regulatory and antitrust action. — [search coverage incl. 9to5Mac / Gulf News](https://9to5mac.com/2025/10/20/whatsapp-bans-ai-chatbots-from-using-its-business-api/); [Gulf News](https://gulfnews.com/technology/no-more-chatgpt-and-perplexity-on-whatsapp-meta-bans-major-ai-chatbots-from-2026-1.500316016)
- Meta's stated reason: general-purpose chatbots placed a burden on its systems through message volume and needed a different kind of support. — [TechCrunch](https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform)
- Effect: ChatGPT, Copilot and others left WhatsApp, leaving Meta AI as the main general assistant. — [Business Standard](https://www.business-standard.com/technology/tech-news/meta-bans-ai-chatbots-from-whatsapp-business-api-chatgpt-to-shut-down-jan-2026-125102200335_1.html); [BGR](https://bgr.com/2003091/meta-bans-ai-chatbots-chatgpt-from-whatsapp)
- There are conflicting reports of the Business Solution Terms' "last modified" date: 6 Mar 2026 vs 23 Sep 2026. — [search summaries: windowsforum](https://windowsforum.com/news/whatsapp-business-api-bans-third-party-ai-providers-by-jan-15-2026.391662/); [upperfloor.ai](https://upperfloor.ai/en/blog/meta-policy-ai-agents)
- The WhatsApp Business Messaging Policy (reported as last updated 23 Sep 2026) permits automation inside the 24-hour window but requires "prompt, clear and direct escalation paths" to a human, via in-chat handoff, phone, email, web support or a form. — [upperfloor.ai](https://upperfloor.ai/en/blog/meta-policy-ai-agents); [whatsable.app window policy](https://whatsable.app/blog/whatsapp-message-window-policy-a-2026-compliance-guide)
- Practical guidance from BSPs: keep the AI agent scoped to business topics, and ask the provider if a use case looks borderline. — [sumgenius.ai](https://sumgenius.ai/blog/whatsapp-business-ai-bot-rules-2026/); [repzo.com](https://repzo.com/guides/ai-agents-for-customer-support)

### Inferences
- An LLM-powered bot that answers questions about a dealer's or advisor's cars, prices, loans and promos, and books test drives, counts as "ancillary" AI and is permitted on the official API. To stay clearly compliant, the system prompt should refuse off-topic general questions (homework, coding, general chat) and offer a "talk to a human" escalation, since the Business Messaging Policy requires one.
- This policy only governs the *Business Solution* (API). It does not make unofficial clients legitimate. Unofficial clients are already barred under the consumer ToS (Section 1).

### Gaps
- The verbatim current text and last-modified date of the Business Solution Terms could not be fetched.
- No reported enforcement cases (Jan–Nov 2026) against a *business customer-service* bot under the AI Providers clause were found.

## 3. Official API mechanics and cost: 24-hour window, templates, per-message pricing, Malaysia rates

### Takeaway
- **Pricing model.** Since 1 July 2025, Meta bills per delivered template message (marketing, utility, authentication) instead of per 24-hour conversation.
- **Inside the 24-hour window.** A customer's inbound message opens a 24-hour window for free-form replies.
- **Change on 1 Oct 2026.** Free-form "service" replies used to be free and unlimited (Nov 2024 – 30 Sep 2026). They are now free only for the first **1,000 per business phone number per month**, then charged at roughly the utility rate. Multiple third-party sources report this, but it has not been confirmed on Meta's page in this session.
- **Malaysia rates.** Marketing ≈ **USD 0.0860 (MYR 0.3467)**. Utility, authentication and chargeable service ≈ **USD 0.0140 (MYR 0.0564)**.
- **Small advisor.** A small advisor handling under 1,000 inbound-reply messages a month would pay Meta almost nothing for replies. Outbound promo templates are the main cost.

### Cited Findings
- **24-hour window.** A customer message opens a 24-hour customer service window for free-form replies, and each new inbound message resets it. Outside the window, only pre-approved templates (marketing, utility or authentication) can be sent. — [whatsable.app](https://whatsable.app/blog/whatsapp-message-window-policy-a-2026-compliance-guide); [ominiflow](https://ominiflow.com/blog/whatsapp-business-messaging-policy)
- Opt-in is required before business-initiated messages. Opening a service window does not replace opt-in. — [exaclose.com](https://exaclose.com/blog/whatsapp-business-messaging-rules/); [auditsocials.com](https://www.auditsocials.com/blog/whatsapp-business-api-click-to-whatsapp-ads-compliance-guide-2026)
- Since 9 Apr 2025, a template submitted as utility that Meta judges to be marketing is approved as marketing (and billed as marketing) rather than rejected. — [frai.es / search summary](https://frai.es/en/blog/what-is-a-whatsapp-chatbot)
- **Service messages became chargeable on 1 Oct 2026:**
  - Each business phone number gets 1,000 delivered service messages a month free, with charges from the 1,001st.
  - Unused messages do not roll over, and the count resets monthly.
  - There are no volume discounts on service messages.
  - Service messages were free from Nov 2024 to 30 Sep 2026.
  - Without a funded balance, delivery stops after the free tier.
  - Sources: [respond.io pricing change 2026](https://respond.io/blog/whatsapp-pricing-change-2026); [robylon.ai](https://www.robylon.ai/blog/whatsapp-service-message-pricing); [BroadNet](https://www.broadnet.me/blog/whatsapp-service-message-pricing-october-2026); [wamafy](https://wamafy.com/blog/whatsapp-service-message-pricing-2026); [growonbot](https://growonbot.com/blog/whatsapp-service-message-charges-october-2026/); [whatsable.app](https://whatsable.app/blog/meta-october-2026-whatsapp-service-message-pricing). **All of these are third-party.** One of them published a correction about the free tier, so the details are not uniformly reliable.
- Chargeable service messages are billed at the same rate as utility and authentication templates in that market. — [SleekFlow (snippet)](https://sleekflow.io/blog/whatsapp-business-price)
- Government bodies and eligible non-profits get free service messages beyond 1,000 from 1 Oct 2026 to 31 Dec 2027. This is a third-party claim. — [search summary of Oct 2026 coverage, e.g. wabpo](https://www.wabpo.com/en/news/whatsapp-pricing-changes-october-2026)
- Some sources also say utility templates sent *inside* an open window, which were free since July 2025, are now charged from Oct 2026. One source labels this "illustrative", so it is **unverified**. — [signalwire/upperfloor search summary](https://upperfloor.ai/en/blog/meta-policy-ai-agents); [growonbot](https://growonbot.com/blog/whatsapp-service-message-charges-october-2026/)
- **Malaysia rates:**
  - Marketing: USD 0.0860 / MYR 0.3467 per delivered message.
  - Utility, authentication and chargeable service: USD 0.0140 / MYR 0.0564.
  - Sources: [ChatMaxima Malaysia](https://chatmaxima.com/whatsapp-api-pricing/malaysia/); [respond.io Malaysia](https://respond.io/blog/whatsapp-api-pricing-malaysia); [Flowcall (Nov 2026)](https://www.flowcall.co/blog/whatsapp-business-api-pricing); [bixtech.co](https://bixtech.co/blog/whatsapp-business-api-pricing-malaysia); [forwardchat.my](https://forwardchat.my/blog/whatsapp-api-cost-malaysia)
  - **Conflict:** Gallabox's rate card lists Malaysia at USD 0.0989 marketing and 0.0161 utility, probably a different or older card version. — [Gallabox rate card](https://docs.gallabox.com/pricing-and-billing/whatsapp-pricing/rate-card)
  - One Malaysia source says Meta had not yet published the final October 2026 rate card, so the effective date of the MYR figures is not fully settled. — [mrvsmedia.com](https://www.mrvsmedia.com/resources/whatsapp-business-pricing-change-october-2026-malaysia/)
- Meta lowered authentication rates for Malaysia (among other markets) effective 1 Feb 2025. Malaysia is eligible for the special "international authentication" rate. — [Meta pricing page (snippet)](https://developers.facebook.com/docs/whatsapp/pricing); [SleekFlow (snippet)](https://sleekflow.io/blog/whatsapp-business-price)
- Utility and authentication messages get tiered volume discounts. Marketing does not. — [SleekFlow (snippet)](https://sleekflow.io/blog/whatsapp-business-price)
- **BSP and platform fees, on top of Meta's per-message fees:**
  - **Twilio:** no monthly fee, plus about USD 0.005 per message markup. — [mark360.ai](https://mark360.ai/blog/whatsapp-api-pricing-comparison-providers-2026); [ezcontact.ai](https://ezcontact.ai/en/blog/whatsapp-api-pricing-comparison-meta-twilio-360dialog-ezcontact/); [Zernio vs Twilio](https://zernio.com/alternatives/twilio)
  - **360dialog:** about €49 per number per month (Regular), €99 (Premium), €500 (Scale), with zero per-message markup. The break-even against Twilio is about 10,600 messages a month. — [ezcontact.ai](https://ezcontact.ai/en/blog/whatsapp-api-pricing-comparison-meta-twilio-360dialog-ezcontact/); [socialvik](https://www.socialvik.com/blog/whatsapp-business-api-providers-compared-2026)
  - **Wati:** a SaaS inbox. Growth plan is about USD 59/month (yearly) or 69/month (monthly), with its own rate card and an estimated ~20% markup. Sources conflict. — [eesel.ai](https://www.eesel.ai/blog/whatsapp-business-api-providers); [d-dat](https://d-dat.com/en/comparisons/best-whatsapp-business-api-providers-2026)
- **Zernio (unified API).** It wraps Meta's Cloud API across WhatsApp and about 11–15 social platforms. It is pay-per-use, with a free tier of 2 accounts. Its own pages and comparisons give these figures:
  - Meta fees are passed through at cost, with no markup, and Meta bills the WABA directly.
  - Numbers cost about USD 3/month (or USD 2–25/month by country), and paid plans start around USD 6 per account per month.
  - WhatsApp inbox features need an "Inbox" add-on with a 7-day trial.
  - **Conflict:** one source says "unlimited messages"; Wati's comparison says 10,000 free sent messages a month as of Nov 2026.
  - Sources: [Zernio pricing](https://zernio.com/pricing); [Zernio WhatsApp pricing docs](https://docs.zernio.com/platforms/whatsapp/pricing); [Zernio vs Kapso](https://zernio.com/alternatives/kapso); [Zernio best providers](https://zernio.com/blog/whatsapp-business-api-providers); [dev.to Zernio tutorial](https://dev.to/mikipalet/how-to-send-whatsapp-messages-with-one-api-call-no-meta-developer-app-needed-39oh); [Wati vs Zernio](https://www.wati.io/geo/comparing-whatsapp-and-instagram-api-providers-for-growing-teams)

### Inferences
- **Illustrative monthly Meta cost** for a solo advisor, using USD 0.086 marketing and USD 0.014 utility/service:
  - 600 AI replies to inbound leads (inside the window, under 1,000 free): **USD 0**.
  - 300 utility follow-ups (e.g. "your test drive is confirmed"): about **USD 4.20** (≈ MYR 17).
  - 200 marketing templates (promo blast to opted-in leads): about **USD 17.20** (≈ MYR 69).
  - Total is about USD 21/month in Meta fees, plus the BSP or Zernio fee and LLM API costs.
  - Above 1,000 service replies, each extra reply costs about USD 0.014 (≈ 5.6 sen).
- Marketing templates cost about 6x as much as utility. Meta reclassifies "utility" templates that read as promotional, so promo follow-ups should be budgeted as marketing.

### Gaps
- Meta's own Malaysia rate card for Q4 2026 was not read directly (host blocked). Exact current USD and MYR values and their effective date need checking.
- The Click-to-WhatsApp ads "free entry point" (72-hour free window) was not verified for its status after Oct 2026. This matters if the advisor runs Facebook or Instagram ads into WhatsApp.
- It is unconfirmed whether utility templates inside an open window are still free after 1 Oct 2026.

## 4. Requirements: Business Portfolio, verification, number rules, Coexistence in Malaysia, display name, messaging limits

### Takeaway
- **Setup.** The official route needs a Meta Business Portfolio (formerly Business Manager), a WhatsApp Business Account, and a phone number with an approved display name. Business verification is optional to start but unlocks higher limits.
- **Coexistence.** Historically a number on the Cloud API could not stay on the WhatsApp app. "Coexistence" (since ~May 2025) now lets an existing **WhatsApp Business app** number (not personal WhatsApp) be onboarded to the Cloud API while the app keeps working, with messages mirrored. Malaysia is reported as supported.
- **Messaging limits.** Limits now apply per business portfolio: 250 → 2K → 10K → 100K → unlimited unique business-initiated recipients per rolling 24 hours. Replies inside the service window do not count.

### Cited Findings
- **Coexistence availability:**
  - Malaysia is listed among supported APAC countries (India, Indonesia, Singapore, Malaysia, Philippines, Hong Kong). — [eazybe](https://eazybe.com/blog/whatsapp-coexistence); [whautomate](https://whautomate.com/whatsapp-coexistence)
  - A Malaysia-focused vendor says Coexistence has been officially supported in Malaysia since May 2025. — [forwardchat.my](https://forwardchat.my/blog/whatsapp-business-coexistence-malaysia)
  - One vendor claims "all countries are now supported" as of May 2026. — [search summary; cosend.app](https://cosend.app/guides/whatsapp-coexistence-guide)
- **Coexistence requirements and limits:**
  - The number must already be active on the **WhatsApp Business app** (not personal WhatsApp), on version 2.24.17 or later.
  - It must not already be registered on the Cloud API with another provider.
  - It works one way (app → API onboarding), and messages are mirrored between app and API.
  - Some Business app features stop working after onboarding.
  - Sources: [HighLevel help](https://help.gohighlevel.com/support/solutions/articles/155000003417-whatsapp-coexistence-feature); [chakrahq FAQ](https://chakrahq.com/article/whatsapp-coexistence-faq-answers-details); [pickyassist](https://pickyassist.com/blog/meta-whatsapp-coexistence-business-walkthrough/)
- Under Coexistence, messages sent from the Business app stay free. Messages sent via the Cloud API are billed at Meta's API rates. — [eazybe](https://eazybe.com/blog/whatsapp-coexistence); [samcomtechnologies](https://www.samcomtechnologies.com/blog/whatsapp-coexistence-use-the-business-app-and-the-cloud-api-on-the-same-number)
- **Messaging limits:**
  - Since 7 Oct 2025, limits are set per **business portfolio** and shared across all its numbers. Adding numbers does not add capacity. — [chatarmin](https://chatarmin.com/en/blog/whats-app-messaging-limits); [getmanifest 2026 changelog](https://blog.getmanifest.ai/whatsapp-business-api-updates-2026/); [vantegrate](https://www.vantegrate.com/en/pulse/whatsapp-doesnt-limit-your-messages-it-limits-how-many-people-you-can-message)
  - An unverified portfolio with an approved display name starts at **250 unique recipients per rolling 24 hours**. Business verification, or about 2,000 high-quality delivered templates in 30 days, lifts it to 2,000. Higher tiers are 10K, 100K and unlimited, each needing sustained use at about half the current limit. — [nonito.io](https://www.nonito.io/guides/whatsapp-messaging-limits); [ActiveCampaign help](https://help.activecampaign.com/hc/en-us/articles/21826249568540-WhatsApp-Messaging-Limits-What-You-Need-to-Know)
  - **Conflict:** ActiveCampaign lists the first verified tier as 1,000, which is probably outdated.
  - A portfolio reportedly no longer drops a tier when quality falls. Instead, upgrades stall or templates are paused, and poor quality can keep a portfolio at 250 even after verification. — [chatarmin](https://chatarmin.com/en/blog/whats-app-messaging-limits); [adwixconnect](https://adwixconnect.com/learn/whatsapp-messaging-limits/)
- Unified APIs such as Zernio market onboarding "without a Meta developer app", meaning embedded signup handled by the provider. Meta Business Portfolio ownership still applies. — [dev.to Zernio tutorial](https://dev.to/mikipalet/how-to-send-whatsapp-messages-with-one-api-call-no-meta-developer-app-needed-39oh)

### Inferences
- For an advisor already using the WhatsApp Business app, Coexistence via a BSP or unified API (e.g. Zernio, if it supports Coexistence onboarding — not verified) is the low-friction official path. It keeps the existing number, the chat history on the phone and manual replying, while the AI answers through the API.
- If the advisor uses **personal WhatsApp**, they must first migrate the number to the WhatsApp Business app before Coexistence is possible.
- The 250/day limit only restricts *business-initiated* template sends to unique users. An inbound AI reply bot is unaffected by it, so verification is not urgent unless the advisor plans broadcasts.

### Gaps
- Meta's official Coexistence country list and the current minimum app version could not be fetched.
- Whether Zernio specifically supports Coexistence onboarding was not confirmed.
- Display-name approval rules (e.g. whether a personal name like "Ali – Perodua Sales Advisor" is acceptable without dealer authorization) were not researched. A trademark or brand-name issue is likely if the advisor uses a manufacturer brand in the display name without authorization. This is unverified.

## 5. Malaysia-specific: PDPA 2010 and the 2024 amendments, and automotive considerations

### Takeaway
The Personal Data Protection (Amendment) Act 2024 came into force in phases in 2025. Cross-border transfer rules were liberalized on 1 Apr 2025, replacing the whitelist with a risk-based test. Mandatory **DPO appointment**, **data breach notification** and a new **data portability** right started on 1 Jun 2025. An advisor storing customer chats (names, IC numbers, salary or loan details, phone numbers) and sending them to an overseas LLM or BSP is a data user. They need consent and notice, security, retention limits, and a compliant cross-border transfer basis, and may have DPO and breach-notification duties. No chatbot-specific guidance from the PDP Commissioner was found.

### Cited Findings
- The amendment was gazetted in Dec 2024 and took effect in 3 phases. Cross-border changes took effect on **1 Apr 2025** (whitelist removed). DPO appointment, breach notification and data portability (s.43A) took effect on **1 Jun 2025**. — [Lexology](https://www.lexology.com/library/detail.aspx?g=8cec8a2a-8733-42ae-83f9-d322ba96cbea); [Baker McKenzie alert](https://www.bakermckenzie.com/-/media/files/insight/publications/alerts/08/malaysia-public-consultation-on-the-personal-data-protection-regulations/malaysia-personal-data-protection-amendment-act-2024-to-come-into-force--ba.pdf?sc_lang=en&rev=8447c31f6f2c4689a91136a64e860979&hash=8F2471D0FD4605717B390D3A750F630B)
- Under the Commissioner's guidelines, data controllers and processors had to appoint a DPO by 1 Jun 2025. Guidelines on DPO, breach notification and cross-border transfer were issued in 2025, and the Cross-Border Transfer Guideline is dated 29 Apr 2025. — [Shook Lin & Bok](https://shooklin.com.my/legal-update/action-required-new-guidelines-on-data-protection-officer-appointment-data-breach-notification-and-cross-border-personal-data-transfers/)
- **Breach-notification deadline conflict:** secondary sources say 72 hours. A law-firm source says the statute requires notice "as soon as reasonably possible" in the Commissioner's prescribed form, with the guideline setting the timeline. — [contingent.com.my](https://www.contingent.com.my/blog/pdpa-malaysia-amendments-guide); [shakalakaa.my](https://shakalakaa.my/resources/pdpa-malaysia); [Shook Lin & Bok](https://shooklin.com.my/legal-update/action-required-new-guidelines-on-data-protection-officer-appointment-data-breach-notification-and-cross-border-personal-data-transfers/)
- The 2024 amendment also makes data processors directly liable under the security principle and raises maximum penalties. This is general compliance coverage. — [onekeybiz](https://onekeybiz.com/insights/malaysia-pdpa-amendment-2024-data-protection-compliance-foreign-companies.html); [sibermate PDPA guide](https://sibermate.com/en/hrmi/pdpa-malaysia-complete-guide)

### Inferences
- Practical PDPA steps for an AI WhatsApp bot:
  - Send a short bilingual (BM/EN) privacy notice in the first reply, saying the chat may be handled by AI and stored, and why.
  - Avoid asking for IC or payslips over the bot, or redact them.
  - Choose an LLM and BSP with documented security, and treat overseas processing as a cross-border transfer needing a lawful basis (e.g. consent or contract necessity under the risk-based framework).
  - Set retention limits.
  - Offer human escalation, which the WhatsApp policy also requires.
- Unofficial libraries store session keys and chat data on the advisor's own server, so the advisor bears the full security burden. A data leak there triggers breach-notification duties.
- **Automotive:** an advisor working under a dealer or brand should check the dealer's or principal's rules on unofficial pricing quotes and on brand use in WhatsApp display names. AI-generated price, loan or promo statements could create misrepresentation issues, so the bot should quote only approved prices and add a disclaimer.

### Gaps
- No PDP Commissioner guidance specific to chatbots, AI or LLMs was found. pdp.gov.my was not fetched.
- No Malaysia automotive-specific regulation was found on AI chat in car sales: MITI/APAD rules, Consumer Protection Act clauses on misleading price statements by AI, or hire-purchase advice rules under the Hire-Purchase Act or Consumer Credit Act 2025 (if in force). This was not researched due to the tool budget.
- It is unconfirmed whether a sole-proprietor advisor meets the threshold for mandatory DPO appointment. The guideline sets thresholds, such as processing data of more than 20,000 subjects or sensitive data of more than 10,000; these figures come from recollection, not a source fetched here, so verify them.
