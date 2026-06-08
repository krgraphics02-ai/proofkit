import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, restoId } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      metadata: { restoId },
      subscription_data: { metadata: { restoId }, trial_period_days: 7 },
      line_items: [{ price: 'price_1TexoL0Wx88BiTNpehvSpD2R', quantity: 1 }],
      success_url: 'https://proofkit.fr',
      cancel_url: 'https://proofkit.fr',
    });
    res.status(200).json({ url: session.url });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}