# ROADMAP

Rule: finish milestones in order. Tick items as they are done.
A milestone is done only when the owner has clicked through it.
Order confirmed 2026-11-10 (D29): finish M0, then M1 onward, showing the owner
after each step. Items marked "(suggested)" were proposed by Claude on
2026-11-10; the owner can drop any of them.

## M0 Foundation
- [x] Next.js + TypeScript + Tailwind project, lint, format, .env.local, .gitignore
- [x] Supabase project (free tier), migrations folder in the repo
- [x] Tables: tenants, plans, subscriptions, memberships
- [x] Row-level security on every table, with a test proving tenant A cannot
      read tenant B (`npm test`, tests/rls/tenant-isolation.test.ts)
- [ ] Login and role check (super_admin, merchant_admin, merchant_staff,
      delivery, customer)
- [ ] Super admin: list tenants, create tenant, assign plan, start 15-day trial
- [x] Subdomain routing to the right tenant: main domain = our website,
      app.<domain> = the app, <shop>.<domain> = the shop's storefront (D28)
- [ ] Deploy to Cloudflare

## M1 Core ordering loop
- [ ] Shop-owner app at app.<domain> for owners, staff and delivery boys:
      phone-first layout, bottom navigation, icons, loading and empty states
      (UI/UX pass; D28)
- [ ] Installable app (PWA): app icon, add to home screen, quick on slow data (D8)
- [ ] First-run checklist for a new shop: add products, customers and prices,
      then share the store link (suggested)
- [ ] Products: name (Hindi + English), unit, photo, active flag
- [ ] Customers: name, phone, address, type (retailer / household), price list
- [ ] Price lists: wholesale and retail prices per product
- [ ] Customer storefront: browse, add to order, place order
- [ ] Customer login by WhatsApp link, no OTP: the shop's link or a personal link;
      the phone stays logged in (D27)
- [ ] Standing orders: per customer, per product, per weekday quantities
- [ ] Holiday pause: a customer or the shop skips standing-order days (suggested)
- [ ] Evening cut-off time per tenant; customers can edit tomorrow's order until then
- [ ] Nightly job turns standing orders into tomorrow's orders
- [ ] Merchant morning screen: packing list totals by product, then by customer
- [ ] One-time orders for any future date; same-day orders until the tenant's
      same-day cut-off
- [ ] Order source field: standing, storefront, public_link, merchant_entered
- [ ] Merchant can enter an order on behalf of a customer (phone orders)
- [ ] Same-day order alert on the merchant screen
- [ ] Public store link + printable QR poster per tenant
- [ ] Self-registration by phone; status pending until merchant approves
      wholesale prices or credit

## M2 Delivery and money
- [ ] Delivery login and today's stop list in route order
- [ ] Mark delivered, short-delivered, or not delivered with a reason
- [ ] Record cash or UPI collected at each stop
- [ ] Delivery screen keeps working without signal and syncs later (suggested)
- [ ] Returnable crates, trays and cans: given and returned per customer (suggested)
- [ ] Returns and wastage (for example unsold bread) recorded at delivery (suggested)
- [ ] Ledger: append-only entries, running balance per customer
- [ ] Merchant UPI QR on the customer's statement page
- [ ] Shareable statement link for WhatsApp
- [ ] Change history for orders and prices: who changed what, and when (suggested)

## M3 Live pilot (2 weeks with the bakery)
- [ ] Load his real catalogue and customer list
- [ ] Run alongside his register for week 1, replace it in week 2
- [ ] Daily list of what broke or confused; fix before moving on
- [ ] Write the case study: time saved, missed orders, credit recovered

## M4 Plans, theming and website add-on
- [ ] Plan limits enforced from the plans table (customers, delivery logins, messages)
- [ ] Trial expiry, grace period, read-only mode when unpaid
- [ ] Coupons and sales in super admin
- [ ] Tenant theme editor: colours, logo, font pair, layout preset
- [ ] Marketing site with pricing and "Powered by" footer on every storefront
- [ ] Play Store app (wrapper around the web app) for merchants and delivery staff
- [ ] Check current Play Console rules for new developer accounts before planning
      the launch date
- [ ] Website add-on, one-time fee, three tiers (D30):
  - [ ] Mini: one page on the shop's address: about, timings, map, rate list,
        photos, WhatsApp and call buttons. Any plan.
  - [ ] Pro website: Mini + custom domain + enquiry form. Any plan.
  - [ ] Ultra: website joined to the platform (live rate list, ordering,
        customer login). Needs the Pro plan or higher.
  - [ ] Website sales in super admin: tier, one-time fee, offers and coupons

## M5 Business tools
- [ ] Inventory: stock in, stock out, low-stock warning
- [ ] GST invoice (PDF) and daily sales summary
- [ ] Reports: sales by product, by customer, outstanding credit
- [ ] Daily database backup and one-tap export (move to Supabase Pro here at latest)
- [ ] Bluetooth thermal printer (58 mm) for packing slips and bills (suggested)

## M6 Growth
- [ ] WhatsApp Cloud API with per-plan quota and top-ups
- [ ] Razorpay Subscriptions for SaaS billing
- [ ] Merchant connects own Razorpay for online customer payments
- [ ] Automation add-ons run on self-hosted n8n (after licence confirmation)
- [ ] Custom domain for Pro tenants
- [ ] Daily summary to the owner on WhatsApp (suggested; see GTM.md)
