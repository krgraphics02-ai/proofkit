import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  if (event.type === 'customer.subscription.created' || event.type === 'invoice.payment_succeeded') {
    const customerId = event.data.object.customer;
    try {
      const customer = await stripe.customers.retrieve(customerId);
      const email = customer.email;
      if (email) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
        await supabase.from('restaurants').update({ subscribed: true }).eq('email', email);
        const { data: user } = await supabase.from('users').select('*').eq('email', email).eq('role', 'manager').single();
        const { data: resto } = await supabase.from('restaurants').select('*').eq('email', email).single();
        if (user && resto) {
          await fetch('https://proofkit.fr/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'subscription_activated', email: user.email, name: user.name, restoName: resto.name })
          });
        }
      }
    } catch(e) {
      console.error('Webhook error:', e);
    }
  }

  res.status(200).json({ received: true });
}