import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, restoId } = req.body;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data: resto } = await supabase.from('restaurants').select('trial_used').eq('id', restoId).single();
    const trialUsed = resto?.trial_used || false;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      metadata: { restoId },
      subscription_data: { metadata: { restoId }, ...(trialUsed ? {} : { trial_period_days: 7 }) },
      line_items: [{ price: 'price_1TexoL0Wx88BiTNpehvSpD2R', quantity: 1 }],
      success_url: 'https://proofkit.fr',
      cancel_url: 'https://proofkit.fr',
    });
    res.status(200).json({ url: session.url });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}