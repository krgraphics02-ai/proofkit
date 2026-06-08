import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  let event;
  let rawBody = '';

  await new Promise((resolve, reject) => {
    req.on('data', chunk => rawBody += chunk);
    req.on('end', resolve);
    req.on('error', reject);
  });

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error('Webhook signature error:', e.message);
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
      console.error('Webhook processing error:', e);
    }
  }

  res.status(200).json({ received: true });
}