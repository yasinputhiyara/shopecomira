PRODUCT REQUIREMENTS DOCUMENT

Trending Products E-commerce Platform

A client-ready definition of the storefront, commerce operations and customer communications

Document detail

Value

Status

Draft for client review

Version

1.0

Prepared

13 October 2026

Business context

Client currently operates a Shopify store; Razorpay account is already available

Purpose

Agree the v1 scope, rules and acceptance criteria before design and implementation

Decision needed before build: confirm whether the new solution replaces Shopify or extends the current Shopify store. This affects architecture, data migration, URLs, operational continuity and delivery estimate.

This document describes the intended product. Items marked as assumptions or open questions require client confirmation. It is not tax or legal advice; the client’s accountant should validate GST treatment and invoice samples.


Trending Products E-commerce Platform  |  Client review draft

1. Executive summary

The client needs a mobile-first online store for fast-moving and trending products across multiple categories. Shoppers must be able to discover products, review complete details, see applicable discounts, and place orders using online payment through the client’s existing Razorpay account or Cash on Delivery (COD).

Store staff need an admin experience for products, categories, variants, inventory, GST details, offers and orders. The store should encourage prepaid purchases with a clearly explained discount, reward multi-product baskets, provide a WhatsApp enquiry path, and send order-status notifications through WhatsApp and/or email.

The current Shopify store is the starting point. The client has reported that it does not provide the customization they need. The project must first establish whether to build a replacement storefront and commerce backend or add custom features around Shopify.

2. Product vision and goals

Make it quick for the team to publish trending products and easy for customers to understand the product, price, tax, delivery and offer before buying.

Let authorized staff create and update products with category, variant, stock, price and GST information.

Enable customers to browse, search, compare offers and complete checkout on mobile.

Support prepaid orders through Razorpay and COD where delivery rules allow it.

Increase prepaid share and average basket value using transparent, configurable discounts.

Keep customers informed about order progress by the communication channels the client selects.

Give the business an operational view of stock, orders, discounts and sales.

Success measures

Measure

Proposed target

How to measure

Product publishing time

Under 5 minutes for a standard product

Timed admin usability session

Prepaid order share

At least 60% within 3 months

Orders grouped by payment method

Average order value

15% above single-item baseline

Order reporting

Checkout conversion

At least 2.5% of sessions

Store analytics funnel

Mobile product-page performance

LCP under 2.5 seconds on 4G

Field monitoring and performance audit

COD return-to-origin rate

Below 20%

Shipment outcomes

Targets are proposed from the supplied project brief and should be confirmed against the client’s current Shopify baseline and analytics.

3. Users and roles

User

Primary needs

Shopper

Fast mobile browsing, trustworthy details, visible offers, WhatsApp enquiry, prepaid or COD checkout, order updates and tracking.

Owner / administrator

Control over catalogue, prices, offers, orders, staff, store settings and reports.

Catalogue manager

Quick product entry, category assignment, bulk import and stock updates.

Order / support staff

Find orders, update permitted statuses, respond to customers and resend notifications.

Admin roles must be enforced on the server. For example, catalogue staff should not be able to issue refunds or see restricted revenue reports unless permission is granted.

4. Scope

In scope for v1

Responsive storefront with home, category, product, cart, checkout, account/order lookup and content pages.

Admin dashboard for products, categories, inventory, offers, orders, customers, content and basic reports.

GST-ready product and order records, tax calculation inputs and downloadable tax invoices.

Razorpay online payment integration and COD checkout with configurable eligibility.

Prepaid, multi-item, cart-value and coupon offers with visible price breakdown.

WhatsApp contact/enquiry entry point and transactional order-status notifications by WhatsApp and/or email.

Shipping charge configuration and a shipping/tracking integration, subject to provider/account confirmation.

Migration or synchronization planning for the current Shopify catalogue and related data, scope to be confirmed.

Out of scope unless separately agreed

Multi-vendor marketplace, native mobile apps, international sales, multiple currencies or languages.

Loyalty program, subscriptions, AI features, advanced personalization or custom mobile app.

GST return filing, e-invoicing IRN or e-way bill integrations until the client confirms they are needed.

Replacing or migrating all historical Shopify data unless explicitly included in the approved migration plan.

5. Shopper experience requirements

ID

Feature

Requirement

Priority

ST-01

Home page

Show promotional banners, trending products, best sellers, new arrivals, category navigation and active offers. Admin can control ordering and visibility.

Must

ST-02

Category pages

Support multiple categories and optional nested categories. Show image, name, price, discount and stock state; provide sorting and filters relevant to the catalogue.

Must

ST-03

Search

Search by product name, brand or SKU, with suggestions. Typo tolerance is desired; final search technology is an implementation decision.

Must

ST-04

Product details

Show image gallery, title, brand/category, selling price, MRP, discount, tax-inclusive price note, stock, description, specifications, highlights, variants, delivery estimate/pincode check, return policy and applicable offers.

Must

ST-05

WhatsApp enquiry

Provide a visible WhatsApp contact action on the store and/or product pages. The client must confirm business number, prefilled message, operating hours and whether product context is included.

Must

ST-06

Cart

Allow quantity changes and item removal. Recalculate subtotal, item offers, multi-item savings, coupon, prepaid savings, shipping, tax and COD fee as applicable.

Must

ST-07

Checkout

Support guest checkout and/or account sign-in as confirmed. Collect mobile number, address, pincode, shipping choice, payment choice and final order review.

Must

ST-08

Order lookup

Provide confirmation and a way to view order status, such as account history or secure order link. Account/login method needs client confirmation.

Must

ST-09

Content and trust

Provide editable About, Contact, FAQ, shipping, returns, privacy and terms pages, plus secure payment and COD availability cues.

Must

ST-10

SEO and sharing

Use clean URLs, page metadata, canonical URLs, product structured data, sitemap and social sharing previews.

Must

6. Admin and catalogue requirements

ID

Area

Requirement

Priority

AD-01

Product create/edit

Create a product from one form with name, slug, brand, one or more categories, tags, descriptions, specifications, highlights, images and active/draft status.

Must

AD-02

Product flags

Set Trending, Best Seller, New Arrival and Featured flags and sort order.

Must

AD-03

Variants and SKU

Manage options such as size or colour, with a unique SKU, price, stock and optional barcode/image per variant.

Must

AD-04

Pricing

Store MRP, selling price and optional internal cost. Calculate displayed discount percentage. Restrict cost visibility by role.

Must

AD-05

GST attributes

Capture HSN, GST rate, whether listed price includes GST, exemption status and applicable cess. Require tax classification before publishing, subject to client/accountant confirmation.

Must

AD-06

Inventory

Track on-hand and reserved stock, low-stock threshold, backorder policy and stock movements with reason and reference.

Must

AD-07

Shipping and returns

Capture package weight/dimensions, COD eligibility, returnability and return window where applicable.

Must

AD-08

Bulk catalogue tools

Import/export catalogue via agreed spreadsheet template with row-level validation errors; allow bulk price, stock and status updates.

Must

AD-09

Audit history

Record user, action, entity, timestamp and before/after values for important catalogue, offer, order and stock changes.

Must

AD-10

Access control

Support roles and permissions for catalogue, orders, refunds, reports, settings and staff management.

Must

Category management should support the client’s actual category structure and category-specific attributes. The initial category tree and launch catalogue will be supplied or approved by the client.

7. Offers and pricing rules

Offer type

Example

Configurable controls

Prepaid discount

Extra 5% off when paying online

Percent or flat amount, cap, minimum cart, eligible products/categories, activation dates.

Multi-item discount

Buy 2 save 10%; buy 3 save 15%

Quantity tiers; same product, selected products, category or storewide; eligibility and stacking.

Cart-value discount

Rs 150 off above Rs 1,500

Threshold tiers, fixed or percentage saving, cap.

Coupon

WELCOME10

Code, dates, usage limit, per-customer limit, first-order rule, eligible items.

Product sale

Limited-time sale price

Sale price, start/end time and visible validity.

Discount rules must be deterministic and visible before payment. The system should show savings by type and recalculate when quantities or payment method change.

Prepaid discount applies only when the shopper selects and successfully pays online; switching to COD removes it.

Offer priority, eligibility, expiry and stackability must be configurable. The client must approve a simple precedence rule for v1.

The system should support a maximum discount per order and an optional margin floor based on cost price, if the client wants these controls.

Tax should be calculated using the accountant-approved treatment for discounts and product tax classification.

Refunds must use the stored order discount allocation so partial refunds can be calculated consistently.

Illustrative example for approval: three items at Rs 500 each; a buy-three offer gives 15% off (Rs 225); an additional prepaid offer gives 5% off the discounted amount (Rs 63.75). The subtotal before shipping becomes Rs 1,211.25. The client must confirm whether this stacking behavior is desired.

8. Checkout, payment and COD

Shopper continues as guest or signs in using the client-approved method.

Shopper enters/selects delivery address and provides mobile number and pincode.

System checks serviceability, COD availability and shipping options.

Shopper chooses online payment or COD and sees the final itemized total.

For online payment, create a pending-payment order and confirm only after server-side gateway verification. For COD, confirm according to the approved verification rule.

Use the client’s existing Razorpay account, subject to credentials, domain configuration and webhook setup.

Support payment methods enabled on that Razorpay account, expected to include UPI, cards, netbanking and wallets; client to confirm.

Verify payment signatures/webhooks server-side, process duplicate webhooks safely, and reconcile payment state with the order.

Set a configurable expiry for unpaid orders and release reserved inventory after expiry.

Support COD globally and optionally by product, pincode and order-value threshold. The client must provide exact rules and any COD fee.

Show a clear breakdown: item total, product savings, multi-item savings, coupon, prepaid savings, tax, shipping, COD fee and amount due.

9. Order operations, shipping and returns

Order statuses should provide a clear operational lifecycle: Pending Payment, Confirmed, Processing, Shipped, Out for Delivery, Delivered, Cancelled, Return Requested, Returned, RTO and Refunded. Status availability and transitions depend on payment and fulfilment state.

Admin can search/filter orders by number, customer, phone/email, date, status and payment method.

Order detail includes item and address snapshots, payment record, discount/tax breakdown, timeline, notes and notification history.

Permitted staff can update status, add tracking information, print invoice/packing slip and request full or partial refund.

Shipping aggregator integration is proposed; Shiprocket is a candidate from the initial brief, but provider/account availability must be confirmed.

Customer can request cancellation before shipment and a return within the configured product return window. Return approval, pickup, inspection and refund steps must be visible to staff.

Stock movements for reservation, shipment, cancellation and return must be recorded. COD remittance reconciliation is optional pending the chosen courier workflow.

10. WhatsApp and email communications

Event

Customer message

Channel and rule

Order placed

Order number, items/total, payment status and support path

Email and/or WhatsApp; channel preference and provider to be confirmed.

Payment confirmed or failed

Payment outcome and next action

Send after verified server-side result; do not treat browser redirect as proof.

Order status changes

Status, tracking link where available, support contact

Send for agreed statuses; avoid duplicate messages for retries.

Shipment dispatched

Courier/tracking reference and link

Send once tracking is available.

Cancellation/refund/return

Decision and refund or return progress

Send after the corresponding admin/system action.

WhatsApp order updates require an approved WhatsApp Business setup and an appropriate messaging provider/API. Costs, template approval, opt-in and provider selection are client decisions.

Record consent/preferences where required and provide a clear support route. Message content must avoid exposing sensitive payment details.

Email templates should be branded and include order reference, status, support details and links as applicable.

Admin should be able to see whether a notification was queued, sent, failed or retried; retry safely without duplicate customer messages.

WhatsApp contact button is a separate customer-initiated enquiry flow; it does not itself enable automated order notifications.

11. GST, invoices and financial records

Capture seller legal name, GSTIN, registered address/state, PAN if needed, invoice prefix/series, logo and signatory details in store settings.

Store HSN and tax classification on each product/variant as approved by the client’s accountant.

Snapshot product name, SKU, HSN, price, tax rate and applied discounts on each order so later catalogue edits do not alter historical invoices.

Generate invoice/credit note documents for applicable order and refund events; use sequential invoice numbering that is not reused.

For intra-state and inter-state supplies, show the tax split approved by the client’s accountant. Tax exemption, shipping/COD fee treatment, rounding, place of supply and invoice timing require validation.

Provide sales and tax summaries with CSV export for accountant review. GSTR filing is excluded unless separately scoped.

The client’s accountant must approve representative invoices and discount/tax examples before launch. The system will apply configured classifications and rules; it cannot determine the legal correctness of client-supplied GST data.

12. Data and integrations

Area

Data / integration requirement

Products

Product, category, variant, SKU, media, price, GST attributes and stock.

Customers

Name, mobile, email, addresses, communication consent/preferences and account data as approved.

Orders

Immutable item/address/price snapshots, payment state, taxes, discounts, fulfilment and status history.

Razorpay

Payment creation, server verification, webhook processing, refunds and reconciliation.

WhatsApp

Business messaging provider/API for approved templates and delivery status; contact link for shopper enquiries.

Email

Transactional sender/domain and templates; delivery failure reporting.

Shipping

Rates/labels/tracking/webhooks through the provider selected by the client.

Shopify

Inventory/catalogue migration or synchronization plan. Historical order/customer migration and URL redirects require explicit confirmation.

Recommended data design: store monetary amounts in integer paise, preserve order snapshots, use soft deletion for key catalogue/customer records, and record stock changes in a ledger.

13. Non-functional requirements

Quality area

Requirement

Performance

Mobile product pages target LCP under 2.5 seconds on 4G; optimize and serve resized modern images; catalogue API target under 300 ms at p95 where measurable.

Scalability

Plan for launch traffic agreed with the client and provide a path to handle campaign spikes.

Availability and recovery

Target 99.5% monthly uptime; scheduled backups and a tested restore process.

Security

HTTPS, server-side authorization, input validation, rate limiting on login/OTP/checkout, secure secrets and protection against common web attacks.

Payments

Card data remains with the payment provider; verify webhooks and handle repeated events idempotently.

Privacy

Publish privacy and retention practices; support approved access, correction/export and deletion requests subject to business/legal retention rules.

Accessibility

Key shopping and checkout flows should target WCAG 2.1 AA.

SEO

Server-rendered or otherwise indexable product/category pages, structured data, sitemap and canonical URLs.

Observability

Error monitoring, uptime alerts and alerts for payment, webhook and notification failures.

Compatibility

Support current major versions of Chrome, Safari, Edge and Firefox, plus Android/iOS browsers.

14. Analytics and reporting

Track product views, search queries, add-to-cart, checkout start, payment choice, payment success/failure and completed orders.

Report orders and gross sales by date, product/category and payment method; show discount totals and prepaid share.

Show inventory and low-stock views for operations.

Provide CSV exports where useful for finance and catalogue management.

Agree analytics platform, consent behavior and baseline measurement before launch.

15. Acceptance criteria

Admin can create and publish a product with category, images, variant/SKU, stock, price and required GST attributes; the product appears correctly in the storefront.

Shopper can browse categories, search for a product, view complete product information and add the selected variant to a cart on mobile.

Shopper can place a prepaid order through Razorpay; the order is confirmed only after server-verified payment status.

Shopper can place a COD order when the configured eligibility rules allow it; the final amount includes the configured COD fee if any.

Prepaid savings appear only for online payment and are removed when the shopper changes to COD.

Configured multi-item offer applies correctly and the cart clearly shows the saving; totals match approved worked examples.

Shopper can open a WhatsApp enquiry with the correct business contact and, where approved, product context.

Agreed order events send the correct WhatsApp and/or email message, and failed sends can be identified and retried without duplicate notifications.

Order status, payment and shipping references are visible to authorized staff and to the customer through the approved tracking route.

A sample invoice and credit note match accountant-approved tax, discount, rounding and numbering examples.

Staff permissions prevent restricted actions such as refunds or revenue-report access.

Reports reconcile to test orders and invoices for an agreed test period.

16. Delivery approach

Phase

Outcome

1. Discovery and decisions

Confirm Shopify strategy, client rules, catalogue, content, integrations, roles, acceptance examples and launch constraints.

2. Foundation and design

Approve user flows and visual design; establish environments, data model, access control and integration credentials.

3. Catalogue and storefront

Deliver categories, product administration, inventory and core browse/search/product/cart experiences.

4. Offers and checkout

Implement offer rules, Razorpay, COD eligibility, address/shipping rules and order creation.

5. Operations and communication

Deliver order management, WhatsApp/email notifications, shipping integration, invoices and reports.

6. Launch readiness

Run functional, security, performance and client acceptance review; migrate approved data, train staff and launch.

The earlier 16-week estimate assumes a small cross-functional team and timely client decisions. Re-estimate after the Shopify approach, launch catalogue, tax/discount rules and provider integrations are confirmed.

17. Assumptions and client decisions

Decision

Current understanding

Client confirmation needed

Shopify strategy

Existing Shopify store lacks required customization.

Replace Shopify, extend it with custom integrations, or use a hybrid approach?

Launch catalogue

Many fast-moving products across different categories.

Category tree, number of products/variants, who supplies content and images?

Market and entity

Initial brief assumes India and INR.

Confirm seller GST registration and launch geography.

Razorpay

Client already has an account.

Confirm account access, enabled methods, webhook/domain setup and refund workflow.

WhatsApp

Contact button and order-status notifications requested.

Business number, provider/API, message events, templates, opt-in and budget.

Email

Order notifications requested.

Sender domain, channel preference and templates.

Offers

Prepaid and multi-product offers requested.

Exact percentages/tiers, caps, coupon interaction, dates and discount priority.

COD

COD required.

Fee, maximum/minimum order, blocked pincodes/products and verification policy.

GST/invoicing

GST information captured per product; invoices expected.

Accountant-approved classification, invoice timing, shipping/fee tax, e-invoice/e-way-bill need.

Returns

Return rules expected.

Return windows by product, eligibility and refund process.

Shipping

Aggregator integration may be needed.

Current courier/provider, rates, tracking, COD remittance needs.

Accounts

Shopper accounts may be useful.

Guest checkout, OTP/email login and order lookup preference.

Data migration

Shopify catalogue likely relevant.

Products, customers, orders, URLs, SEO redirects and inventory to migrate?

Brand and ownership

Client supplies brand/product content.

Domain, logo, hosting owner, budget and launch date.

18. Key risks and mitigations

Risk

Mitigation

Shopify rebuild scope is unclear

Decide replace/extend/hybrid before architecture and estimate; inventory existing custom apps and workflows.

Offer rules conflict or reduce margin

Approve precedence and stacking examples; cap discounts; verify calculations with automated test cases.

Incorrect GST/HSN data

Require client/accountant review and approve sample invoices before launch.

WhatsApp setup or template approval delays

Start provider/account setup early; agree an email fallback for critical order events.

COD refusals increase fulfilment cost

Configure COD eligibility and verification rules; monitor refusal/RTO rate.

Late catalogue/content delivery

Provide spreadsheet template and content checklist early; agree launch catalogue freeze date.

Payment or webhook failures

Use server-side verification, idempotency, monitoring and reconciliation.

Provider onboarding delays

Confirm Razorpay, courier and messaging provider access during discovery.

Appendix A. V1 boundaries at a glance

A successful first release lets the client manage a multi-category catalogue, publish complete GST-classified products, configure transparent prepaid and multi-item offers, accept Razorpay payments and eligible COD orders, manage fulfilment, and send the agreed customer notifications. Shopify replacement or coexistence, WhatsApp provider setup, migration depth, exact discount rules and accountant-approved tax treatment remain client decisions before implementation.

Trending Products E-commerce Platform  