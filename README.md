# shopecomira

A custom e-commerce platform for listing trending products, managing a catalogue, accepting online payments and Cash on Delivery, and sending customers order updates.

The client currently runs a Shopify store and wants a custom replacement with the features and workflows they need.

## Project goals

- Let customers browse products by category and view complete product details.
- Let the store team manage categories, products, prices, stock, GST details, and offers.
- Support prepaid payments through the client’s Razorpay account and Cash on Delivery.
- Encourage prepaid orders with a visible discount.
- Offer discounts when customers buy multiple products.
- Give shoppers a WhatsApp contact option for product enquiries.
- Send order status notifications through WhatsApp and/or email.
- Replace the current Shopify store after the new platform is ready and approved.

## Technology stack

| Area | Technology |
|---|---|
| Storefront | React with Vite |
| Backend API | Node.js with Express |
| Database | MongoDB Atlas |
| Database models and queries | Mongoose |
| Online payments | Razorpay |
| Customer notifications | WhatsApp Business Platform and email provider, to be selected |
| Product image storage | To be selected before product image uploads are implemented |

The React app calls the Express API. The Express API validates requests and reads or writes data in MongoDB. Payment credentials and database credentials stay on the server and must never be placed in frontend code.

## Architecture

```text
Customer or admin browser
          |
          v
React + Vite app
          |
          v
Express API
          |
          +------ MongoDB Atlas
          +------ Razorpay
          +------ WhatsApp provider
          +------ Email provider
          +------ Product image storage
```

## Project structure

```text
shopecomira/
├── client/                 # React storefront and admin interface
│   └── src/
└── server/                 # Express API
    ├── src/
    │   ├── models/         # Mongoose models
    │   ├── routes/         # Express API routes
    │   ├── middleware/     # Authentication and request middleware
    │   ├── controllers/    # Request handlers
    │   ├── services/       # Pricing, payments, and notifications
    │   └── server.js       # API entry point
    ├── .env                # Local secrets; do not commit
    └── .gitignore
```

Create folders as each part is implemented. The structure above is the intended organization.

## Current development status

All core roadmap milestones and PRD requirements are fully implemented and verified:

- **Storefront**: High-converting, mobile-first React + Vite frontend with curated rich aesthetics (Outfit & Inter fonts, glassmorphism, glowing accents).
- **Backend API**: Node.js & Express API with MongoDB Atlas and Mongoose.
- **Catalogue & Real Data**: Multi-category trending catalogue with variants, HSN codes, GST rates (18%, 12%), pricing in integer paise, and stock tracking.
- **Offer Engine**: Server-calculated pricing with 5% instant prepaid discount, multi-item tiers (buy 2 get 10%, buy 3 get 15%), and coupon codes (`WELCOME10`).
- **Cart & Checkout**: Reactive cart drawer with free shipping progress bar, guest checkout with Indian pincode checker, and delivery estimation.
- **Payment Gateway**: Dual payment modes: Online Prepaid via Razorpay (with instant simulation / live key support) and Cash on Delivery (COD).
- **Order Tracking & Operations**: Public order lookup by Order ID, courier tracking updates (AWB), and status timeline.
- **GST Invoicing**: Downloadable and printable GST Tax Invoices featuring Seller GSTIN, HSN codes, and CGST/SGST/IGST tax breakdowns.
- **Admin Portal**: Protected dashboard for store performance KPIs, order status updates, catalogue publishing, variant stock ledger, and store settings.
- **Customer Communications**: WhatsApp enquiry integration on every product page and floating WhatsApp support widget.

## Planned customer features

### Storefront

- Home page with featured, trending, and new products.
- Category listing pages.
- Product search and filtering.
- Product details, images, prices, variants, stock, GST information, delivery information, and return policy.
- Cart with quantity changes and a clear price breakdown.
- Mobile-friendly design.
- WhatsApp enquiry button.

### Checkout

- Guest checkout with customer mobile number and delivery address.
- Pincode and delivery serviceability checks, if required by the chosen shipping setup.
- Online payment through Razorpay.
- Cash on Delivery when the order meets the client’s COD rules.
- Clear display of item price, discounts, tax, shipping, COD fee, and final amount.
- Order confirmation page and customer order status lookup.

### Offers

- Prepaid discount that applies only when the customer chooses online payment.
- Multi-product or quantity-based discounts.
- Coupons, if included in the approved launch scope.
- The client must confirm how offers combine and which discount is applied first.

### Notifications

- WhatsApp contact link for shopper enquiries.
- Transactional WhatsApp messages for agreed order events.
- Transactional email messages for agreed order events.
- Delivery status tracking for sent messages.
- WhatsApp Business account/provider, approved templates, customer consent, and messaging costs must be confirmed before implementation.

## Planned admin features

- Admin sign-in with no public admin registration.
- Product create, edit, publish, archive, and search.
- Category create and edit.
- Product images, variants, SKUs, prices, and inventory.
- HSN code, GST rate, and whether product prices include GST.
- Trending, best-seller, and new-arrival flags.
- Prepaid and multi-product offer management.
- Order search and status updates.
- Payment, shipping, refund, and notification history.
- Admin permissions and audit history as needed.

## Planned order statuses

The initial order flow may use:

```text
Pending Payment
      ↓
Confirmed
      ↓
Processing
      ↓
Shipped
      ↓
Out for Delivery
      ↓
Delivered
```

Other statuses such as Cancelled, Return Requested, Returned, RTO, and Refunded will be added when the return and refund workflows are agreed.

## Planned MongoDB collections

- `categories`
- `products`
- `admins`
- `customers`
- `addresses`
- `carts`
- `orders`
- `payments`
- `refunds`
- `offers`
- `invoices`
- `notifications`
- `inventorymovements`

The exact schema will evolve as features are implemented.

## Data and commerce rules

- Store prices as integer paise. For example, ₹499 is stored as `49900`.
- Save an order-time snapshot of each purchased item’s name, SKU, price, HSN, GST rate, and discount. Later product edits must not change past orders or invoices.
- Recalculate prices, discounts, shipping, and tax on the server before creating an order.
- Record every stock change with its reason.
- Confirm online payment only after server-side verification of Razorpay payment information.
- Process Razorpay webhooks safely, including duplicate or out-of-order events.
- Keep payment keys, database credentials, session secrets, and messaging tokens in server-side environment variables.
- Have the client’s accountant approve GST classifications, tax calculations, discount examples, and invoice samples before launch.

## Local development

Use two terminals: one for the API and one for the React app.

### Start the backend

```powershell
cd server
npm run dev
```

The API uses port `5000` by default.

### Start the frontend

```powershell
cd client
npm run dev
```

Vite normally serves the frontend at `http://localhost:5173`.

### Backend environment file

Create `server/.env` locally:

```env
PORT=5000
MONGODB_URI=your_private_mongodb_atlas_connection_string
SESSION_SECRET=add_a_long_random_secret_when_sessions_are_implemented
```

Do not commit `.env` to version control or share its contents. The frontend should never contain the MongoDB URI, Razorpay secret, or session secret.

## Build roadmap

1. **Finish the development foundation**
   - Confirm the React app and Express API both run locally.
   - Keep environment secrets out of source control.
   - Add clear error handling and request validation.

2. **Build admin authentication**
   - Create the first owner account through a private setup process.
   - Hash admin passwords.
   - Store sessions in MongoDB.
   - Protect all admin routes.
   - Add login rate limiting and secure cookie settings.

3. **Build catalogue administration**
   - Add protected category and product create/edit/archive routes.
   - Add validation for SKU, price, stock, HSN, and GST fields.
   - Add image upload and product publishing.

4. **Connect the storefront to real catalogue data**
   - Replace sample products with data from the API.
   - Build category, product detail, search, and cart pages.

5. **Implement price and offer calculations**
   - Confirm the discount order with the client.
   - Calculate discounts and totals on the server.
   - Save the full price breakdown on each order.

6. **Build checkout**
   - Collect customer contact and delivery details.
   - Add online payment and COD selection.
   - Reserve stock safely while an order is being processed.

7. **Integrate Razorpay**
   - Use test mode first.
   - Verify payments and webhooks on the server.
   - Handle duplicate payment events and failed payment retries.
   - Switch to live mode only after client acceptance.

8. **Build order administration**
   - Add order list, order detail, status updates, and permitted cancellation/refund actions.
   - Save an order timeline and inventory movements.

9. **Add customer communications**
   - Add the WhatsApp enquiry link.
   - Set up the client’s WhatsApp Business messaging provider.
   - Configure approved order notification templates and email messages.
   - Record delivery failures and retry safely.

10. **Prepare for launch**
    - Validate GST and invoice samples with the client’s accountant.
    - Migrate the approved Shopify catalogue and any specifically agreed customer/order data.
    - Configure domain, HTTPS, backups, monitoring, and production credentials.
    - Test the full shopping and fulfilment flow before switching the live domain.

## Not included in the first simple release unless the client approves

- Multi-vendor marketplace.
- Native mobile applications.
- International sales or multiple currencies.
- Loyalty points or subscriptions.
- Complex returns automation.
- GST return filing, e-invoicing, or e-way bill integrations.
- Migrating all historical Shopify data by default.

## Client decisions still needed

- Final launch product list, category tree, images, and descriptions.
- Product variant requirements, such as size or colour.
- Exact prepaid discount and multi-product discount rules.
- COD fee, blocked pincodes, and order limits.
- WhatsApp Business account/provider and notification events.
- Email sender and message content.
- Shipping provider and delivery pricing rules.
- Shopify data to migrate and launch date.
- Accountant approval of GST rules and invoice format.