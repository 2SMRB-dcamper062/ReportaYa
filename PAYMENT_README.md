Stripe Payment Integration (local)
--------------------------------

This project includes a minimal Express server to create Stripe Checkout sessions.

Setup steps (local):

1. Install dependencies:

   npm install stripe express @stripe/stripe-js

2. Create environment variables (example .env):

   STRIPE_SECRET_KEY=sk_test_...
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_PRICE_CENTS=499
   DOMAIN=http://localhost:3000

3. Start the checkout server:

   node server/checkout-server.js

4. Start the frontend (in another terminal):

   npm run dev

5. Open the app and go to the Shop → Comprar Premium → "Pagar con tarjeta".

Notes:
- This is a minimal example. For production you must secure your server, use HTTPS, and handle webhooks to confirm payments and update user records server-side.
- The frontend uses dynamic import of `@stripe/stripe-js` and expects `VITE_STRIPE_PUBLISHABLE_KEY` available at build time or via window. You may need to expose it in your Vite env.
