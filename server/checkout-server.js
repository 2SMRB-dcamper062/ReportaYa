// Simple Express server to create a Stripe Checkout session.
// Usage: set STRIPE_SECRET_KEY and STRIPE_PRICE_CENTS (e.g., 499 for 4.99 EUR), and DOMAIN (e.g., http://localhost:3000)

const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  try {
    const domain = process.env.DOMAIN || 'http://localhost:3000';
    const amount = parseInt(process.env.STRIPE_PRICE_CENTS || '499', 10);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: 'ReportaYa Premium' },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${domain}/?checkout=success`,
      cancel_url: `${domain}/?checkout=cancel`,
      customer_email: req.body?.email || undefined,
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error('Stripe create session error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Checkout server running on port ${PORT}`));
