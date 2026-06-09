import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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
    return res.status(400).json({ error: e.message });
  }
  if (event.type === 'invoice.payment_failed' || event.type === 'customer.subscription.deleted') {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      const obj = event.data.object;
      let restoId = obj.metadata?.restoId;
      if (!restoId && obj.subscription) {
        const sub = await stripe.subscriptions.retrieve(obj.subscription);
        restoId = sub.metadata?.restoId;
      }
      if (restoId) {
        await supabase.from('restaurants').update({ subscribed: false }).eq('id', restoId);
      } else {
        const customerId = obj.customer;
        if (customerId) {
          const customer = await stripe.customers.retrieve(customerId);
          if (customer.email) {
            await supabase.from('restaurants').update({ subscribed: false }).eq('email', customer.email);
          }
        }
      }
    } catch(e) {
      console.error('Webhook payment_failed error:', e);
    }
  }

  if (event.type === 'checkout.session.completed' || event.type === 'customer.subscription.created' || event.type === 'invoice.payment_succeeded') {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      const obj = event.data.object;
      let restoId = obj.metadata?.restoId;
      if (!restoId && obj.subscription) {
        const sub = await stripe.subscriptions.retrieve(obj.subscription);
        restoId = sub.metadata?.restoId;
      }
      let resto = null;
      if (restoId) {
        const { data } = await supabase.from('restaurants').select('*').eq('id', restoId).single();
        resto = data;
      }
      if (!resto) {
        const emailsToTry = [];
        if (obj.customer_details?.email) emailsToTry.push(obj.customer_details.email);
        if (obj.customer_email) emailsToTry.push(obj.customer_email);
        if (obj.customer) {
          const customer = await stripe.customers.retrieve(obj.customer);
          if (customer.email) emailsToTry.push(customer.email);
        }
        for (const email of [...new Set(emailsToTry)]) {
          const { data } = await supabase.from('restaurants').select('*').eq('email', email).single();
          if (data) { resto = data; break; }
        }
      }
      if (resto) {
        await supabase.from('restaurants').update({ subscribed: true, trial_used: true }).eq('id', resto.id);
        const { data: user } = await supabase.from('users').select('*').eq('restaurant_id', resto.id).eq('role', 'manager').single();
        if (user) {
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