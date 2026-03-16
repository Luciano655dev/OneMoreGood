# Commerce Setup

This app now uses hosted `Stripe Checkout` for payments and U.S. shipping collection.

## What the app does now

- Collects cart items in the Next.js storefront
- Opens a hosted Stripe Checkout page
- Collects payment, U.S. shipping address, and phone number in Stripe
- Redirects buyers to success/cancel pages in this app
- Accepts Stripe webhooks for paid orders
- Sends an internal paid-order email to `ORDERS_TO` if Resend is configured

## What you still need to do

### 1. Finish Stripe account setup

- Create or complete your Stripe account
- Add your legal business/nonprofit details
- Connect the bank account where payouts should go
- Enable Stripe customer emails in the Stripe dashboard if you want Stripe receipts sent automatically

Money flow:

- Customer pays on Stripe Checkout
- Stripe deducts fees
- Remaining balance is paid out by Stripe to your connected bank account

If you want funds allocated to Instituto Semear, you still need to transfer or account for that manually unless you later build a multi-party payouts flow.

### 2. Set environment variables

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_APP_URL`
- `APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `ORDERS_TO`
- `REDIS_URL` if you want Redis stock tracking active

### 3. Create the Stripe webhook

Add a webhook endpoint in Stripe:

- Local dev URL example: use Stripe CLI forwarding to `/api/stripe/webhook`
- Production URL example: `https://your-domain.com/api/stripe/webhook`

Subscribe to:

- `checkout.session.completed`

Use the signing secret from Stripe as `STRIPE_WEBHOOK_SECRET`.

### 4. Decide your shipping workflow

Current app behavior:

- Flat U.S. shipping: `$4.99`
- Tracking is not created by Stripe
- Tracking must be created after purchase when you buy a label

Recommended fulfillment workflow:

- Use Pirate Ship or Shippo to buy the label
- Copy the tracking number
- Email the tracking number to the customer manually at first

### 5. Operate refunds

Current policy pages:

- `/policies/shipping`
- `/policies/refunds`

Operationally:

- Refunds are issued from the Stripe dashboard
- Shipping fees should usually stay non-refundable unless the order is damaged or incorrect

### 6. Test before launch

- Run the app locally
- Add products to cart
- Start a checkout session
- Pay with Stripe test cards
- Verify redirect to `/checkout/success`
- Verify webhook delivery
- Verify the owner email arrives if Resend is configured

## Notes

- The app still uses the current product data file as the source of truth for titles, prices, and stock defaults.
- Stock is checked before checkout and decremented after `checkout.session.completed` when Redis is configured.
- Tracking numbers are not stored in the app yet. That can be added later as an admin feature.
