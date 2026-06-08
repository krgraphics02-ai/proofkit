import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });
  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (!customers.data.length) return res.status(404).json({ error: 'Client Stripe non trouvé' });
    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 1 });
    if (!subscriptions.data.length) return res.status(404).json({ error: 'Abonnement actif non trouvé' });
    await stripe.subscriptions.cancel(subscriptions.data[0].id);
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    await supabase.from('restaurants').update({ subscribed: false }).eq('id', req.body.restoId);
    res.status(200).json({ success: true });
  } catch(e) {
    console.error('Cancel error:', e);
    res.status(500).json({ error: e.message });
  }
}