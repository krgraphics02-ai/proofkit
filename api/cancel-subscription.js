import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { restoId } = req.body;
  if (!restoId) return res.status(400).json({ error: 'restoId requis' });
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    let sub = null;
    for (const status of ['active', 'trialing', 'past_due']) {
      const subs = await stripe.subscriptions.list({ limit: 100, status });
      sub = subs.data.find(s => s.metadata?.restoId === restoId);
      if (sub) break;
    }
    if (!sub) return res.status(404).json({ error: 'Abonnement non trouvé' });
    await stripe.subscriptions.cancel(sub.id);
    await supabase.from('restaurants').update({ subscribed: false }).eq('id', restoId);
    const { data: resto } = await supabase.from('restaurants').select('*').eq('id', restoId).single();
    const { data: user } = await supabase.from('users').select('*').eq('restaurant_id', restoId).eq('role', 'manager').single();
    if (user && resto) {
      await fetch('https://proofkit.fr/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'subscription_cancelled', email: user.email, name: user.name, restoName: resto.name })
      });
    }
    res.status(200).json({ success: true });
  } catch(e) {
    console.error('Cancel error:', e);
    res.status(500).json({ error: e.message });
  }
}