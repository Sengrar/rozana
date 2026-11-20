# PRICING AND COSTS

Status: PROPOSED. Test with the first five merchants before publishing.
All prices exclude 18% GST.

## Plans

### Starter: ₹499/month or ₹4,999/year
- Storefront on our subdomain, catalogue, orders
- Credit ledger, merchant's own UPI QR, cash on delivery
- Up to 100 customers, 1 staff login, 1 delivery login
- WhatsApp click-to-chat links

### Growth: ₹999/month or ₹9,999/year
- Everything in Starter
- Standing (daily repeat) orders
- Separate wholesale and retail price lists
- Inventory, delivery routes, GST invoices
- Up to 500 customers, 3 delivery logins
- Theme customisation
- 1,000 automated WhatsApp messages per month

### Pro: ₹1,999/month or ₹19,999/year
- Everything in Growth
- Unlimited customers, multiple branches
- Custom domain, reports
- 5,000 automated WhatsApp messages per month
- Priority support, one automation workflow included

## Add-ons
- Setup and onboarding (we load catalogue and customers): ₹1,999 to ₹4,999 one-time
- Automation workflow: setup fee ₹2,000 to ₹10,000, then ₹500 to ₹1,500/month each
- WhatsApp message top-ups: cost plus margin

## Website add-on (one-time fee, D30)
Prices: to be set by the owner. Offers and coupons can apply.
- Mini website: ₹____ one-time. One page on the shop's address (<shop>.<domain>):
  about, timings, map, rate list, photos, WhatsApp and call buttons. Any plan.
- Pro website: ₹____ one-time. Mini + custom domain + enquiry form. Any plan.
- Ultra website: ₹____ one-time. Joined to the platform (live rate list, ordering,
  customer login). Needs the Pro plan or higher.
- To decide: who pays the custom domain's yearly renewal (about ₹800 to
  ₹1,000/year, estimate); what happens to the website if the subscription lapses,
  or if an Ultra shop drops below the Pro plan.

## Offers (super admin only)
- 15-day free trial; clock starts at the first real order
- Coupon codes: percent off, fixed amount off, or extra trial days; with expiry
  and usage limit
- Sales: time-boxed discount on annual plans
- Referral: one free month for each merchant referred who pays
- Rule: never offer the coupon first. Use it only when a lead hesitates.

## Price anchors (see docs/RESEARCH.md)
- Shoopy ₹2,799 to ₹13,999/year plus a percentage per order
- Shopify ₹1,499/month before apps
- LactoSync ₹1,500/month for 100 customers
- myBillBook from ₹199/month; Vyapar ₹3,399/year (billing only, no ordering)

## Running costs (the monthly totals are estimates)

### Stage 0: build and pilot, 1 to 3 merchants
- Domain: about ₹800 to ₹1,000/year (estimate)
- Cloudflare free, Supabase free, WhatsApp links free
- Total: about ₹100/month

### Stage 1: first paying merchant to about 30
- Supabase Pro: $25/month
- Cloudflare Workers Paid: $5/month
- Small server for n8n: about ₹500 to ₹900/month (estimate)
- Total: about ₹3,500 to ₹4,500/month (check the exchange rate)

### Costs that grow with usage
- WhatsApp: 60 customers x 1 message/day x 30 days x ₹0.115 = about ₹207/month
  per merchant, before GST. This is why messages are metered per plan.
- Razorpay on our own subscription income: about 3% plus GST once we use
  Razorpay Subscriptions. Zero while we collect by UPI manually.

### Free-tier capacity (estimate)
- 500 MB database: roughly 5 to 10 pilot merchants and a few thousand of their
  customers for several months, if product photos go to file storage and are
  compressed.
- The real limits are no backups and the 7-day pause, not size.
  Move to Pro before the first paying merchant.

## Break-even (estimate)
- Stage 1 cost about ₹4,000/month
- 8 merchants on Starter, or 4 on Growth, or a mix of 5 to 8
- Target for month 6: 30 merchants at an average ₹800 = ₹24,000/month income

## Other things to budget for
- GST registration and a CA once turnover approaches the threshold (ask a CA)
- Privacy policy and terms of service
- Play Store developer account only if a native app is ever needed