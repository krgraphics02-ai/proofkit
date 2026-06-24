import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { restoId } = req.body;
  if (!restoId) return res.status(400).json({ error: 'restoId requis' });
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    // Annule l'abonnement Stripe s'il existe
    for (const status of ['active', 'trialing', 'past_due']) {
      const subs = await stripe.subscriptions.list({ limit: 100, status });
      const sub = subs.data.find(s => s.metadata?.restoId === restoId);
      if (sub) { await stripe.subscriptions.cancel(sub.id); break; }
    }

    // Supprime les photos du storage
    const { data: records } = await supabase.from('records').select('img_src, img_src_2').eq('restaurant_id', restoId);
    if (records) {
      const paths = [];
      records.forEach(r => {
        [r.img_src, r.img_src_2].forEach(url => {
          if (url && url.includes('/proofs/')) paths.push(url.split('/proofs/')[1]);
        });
      });
      if (paths.length) await supabase.storage.from('proofs').remove(paths);
    }

    // Supprime les données
    await supabase.from('records').delete().eq('restaurant_id', restoId);
    await supabase.from('users').delete().eq('restaurant_id', restoId);
    await supabase.from('restaurants').delete().eq('id', restoId);

    res.status(200).json({ success: true });
  } catch(e) {
    console.error('Delete account error:', e);
    res.status(500).json({ error: e.message });
  }
}