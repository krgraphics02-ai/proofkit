import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { type, email, name, restoName } = req.body;
    let subject, html;

    if (type === 'welcome') {
      subject = 'Bienvenue sur ProofKit !';
      html = '<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><h1 style="color:#00C27C">Bienvenue sur ProofKit, ' + name + ' !</h1><p>Votre espace <strong>' + restoName + '</strong> est pr\u00eat.</p><p>Vous b\u00e9n\u00e9ficiez de <strong>7 jours gratuits</strong> pour tester toutes les fonctionnalit\u00e9s.</p><a href="https://proofkit.fr" style="display:inline-block;background:#00C27C;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:16px">Acc\u00e9der \u00e0 mon espace</a><p style="margin-top:32px;color:#999;font-size:13px">R\u00e9siliation possible \u00e0 tout moment</p></div>';
    }

if (type === 'subscription_cancelled') {
      subject = 'Votre abonnement ProofKit a \u00e9t\u00e9 r\u00e9sili\u00e9';
      html = '<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><h1 style="color:#00C27C">Votre abonnement a \u00e9t\u00e9 r\u00e9sili\u00e9</h1><p>Bonjour <strong>' + name + '</strong>,</p><p>Votre abonnement ProofKit Pro pour <strong>' + restoName + '</strong> a bien \u00e9t\u00e9 r\u00e9sili\u00e9.</p><p>Vous pouvez vous r\u00e9abonner \u00e0 tout moment sur <a href="https://proofkit.fr">proofkit.fr</a>.</p><p style="margin-top:32px;color:#999;font-size:13px">Merci d\'avoir utilis\u00e9 ProofKit.</p></div>';
    }
    if (type === 'subscription_activated') {
      subject = 'Votre abonnement ProofKit est activ\u00e9 !';
      html = '<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><h1 style="color:#00C27C">Votre abonnement est activ\u00e9 !</h1><p>Bonjour <strong>' + name + '</strong>,</p><p>Votre abonnement ProofKit Pro pour <strong>' + restoName + '</strong> est maintenant actif.</p><p>Vous avez acc\u00e8s \u00e0 toutes les fonctionnalit\u00e9s.</p><a href="https://proofkit.fr" style="display:inline-block;background:#00C27C;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:16px">Acc\u00e9der \u00e0 mon espace</a><p style="margin-top:32px;color:#999;font-size:13px">14,99\u20ac/mois \u00b7 R\u00e9siliation possible \u00e0 tout moment</p></div>';
    }

    const { data, error } = await resend.emails.send({ from: 'ProofKit <hello@proofkit.fr>', to: email, subject, html });
    if (error) return res.status(400).json({ error });
    res.status(200).json({ success: true, data });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}