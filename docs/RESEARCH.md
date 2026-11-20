# RESEARCH

Checked: 2026-11-10. Prices change often. Re-check the vendor's own page
before quoting any number to a customer.

## 1. Competitor map

### Online store builders
- Dukaan: free tier; paid plans appear to be sales-led. A competitor's comparison
  (Shoopy, Apr 2026) says Dukaan takes 0.99% to 4.99% per order.
- Shoopy: Free, Basic ₹2,799/yr, Professional ₹5,999/yr, Business ₹13,999/yr
  (excl. GST). From 1 June 2026 it charges a percentage per order after a free
  quota (Free 2%, Basic 1%, Professional 0.8%, Business 0.6%); before that it
  was a flat ₹2 to ₹3 per order.
- Shopify India: Basic ₹1,499/month on annual billing. One guide estimates about
  ₹6,400/month once GST, three paid apps and a domain are added.
- Gap: built for one-time retail carts. No daily repeat orders, no credit
  ledger, no delivery route.

### Billing and ledger apps
- myBillBook: from ₹199/month. Vyapar: desktop plan ₹3,399/year. Khatabook: ledger.
- Gap: the owner types everything. Customers cannot place orders themselves.

### Subscription delivery software
- LactoSync: first 50 customers free, then ₹1 per customer per day
  (100 customers = ₹1,500/month).
- Rekart: milk, tiffin, water subscriptions; pricing not public.
- MilkMaster: milk delivery platform with zones and routes; pricing not public.
- Milk Delivery Solutions: listed from $100/month.
- Gap: home delivery only. No wholesale price lists, no shop counter.

### B2B ordering apps
- BeatRoute, StoreHippo and similar: enterprise, sales-led, built for brands
  and large distributors, not a small wholesaler.

### The opening
Nobody at ₹500 to ₹2,000/month combines: wholesale ordering + retail ordering +
daily standing orders + delivery boy view + credit ledger.

## 2. Complaints to design against
- Support: Dukaan Play Store reviews centre on poor support, slowness, glitches,
  Razorpay integration trouble and hidden charges. In 2023 its founder publicly
  replaced 90% of support staff with an AI bot.
- Changing per-order fees: Shoopy's June 2026 switch from flat to percentage fees.
- Data loss: long-term Vyapar users report vanished data, mismatched entries and
  unresolved support tickets.

Our answers:
1. Flat subscription, no commission on orders.
2. A human on WhatsApp, in Hindi.
3. Daily backups and one-tap export of all data.

## 3. Platform and vendor facts

### Hosting
- Vercel free (Hobby) plan: non-commercial use only; taking payments counts as
  commercial. Paid plan is $20 per seat per month.
- Cloudflare free tier: commercial use allowed, 100,000 function requests/day,
  500 builds/month. Paid Workers plan is $5/month.

### Database (Supabase)
- Free: 500 MB database, 1 GB file storage, 5 GB egress, 50,000 monthly users,
  2 projects. Pauses after 7 idle days. No backups.
- Pro: $25/month base, 8 GB database, 100,000 monthly users, daily backups
  (7-day retention).

### Payments (Razorpay)
- 2% platform fee + 18% GST on the fee. Subscriptions add about 0.9% to 0.99%.
- New merchants activated on or after 1 July 2026: 0% platform fee for 90 days
  or ₹5 lakh, whichever comes first.
- From 15 Oct 2026 (per Razorpay's blog): merchant UPI payments above ₹2,000
  carry 0.4% MDR, capped at ₹300. Wholesale orders often cross ₹2,000.
- Only RBI-authorised payment aggregators may handle merchant funds.
  We must not pool merchants' money in our account.

### WhatsApp Business API (India, excl. GST)
- Marketing about ₹0.86 per message; utility and authentication about ₹0.115.
- One source says Meta began charging for service messages and in-window
  utility templates from 1 Oct 2026. Verify on Meta's rate card before building.

### n8n licence (Sustainable Use License)
- Allowed: building and running workflows for clients when clients never
  access our n8n; using n8n behind the scenes where users only trigger
  automations we built.
- Not allowed without a paid Embed/Enterprise licence: white-labelling n8n,
  giving clients access to the editor, charging for access to n8n.
- Disputed: storing client credentials on our instance. n8n's own FAQ example
  permits it when clients cannot build or modify workflows; some third-party
  guides say it needs a paid licence. Ask license@n8n.io before selling.

### AI coding tools
- Antigravity reads AGENTS.md from the project root (since v1.20.3, March 2026).
  Limit: 12,000 characters per rules file.
- Claude Code: CLAUDE.md containing "@AGENTS.md" imports the same rules.

## 4. Sources to re-check
shoopy.in (pricing, fair use policy) | mydukaan.io/in/pricing |
supabase.com/pricing | razorpay.com/blog (pricing, UPI MDR) |
developers.facebook.com WhatsApp pricing | docs.n8n.io licence FAQ |
antigravity.google/docs/rules | Cloudflare Workers and Pages limits